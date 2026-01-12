import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyInput {
  propertyType: string;
  category: string;
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
  landClassification: string;
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
2. For Property Finder: Generate BOTH a catchy title (max 100 chars) AND a detailed description optimized with Property Finder SEO keywords
3. For other websites: Use SEO-friendly, comprehensive descriptions
4. Always translate locations to Arabic properly (e.g., Manama = المنامة, Riffa = الرفاع, Juffair = الجفير)
5. Convert all numbers to Arabic numerals (٠١٢٣٤٥٦٧٨٩) in Arabic versions
6. If bedrooms or bathrooms are not provided (empty string), DO NOT mention them at all
7. Include relevant trending Bahrain real estate hashtags for Instagram posts
8. If land classification is provided, include it in the description (e.g., "RA - Residential A zone")

LAND CLASSIFICATIONS:
- RA, RB, RC, RD: Residential zones (A is highest density)
- BA, BB, BC, BD: Business zones
- CA, CB: Commercial zones
- IA, IB: Industrial zones

PROPERTY FINDER KEYWORDS (use relevant ones naturally in the description):
- Property Types: Villa, Apartment, Flat, Studio, Penthouse, Duplex, Townhouse, Compound, Whole Building, Bulk Units, Land, Commercial, Retail, Office, Shop, Warehouse, Factory, Farm, Labor Camp
- Features: Furnished, Semi Furnished, Unfurnished, Balcony, Sea View, City View, Garden View, Pool View, Private Pool, Shared Pool, Gym, Parking, Covered Parking, Security, CCTV, Concierge, Maid's Room, Driver's Room, Storage, Laundry, Built-in Wardrobes, Central AC, Split AC, Kitchen Appliances, Upgraded, Renovated, Brand New, Ready to Move, High Floor, Low Floor, Corner Unit, End Unit
- Amenities: Swimming Pool, Gymnasium, Children's Play Area, BBQ Area, Clubhouse, Tennis Court, Basketball Court, Squash Court, Sauna, Steam Room, Jacuzzi, Spa, Reception, Lobby, Elevator, Service Elevator, Backup Generator, Water Tank, Landscaped Garden, Rooftop Terrace, Private Beach Access, Beach Access, Marina Access, Golf Course View, Waterfront, Seafront
- Location Terms: Prime Location, Strategic Location, Central Location, Accessible Location, Near Schools, Near Hospital, Near Mall, Near Metro, Near Public Transport, Near Mosque, Near Beach, Near Highway, Gated Community, Family Community, Expatriate Community
- Condition: Well Maintained, Excellent Condition, Good Condition, Needs Renovation, Under Construction, Off Plan, Completed, Move-in Ready, Vacant, Tenanted, Rented, Investment Property
- Payment Terms: Negotiable, Flexible Payment, Monthly Payment, Yearly Payment, Multiple Cheques, EWA Included, Exclusive, Direct from Owner, No Commission, Freehold, Leasehold
- Size Terms: Spacious, Cozy, Compact, Large, Extra Large, Open Plan, Split Level, Loft Style, High Ceiling
- Arabic Keywords: فيلا, شقة, استوديو, بنتهاوس, دوبلكس, تاون هاوس, مفروشة, شبه مفروشة, غير مفروشة, إطلالة بحرية, إطلالة على المدينة, مسبح خاص, موقف سيارات, أمن, صالة رياضية, حديقة, قريب من المدارس, قريب من المستشفى, موقع متميز, جاهز للسكن, ممتاز, واسع

For Instagram hashtags, include a mix of:
- General: #BahrainRealEstate #BahrainProperty #PropertyBahrain #RealEstateBahrain
- Location-specific based on the property location
- Property type specific hashtags
- Trending hashtags like #LuxuryLiving #DreamHome #InvestInBahrain #BahrainHomes #BahrainForSale #BahrainForRent #PropertyForSale #PropertyForRent #RealEstateAgent #BahrainLuxury #GulfRealEstate #MiddleEastProperty

Respond ONLY with valid JSON in this exact format:
{
  "propertyFinderTitleEN": "Catchy English title for Property Finder (max 100 chars)",
  "propertyFinderTitleAR": "Arabic title for Property Finder (max 100 chars)",
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
Location: ${property.location}
Size: ${property.size} sqm
${property.landClassification ? `Land Classification: ${property.landClassification}` : ''}
${property.bedrooms ? `Bedrooms: ${property.bedrooms}` : ''}
${property.bathrooms ? `Bathrooms: ${property.bathrooms}` : ''}
Price: ${property.price} ${property.currency}
Furnishing: ${property.furnishingStatus}
Amenities: ${property.amenities.join(', ')}
EWA Included: ${property.ewaIncluded ? 'Yes' : 'No'}
Unique Selling Points: ${property.uniqueSellingPoints}

Generate professional, attractive content that highlights the property's best features. Include a catchy Property Finder title and detailed description. Make the Instagram captions engaging with relevant emojis and include the latest trending Bahrain real estate hashtags.`;

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
