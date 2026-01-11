import { PropertyInput, GeneratedContent } from '@/types/property';

export function generateContent(input: PropertyInput): GeneratedContent {
  const { 
    propertyType, category, location, size, bedrooms, bathrooms, 
    price, currency, furnishingStatus, amenities, ewaIncluded, uniqueSellingPoints 
  } = input;

  const amenitiesList = amenities.join(', ');
  const ewaText = ewaIncluded ? 'EWA included' : 'EWA not included';
  const ewaTextAR = ewaIncluded ? 'شامل الكهرباء والماء' : 'غير شامل الكهرباء والماء';

  const hasBedrooms = bedrooms && bedrooms.trim() !== '';
  const hasBathrooms = bathrooms && bathrooms.trim() !== '';
  
  const bedroomsBathroomsEN = hasBedrooms && hasBathrooms 
    ? `• ${bedrooms} Bedrooms | ${bathrooms} Bathrooms`
    : hasBedrooms 
      ? `• ${bedrooms} Bedrooms`
      : hasBathrooms 
        ? `• ${bathrooms} Bathrooms`
        : '';

  const bedroomsBathroomsAR = hasBedrooms && hasBathrooms 
    ? `• ${bedrooms} غرف نوم | ${bathrooms} حمامات`
    : hasBedrooms 
      ? `• ${bedrooms} غرف نوم`
      : hasBathrooms 
        ? `• ${bathrooms} حمامات`
        : '';

  const bedroomsBathroomsShortEN = hasBedrooms && hasBathrooms 
    ? `${bedrooms} BR | ${bathrooms} BA | `
    : hasBedrooms 
      ? `${bedrooms} BR | `
      : hasBathrooms 
        ? `${bathrooms} BA | `
        : '';

  const bedroomsBathroomsShortAR = hasBedrooms && hasBathrooms 
    ? `${bedrooms} غرف نوم | ${bathrooms} حمام | `
    : hasBedrooms 
      ? `${bedrooms} غرف نوم | `
      : hasBathrooms 
        ? `${bathrooms} حمام | `
        : '';

  // Property Finder English
  const propertyFinderEN = `
${propertyType} for ${category === 'Investment' ? 'Investment' : 'Sale'} in ${location}

This exceptional ${propertyType?.toLowerCase()} presents an outstanding opportunity for ${category?.toLowerCase()} purposes. Located in the prestigious area of ${location}, this property offers ${size} sqm of premium living space.

Property Highlights:
${bedroomsBathroomsEN}
• Total Area: ${size} sqm
• ${furnishingStatus}
• ${ewaText}

Features & Amenities:
${amenities.map(a => `• ${a}`).join('\n')}

${uniqueSellingPoints ? `What Makes This Property Special:\n${uniqueSellingPoints}` : ''}

Price: ${currency} ${Number(price).toLocaleString()}

Contact us today to schedule a viewing and discover your perfect property in ${location}.
  `.trim().replace(/\n\n\n/g, '\n\n');

  // Property Finder Arabic
  const propertyFinderAR = `
${getArabicPropertyType(propertyType)} ${category === 'Investment' ? 'للاستثمار' : 'للبيع'} في ${location}

${getArabicPropertyType(propertyType)} استثنائية توفر فرصة رائعة لأغراض ${getArabicCategory(category)}. تقع في منطقة ${location} المرموقة، وتوفر هذه العقار ${size} متر مربع من المساحة المعيشية الفاخرة.

مميزات العقار:
${bedroomsBathroomsAR}
• المساحة الإجمالية: ${size} متر مربع
• ${getArabicFurnishing(furnishingStatus)}
• ${ewaTextAR}

المرافق والخدمات:
${amenities.map(a => `• ${getArabicAmenity(a)}`).join('\n')}

${uniqueSellingPoints ? `ما يميز هذا العقار:\n${uniqueSellingPoints}` : ''}

السعر: ${Number(price).toLocaleString()} ${currency}

تواصل معنا اليوم لحجز موعد معاينة واكتشف عقارك المثالي في ${location}.
  `.trim().replace(/\n\n\n/g, '\n\n');

  // Instagram English
  const instagramEN = `
🏠 ${propertyType?.toUpperCase()} FOR ${category === 'Investment' ? 'INVESTMENT' : 'SALE'} 📍 ${location}

✨ ${bedroomsBathroomsShortEN}${size} sqm
💰 ${currency} ${Number(price).toLocaleString()}

${amenities.slice(0, 4).map(a => `✅ ${a}`).join('\n')}

${uniqueSellingPoints ? `💎 ${uniqueSellingPoints.split('.')[0]}` : ''}

📩 DM us for more details!
#RealEstate #${location.replace(/\s/g, '')} #PropertyForSale #${propertyType?.replace(/\s/g, '')} #LuxuryLiving
  `.trim();

  // Instagram Arabic
  const instagramAR = `
🏠 ${getArabicPropertyType(propertyType)} ${category === 'Investment' ? 'للاستثمار' : 'للبيع'} 📍 ${location}

✨ ${bedroomsBathroomsShortAR}${size} م²
💰 ${Number(price).toLocaleString()} ${currency}

${amenities.slice(0, 4).map(a => `✅ ${getArabicAmenity(a)}`).join('\n')}

${uniqueSellingPoints ? `💎 ${uniqueSellingPoints.split('.')[0]}` : ''}

📩 راسلنا للمزيد من التفاصيل!
#عقارات #${location.replace(/\s/g, '')} #عقار_للبيع #استثمار_عقاري
  `.trim();

  // Website English
  const bedroomsLineEN = hasBedrooms ? `- Bedrooms: ${bedrooms}` : '';
  const bathroomsLineEN = hasBathrooms ? `- Bathrooms: ${bathrooms}` : '';
  const bedroomsLineAR = hasBedrooms ? `- غرف النوم: ${bedrooms}` : '';
  const bathroomsLineAR = hasBathrooms ? `- الحمامات: ${bathrooms}` : '';
  
  const descriptionEN = hasBedrooms && hasBathrooms 
    ? `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters and features ${bedrooms} spacious bedrooms and ${bathrooms} modern bathrooms.`
    : hasBedrooms 
      ? `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters and features ${bedrooms} spacious bedrooms.`
      : hasBathrooms 
        ? `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters and features ${bathrooms} modern bathrooms.`
        : `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters.`;

  const descriptionAR = hasBedrooms && hasBathrooms 
    ? `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${size} متر مربع ويضم ${bedrooms} غرف نوم واسعة و${bathrooms} حمامات عصرية.`
    : hasBedrooms 
      ? `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${size} متر مربع ويضم ${bedrooms} غرف نوم واسعة.`
      : hasBathrooms 
        ? `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${size} متر مربع ويضم ${bathrooms} حمامات عصرية.`
        : `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${size} متر مربع.`;

  const websiteEN = `
${propertyType} in ${location} | ${category} Property

Discover this remarkable ${propertyType?.toLowerCase()} situated in ${location}, one of the most sought-after locations in the region. ${descriptionEN}

Key Features:
- Property Type: ${propertyType}
- Category: ${category}
- Size: ${size} sqm
${bedroomsLineEN}
${bathroomsLineEN}
- Furnishing: ${furnishingStatus}
- Utilities: ${ewaText}

Amenities Include:
${amenitiesList}

${uniqueSellingPoints ? `Special Features: ${uniqueSellingPoints}` : ''}

Listed at ${currency} ${Number(price).toLocaleString()}, this property represents excellent value for those seeking quality ${category?.toLowerCase()} real estate in ${location}.

Contact our team today for more information or to arrange a private viewing.
  `.trim().replace(/\n\n\n/g, '\n\n').replace(/^\n/gm, '');

  // Website Arabic
  const websiteAR = `
${getArabicPropertyType(propertyType)} في ${location} | عقار ${getArabicCategory(category)}

اكتشف هذا ${getArabicPropertyType(propertyType)} الرائع الواقع في ${location}، إحدى أكثر المناطق المرغوبة في المنطقة. ${descriptionAR}

المواصفات الرئيسية:
- نوع العقار: ${getArabicPropertyType(propertyType)}
- الفئة: ${getArabicCategory(category)}
- المساحة: ${size} متر مربع
${bedroomsLineAR}
${bathroomsLineAR}
- التأثيث: ${getArabicFurnishing(furnishingStatus)}
- المرافق: ${ewaTextAR}

المرافق تشمل:
${amenities.map(a => getArabicAmenity(a)).join('، ')}

${uniqueSellingPoints ? `مميزات خاصة: ${uniqueSellingPoints}` : ''}

مدرج بسعر ${Number(price).toLocaleString()} ${currency}، يمثل هذا العقار قيمة ممتازة لمن يبحث عن عقار ${getArabicCategory(category)} عالي الجودة في ${location}.

تواصل مع فريقنا اليوم للحصول على مزيد من المعلومات أو لترتيب معاينة خاصة.
  `.trim().replace(/\n\n\n/g, '\n\n').replace(/^\n/gm, '');

  return {
    propertyFinderEN,
    propertyFinderAR,
    instagramEN,
    instagramAR,
    websiteEN,
    websiteAR,
  };
}

function getArabicPropertyType(type: string | undefined): string {
  const types: Record<string, string> = {
    'Villa': 'فيلا',
    'Apartment': 'شقة',
    'Land': 'أرض',
    'Office': 'مكتب',
    'Shop': 'محل',
    'Store': 'مخزن',
    'Building': 'مبنى',
    'Compound': 'مجمع',
    'Farm': 'مزرعة',
    'Factory': 'مصنع',
    'Medical Facility': 'منشأة طبية',
    'Land Planning': 'مخطط أرض',
    'Projects': 'مشاريع',
  };
  return types[type || ''] || type || 'عقار';
}

function getArabicCategory(category: string | undefined): string {
  const categories: Record<string, string> = {
    'Residential': 'سكني',
    'Commercial': 'تجاري',
    'Investment': 'استثماري',
  };
  return categories[category || ''] || category || '';
}

function getArabicFurnishing(status: string | undefined): string {
  const statuses: Record<string, string> = {
    'Furnished': 'مفروش',
    'Semi-Furnished': 'نصف مفروش',
    'Unfurnished': 'غير مفروش',
  };
  return statuses[status || ''] || status || '';
}

function getArabicAmenity(amenity: string): string {
  const amenities: Record<string, string> = {
    'Swimming Pool': 'مسبح',
    'Gym': 'صالة رياضية',
    'Parking': 'موقف سيارات',
    'Security': 'أمن',
    'Garden': 'حديقة',
    'Balcony': 'شرفة',
    'Central AC': 'تكييف مركزي',
    'Maid Room': 'غرفة خادمة',
    'Storage': 'مخزن',
    'Elevator': 'مصعد',
    'Sea View': 'إطلالة بحرية',
    'City View': 'إطلالة على المدينة',
    'Private Pool': 'مسبح خاص',
    'Smart Home': 'منزل ذكي',
    'Terrace': 'تراس',
  };
  return amenities[amenity] || amenity;
}
