import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyInput {
  propertyType: string;
  category: string;
  type: string;
  location: string;
  size: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  currency: string;
  furnishingStatus: string;
  amenities: string[];
  ewaIncluded: boolean;
  uniqueSellingPoints: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property } = await req.json() as { property: PropertyInput };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating content for property:", property);

    const systemPrompt = `You are a professional real estate listing content engine. Generate property advertisements in both English and Arabic.

IMPORTANT RULES:
1. For Instagram captions: Use emojis strategically, keep it catchy and engaging with a clear call-to-action
2. For Property Finder: Use structured, detailed, professional descriptions
3. For other websites: Use SEO-friendly, comprehensive descriptions
4. Always translate locations to Arabic properly (e.g., Manama = المنامة, Riffa = الرفاع, Juffair = الجفير)
5. Convert all numbers to Arabic numerals (٠١٢٣٤٥٦٧٨٩) in Arabic versions
6. If bedrooms or bathrooms are not provided (empty string), DO NOT mention them at all
7. Include relevant trending Bahrain real estate hashtags for Instagram posts

For Instagram hashtags, include a mix of:
- General: #BahrainRealEstate #BahrainProperty #PropertyBahrain #RealEstateBahrain
- Location-specific based on the property location
- Property type specific hashtags
- Trending hashtags like #LuxuryLiving #DreamHome #InvestInBahrain #BahrainHomes

Respond ONLY with valid JSON in this exact format:
{
  "propertyFinderEN": "English Property Finder description",
  "propertyFinderAR": "Arabic Property Finder description",
  "instagramEN": "English Instagram caption with emojis and hashtags",
  "instagramAR": "Arabic Instagram caption with emojis and hashtags",
  "websiteEN": "English website description",
  "websiteAR": "Arabic website description"
}`;

    const userPrompt = `Generate real estate listing content for this property:

Property Type: ${property.propertyType}
Category: ${property.category}
Type: ${property.type}
Location: ${property.location}
Size: ${property.size} sqm
${property.bedrooms ? `Bedrooms: ${property.bedrooms}` : ''}
${property.bathrooms ? `Bathrooms: ${property.bathrooms}` : ''}
Price: ${property.price} ${property.currency}
Furnishing: ${property.furnishingStatus}
Amenities: ${property.amenities.join(', ')}
EWA Included: ${property.ewaIncluded ? 'Yes' : 'No'}
Unique Selling Points: ${property.uniqueSellingPoints}

Generate professional, attractive content that highlights the property's best features. Make the Instagram captions engaging with relevant emojis and include the latest trending Bahrain real estate hashtags.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response content:", content);

    // Parse the JSON response from AI
    let generatedContent;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0].trim();
      }
      generatedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
