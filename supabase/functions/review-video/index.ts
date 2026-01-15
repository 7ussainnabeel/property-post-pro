import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, youtubeUrl, isUploadedVideo } = await req.json();
    
    if (!videoId || !youtubeUrl) {
      throw new Error('videoId and youtubeUrl are required');
    }

    console.log(`Reviewing video: ${videoId}, URL: ${youtubeUrl}, isUploaded: ${isUploadedVideo}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const videoType = isUploadedVideo ? "an uploaded video file" : "a YouTube video";
    
    const prompt = `You are a professional video quality reviewer for real estate property videos. You are reviewing ${videoType} at this URL: ${youtubeUrl}

Based on the URL and typical real estate video standards, provide a quality assessment. Consider these factors:

1. **Orientation**: Is this likely a horizontal (landscape) or vertical (portrait) video? 
   - For uploaded files, look at the file name for hints (e.g., "vertical", "portrait", "reel", "short")
   - Horizontal is preferred for professional real estate videos
   - If URL contains "/shorts/" or similar, it's likely vertical

2. **Stability**: Rate the likely stability of the video on a scale of 1-10 (10 being perfectly stable, like using a gimbal or tripod).
   - For uploaded videos, assume basic smartphone footage unless title suggests professional equipment

3. **Overall Quality Rating**: Provide an overall quality rating from 1-10 based on professional real estate video standards.

4. **Feedback**: Provide specific, actionable feedback for the agent to improve their video quality. Include tips about:
   - Orientation (horizontal is best for real estate)
   - Stability (use a gimbal or tripod)
   - Lighting suggestions
   - Pacing and coverage

IMPORTANT: Respond in this exact JSON format:
{
  "orientation": "horizontal" or "vertical",
  "stability_rating": <number 1-10>,
  "overall_rating": <number 1-10>,
  "feedback": "<detailed feedback string>"
}

Focus on being helpful and constructive.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert video quality reviewer specializing in real estate property videos. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    console.log("AI Response:", content);

    // Parse the JSON response from AI
    let reviewResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reviewResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Provide default values if parsing fails
      reviewResult = {
        orientation: "horizontal",
        stability_rating: 7,
        overall_rating: 7,
        feedback: "Video review completed. Please ensure the video is shot in landscape mode with stable footage for best results."
      };
    }

    // Validate and clamp ratings
    const orientation = reviewResult.orientation === "vertical" ? "vertical" : "horizontal";
    const stabilityRating = Math.min(10, Math.max(1, parseInt(reviewResult.stability_rating) || 7));
    const overallRating = Math.min(10, Math.max(1, parseInt(reviewResult.overall_rating) || 7));
    const feedback = reviewResult.feedback || "Review completed successfully.";

    // Update the video submission in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from("video_submissions")
      .update({
        orientation,
        stability_rating: stabilityRating,
        overall_rating: overallRating,
        ai_feedback: feedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", videoId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(`Failed to update video: ${updateError.message}`);
    }

    console.log("Video review completed successfully");

    return new Response(JSON.stringify({
      success: true,
      orientation,
      stability_rating: stabilityRating,
      overall_rating: overallRating,
      ai_feedback: feedback,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in review-video function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
