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
  agent: string;
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

CRITICAL GUARDRAILS - PROPERTY FINDER (MUST FOLLOW):
1. Property Finder descriptions (propertyFinderEN and propertyFinderAR) MUST be 100% emoji-free
2. ABSOLUTELY NO emojis are allowed in Property Finder content - not a single emoji character
3. If you include even ONE emoji in Property Finder descriptions, the content will be rejected
4. Property Finder = TEXT ONLY, no symbols, no emojis, no special characters except standard punctuation

CRITICAL FIRST PARAGRAPH GUARDRAILS (MUST FOLLOW):
1. The FIRST paragraph of EVERY description MUST:
   - Clearly state the property category (Residential/Commercial/Investment)
   - Clearly describe the property type (Villa/Apartment/Land/Office/Shop/etc.)
   - Include a compelling statement that relates to both the category and property type
   - If the property type is "Land" or "Land Planning", MUST include the land classification code and its meaning in the first paragraph
   
Example First Paragraphs:
- For Residential Villa: "This stunning residential villa represents the pinnacle of family living in [Location]. Designed for those seeking a luxurious lifestyle, this property combines elegance with functionality."
- For Commercial Office: "Prime commercial office space perfect for businesses seeking a prestigious address. This professional workspace offers everything a growing company needs in a strategic location."
- For Land with RA classification: "Exceptional residential land parcel classified as RA (Residential Zone A), ideal for developing your dream home or investment property. This prime plot offers maximum building potential in [Location]."
- For Investment Building: "Outstanding investment opportunity featuring a multi-unit building designed for maximum ROI. This commercial investment property delivers steady rental income with strong appreciation potential."

IMPORTANT RULES:
1. For Instagram captions: Use emojis strategically, keep it catchy and engaging with a clear call-to-action
2. For Property Finder: Generate BOTH a catchy title (max 50 chars) AND a detailed description (max 2000 chars) optimized with Property Finder SEO keywords. CRITICAL GUARDRAIL: propertyFinderEN and propertyFinderAR fields MUST contain ZERO emojis - they must be pure text only. Any emoji in these fields is strictly FORBIDDEN and will cause rejection. Always include BOTH square meters AND square feet for property size.
3. For other websites: Use SEO-friendly, comprehensive descriptions
4. Always translate locations to Arabic properly (e.g., Manama = المنامة, Riffa = الرفاع, Juffair = الجفير)
5. Convert all numbers to Arabic numerals (٠١٢٣٤٥٦٧٨٩) in Arabic versions
6. If bedrooms or bathrooms are not provided (empty string), DO NOT mention them at all
7. Include relevant trending Bahrain real estate hashtags for Instagram posts, always include Carlton Real Estate branded hashtags like #CarltonRealEstate #CarltonBahrain #CarltonProperties #CarltonHomes #TeamCarlton
8. If land classification is provided, include it in the FIRST paragraph with its meaning (e.g., "RA - Residential A zone" or "COM - Commercial Showroom Area")
9. CRITICAL CONTACT INFO RULES - DO NOT INCLUDE ANY CONTACT INFO IN YOUR RESPONSE:
   - For Property Finder (propertyFinderEN and propertyFinderAR): NO contact information
   - For Instagram (instagramEN and instagramAR): DO NOT include contact info - it will be added automatically
   - For Website (websiteEN and websiteAR): DO NOT include contact info - it will be added automatically
   - NEVER include "Call us", "Contact", agent names, phone numbers, or branch info in your response

10. Property Finder descriptions should be professional, detailed, and completely emoji-free

11. PROPERTY FINDER STRUCTURE (MUST FOLLOW THIS EXACT FORMAT):
    
    Property Finder descriptions MUST follow this professional structure:
    
    [Opening Paragraph]
    - Compelling introduction highlighting property type, category, and key selling points
    - Use sophisticated language (e.g., "Experience unmatched elegance", "Discover exceptional luxury")
    - Include location and main features
    
    Property Features: (or Property Details:)
    MUST include ALL relevant details from the property data:
    - [Number] Large/Spacious en-suite bedrooms with built-in wardrobes (if bedrooms provided)
    - Master bedroom with walk-in closet and luxury en-suite (if luxury property)
    - Maid's Room with private bathroom (if applicable)
    - [Number] Stylish/Modern Bathrooms in total (always include)
    - Expansive/Generous Living Area with floor-to-ceiling windows
    - Elegant Dining Space - ideal for entertaining
    - Gourmet/Fully-equipped Kitchen fully fitted with premium/modern appliances
    - Private Balconies/Terrace with [view type] views
    - High-Quality Furnishings and Designer Finishes (if furnished)
    - Central AC/Split AC throughout
    - [Size] sqm ([Size] sq ft) of living space
    - Private/Covered Parking for [number] vehicles
    - Laundry room, Storage room (if applicable)
    [List EVERY property detail with descriptive adjectives]
    
    Exclusive Amenities: (or Building Facilities: for apartments)
    List ALL amenities from property data professionally:
    - Breathtaking [View Type] Views from multiple vantage points
    - Access to Swimming Pool/Infinity Pool (adults and children's pool)
    - State-of-the-art Gym and Fitness Center
    - Children's Play Area (if family property)
    - 24/7 Security and CCTV Surveillance
    - Concierge Services (if luxury)
    - Landscaped Gardens and Common Areas
    - BBQ and Entertainment Areas
    - EWA Included (if applicable)
    [List each amenity with professional descriptions]
    
    Prime Location - [Area Name]
    [2-3 sentences about area prestige, character, and lifestyle benefits]
    
    Nearby Amenities:
    - Major shopping malls and retail destinations
    - International schools and educational institutions
    - Healthcare facilities
    - Fine dining restaurants and cafes
    - Quick access to major highways and business districts
    
    _______________________________________________________________
    
    **Asking Price BD [Price] (Negotiable) or **Monthly Rent BD [Price]
    
    IMPORTANT: Always include BOTH square meters and square feet in the description (e.g., "[X] sqm ([Y] sq ft)")
    
    CRITICAL FORMATTING RULES:
    • Use "Property Features:" for main property details section
    • Use "Exclusive Amenities:" (villas) or "Building Facilities:" (apartments)
    • Each bullet MUST start with - or • on its own line
    • Use descriptive adjectives: Large, Spacious, Stylish, Expansive, Gourmet, Premium, Elegant, Modern
    • Be specific: "4 Large en-suite bedrooms" not "4 bedrooms"
    • Include property size in BOTH sqm AND sq ft: "[X] sqm ([Y] sq ft)" in Property Features
    • Always mention parking if available
    • Use separator line _______________________________________________________________ before price
    • Format: **Asking Price BD [amount] (Negotiable) for sale or **Monthly Rent BD [amount] for rent
    • NO contact info anywhere - added automatically by system
    • NO emojis - ZERO TOLERANCE for Property Finder

EMOJI USAGE RULES (FOR INSTAGRAM AND WEBSITE ONLY - NOT FOR PROPERTY FINDER):
- Property Finder (propertyFinderEN, propertyFinderAR): ABSOLUTELY FORBIDDEN - NO EMOJIS ALLOWED UNDER ANY CIRCUMSTANCES
- Instagram and Website: Use emojis strategically
- NEVER use ✅ checkmarks in any description
- Use descriptive emojis that represent each feature/word:
  📍 for Location
  📏 or 📐 for Size
  🛏️ for Bedrooms
  🚿 for Bathrooms
  🌟 for Brand New/Highlights
  🚗 for Strategic location/Access
  💎 for Key Features/Highlights
  🛋️ for Furnished/Semi-Furnished
  🔌 or ⚡️ for Electricity
  💧 for Water/EWA
  🏊‍♂️ for Pool
  🌳 for Garden
  📱 for Smart Home
  🛗 for Elevator
  🏙️ for City View
  🌅 for Sea View/Sunset
  👨‍👩‍👧‍👦 for Family/Maid's Room
  📦 for Storage
  💪 for Gym
  🔒 for Security
  🅿️ for Parking
  💰 for Price/Rent
  🏠 for Property Type
  🏢 for Building/Apartment
  🏡 for Villa

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
  "propertyFinderTitleEN": "Catchy English title for Property Finder (max 50 chars)",
  "propertyFinderTitleAR": "Arabic title for Property Finder (max 50 chars)",
  "propertyFinderEN": "English Property Finder description with bullet points for property details (max 2000 chars, NO EMOJIS, NO CONTACT INFO, include both sqm and sq ft)",
  "propertyFinderAR": "Arabic Property Finder description with bullet points for property details (max 2000 chars, NO EMOJIS, NO CONTACT INFO, include both sqm and sq ft)",
  "instagramEN": "English Instagram caption with emojis and hashtags ONLY - NO CONTACT INFO",
  "instagramAR": "Arabic Instagram caption with emojis and hashtags ONLY - NO CONTACT INFO",
  "websiteEN": "English website description with emojis ONLY - NO CONTACT INFO",
  "websiteAR": "Arabic website description with emojis ONLY - NO CONTACT INFO"
}`;

    // Agent mapping with branch information
    const agentMap: { [key: string]: { name: string, nameAR: string, branch: string, branchAR: string, branchPhone: string } } = {
      '36943000': { name: 'Ahmed Al Aali', nameAR: 'أحمد العلي', branch: 'Saar Branch', branchAR: 'رقم المكتب (فرع سار)', branchPhone: '☎️ +973 1759 1999' },
      '36504411': { name: 'Hana Adel', nameAR: 'هناء عادل', branch: 'Seef Office (Main Branch)', branchAR: 'رقم المكتب (الفرع الرئيسي بضاحية السيف)', branchPhone: '☎️ +973 1729 2827' },
      '36503399': { name: 'Hesham Ismaeel', nameAR: 'هشام اسماعيل', branch: 'Saar Branch', branchAR: 'رقم المكتب (فرع سار)', branchPhone: '☎️ +973 1759 1999' },
      '36960222': { name: 'Mirna Kamal', nameAR: 'ميرنه كمال', branch: 'Amwaj Island Branch', branchAR: 'رقم المكتب (فرع جزر أمواج)', branchPhone: '☎️ +973 1600 6000' },
      '36744755': { name: 'Mohamed Abdulla', nameAR: 'محمد عبدالله', branch: 'Saar Branch', branchAR: 'رقم المكتب (فرع سار)', branchPhone: '☎️ +973 1759 1999' },
      '36503388': { name: 'Sara Ali', nameAR: 'سارة علي', branch: 'Carlton Real Estate', branchAR: 'كارلتون العقارية', branchPhone: '☎️ +973 1771 3000' },
      '36504477': { name: 'Violeta Abboud', nameAR: 'فيوليت عبود', branch: 'Amwaj Island Branch', branchAR: 'رقم المكتب (فرع جزر أمواج)', branchPhone: '☎️ +973 1600 6000' },
      '38218600': { name: 'Husain Mansoor', nameAR: 'حسين منصور', branch: 'Saar Branch', branchAR: 'رقم المكتب (فرع سار)', branchPhone: '☎️ +973 1759 1999' },
      '32319900': { name: 'Abdulla Hasan', nameAR: 'عبدالله حسن', branch: 'Saar Branch', branchAR: 'رقم المكتب (فرع سار)', branchPhone: '☎️ +973 1759 1999' },
      '38213300': { name: 'Ali Hasan', nameAR: 'علي حسن', branch: 'Saar Branch', branchAR: 'رقم المكتب (فرع سار)', branchPhone: '☎️ +973 1759 1999' },
      '36504499': { name: 'Masoud Ali', nameAR: 'مسعود علي', branch: 'Saar Branch', branchAR: 'رقم المكتب (فرع سار)', branchPhone: '☎️ +973 1759 1999' },
      '36390222': { name: 'Ibrahim Mohamed', nameAR: 'إبراهيم محمد', branch: 'Carlton Real Estate', branchAR: 'كارلتون العقارية', branchPhone: '☎️ +973 1771 3000' }
    };

    const agentInfo = agentMap[property.agent] || { name: 'Carlton Real Estate', nameAR: 'كارلتون العقارية', branch: 'Carlton Real Estate', branchAR: 'كارلتون العقارية', branchPhone: '☎️ +973 1771 3000' };
    const agentPhone = property.agent || '17713000';

    // Calculate square feet from square meters (1 sqm = 10.764 sq ft)
    const sizeSqFt = property.size ? Math.round(property.size * 10.764) : null;

    const userPrompt = `Generate real estate listing content for this property:

Property Type: ${property.propertyType}
Category: ${property.category}
Location: ${property.location}
Size: ${property.size} sqm (${sizeSqFt} sq ft)
${property.landClassification ? `Land Classification: ${property.landClassification}` : ''}
${property.bedrooms ? `Bedrooms: ${property.bedrooms}` : ''}
${property.bathrooms ? `Bathrooms: ${property.bathrooms}` : ''}
Price: ${property.price} ${property.currency}
Furnishing: ${property.furnishingStatus}
Amenities: ${property.amenities.join(', ')}
EWA Included: ${property.ewaIncluded ? 'Yes' : 'No'}
Unique Selling Points: ${property.uniqueSellingPoints}

CRITICAL: DO NOT include any contact information (agent name, phone, branch) in your response. Contact info will be added automatically by the system.

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
      
      // Post-process to strip emojis from Property Finder descriptions
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F000}-\u{1F02F}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu;
      
      if (generatedContent.propertyFinderEN) {
        // Remove emojis but preserve newlines - only collapse multiple spaces, not newlines
        generatedContent.propertyFinderEN = generatedContent.propertyFinderEN
          .replace(emojiRegex, '')
          .replace(/[^\S\n]+/g, ' ') // Replace multiple spaces (but not newlines) with single space
          .replace(/\n /g, '\n') // Remove space after newline
          .replace(/ \n/g, '\n') // Remove space before newline
          .trim();
        // Limit to 2000 characters
        if (generatedContent.propertyFinderEN.length > 2000) {
          generatedContent.propertyFinderEN = generatedContent.propertyFinderEN.substring(0, 2000).trim();
        }
      }
      if (generatedContent.propertyFinderAR) {
        generatedContent.propertyFinderAR = generatedContent.propertyFinderAR
          .replace(emojiRegex, '')
          .replace(/[^\S\n]+/g, ' ')
          .replace(/\n /g, '\n')
          .replace(/ \n/g, '\n')
          .trim();
        // Limit to 2000 characters
        if (generatedContent.propertyFinderAR.length > 2000) {
          generatedContent.propertyFinderAR = generatedContent.propertyFinderAR.substring(0, 2000).trim();
        }
      }
      if (generatedContent.propertyFinderTitleEN) {
        generatedContent.propertyFinderTitleEN = generatedContent.propertyFinderTitleEN.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
        // Limit to 50 characters
        if (generatedContent.propertyFinderTitleEN.length > 50) {
          generatedContent.propertyFinderTitleEN = generatedContent.propertyFinderTitleEN.substring(0, 50).trim();
        }
      }
      if (generatedContent.propertyFinderTitleAR) {
        generatedContent.propertyFinderTitleAR = generatedContent.propertyFinderTitleAR.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
        // Limit to 50 characters
        if (generatedContent.propertyFinderTitleAR.length > 50) {
          generatedContent.propertyFinderTitleAR = generatedContent.propertyFinderTitleAR.substring(0, 50).trim();
        }
      }
      
      // Build contact blocks
      const contactBlockEN = `\n\nCall us today for more details! 📞\nContact ${agentInfo.name}\n${agentPhone}\n\n${agentInfo.branch}\n${agentInfo.branchPhone}`;
      const contactBlockAR = `\n\nاتصل بنا اليوم لمزيد من التفاصيل! 📞\nللتواصل ${agentInfo.nameAR}\n${agentPhone}\n\n${agentInfo.branchAR}\n${agentInfo.branchPhone}`;
      
      // Helper to strip ALL contact info variations from English text
      const stripContactEN = (text: string): string => {
        if (!text) return text;
        return text
          .replace(/\n*Call us[^\n]*(\n[^\n#]*){0,6}/gi, '')
          .replace(/\n*Contact\s+[A-Za-z\s]+\n[^\n#]*/gi, '')
          .replace(/\n*(Saar Branch|Seef Office|Amwaj Island Branch|Carlton Real Estate)[^\n]*/gi, '')
          .replace(/\n*☎️[^\n]*/gi, '')
          .replace(/📞[^\n]*/g, '')
          .trim();
      };
      
      // Helper to strip ALL contact info variations from Arabic text
      const stripContactAR = (text: string): string => {
        if (!text) return text;
        return text
          .replace(/\n*اتصل بنا[^\n]*(\n[^\n#]*){0,6}/gi, '')
          .replace(/\n*للتواصل\s+[^\n]+/gi, '')
          .replace(/\n*(رقم المكتب|فرع سار|فرع السار|مكتب السيف|فرع جزر أمواج|كارلتون العقارية)[^\n]*/gi, '')
          .replace(/\n*☎️[^\n]*/gi, '')
          .replace(/📞[^\n]*/g, '')
          .trim();
      };
      
      // For Instagram: Insert contact block BEFORE hashtags
      if (generatedContent.instagramEN) {
        let cleanedInstagramEN = stripContactEN(generatedContent.instagramEN);
        const hashtagMatchEN = cleanedInstagramEN.match(/([\s\S]*?)((?:\s*#\w+)+\s*)$/);
        if (hashtagMatchEN) {
          generatedContent.instagramEN = hashtagMatchEN[1].trim() + contactBlockEN + '\n\n' + hashtagMatchEN[2].trim();
        } else {
          generatedContent.instagramEN = cleanedInstagramEN + contactBlockEN;
        }
      }
      
      if (generatedContent.instagramAR) {
        let cleanedInstagramAR = stripContactAR(generatedContent.instagramAR);
        const hashtagMatchAR = cleanedInstagramAR.match(/([\s\S]*?)((?:\s*#[\w\u0600-\u06FF_]+)+\s*)$/);
        if (hashtagMatchAR) {
          generatedContent.instagramAR = hashtagMatchAR[1].trim() + contactBlockAR + '\n\n' + hashtagMatchAR[2].trim();
        } else {
          generatedContent.instagramAR = cleanedInstagramAR + contactBlockAR;
        }
      }
      
      // For Website: Strip all contact info and add once
      if (generatedContent.websiteEN) {
        generatedContent.websiteEN = stripContactEN(generatedContent.websiteEN) + contactBlockEN;
      }
      if (generatedContent.websiteAR) {
        generatedContent.websiteAR = stripContactAR(generatedContent.websiteAR) + contactBlockAR;
      }
      
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
