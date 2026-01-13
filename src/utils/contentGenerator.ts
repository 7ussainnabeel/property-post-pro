import { PropertyInput, GeneratedContent } from '@/types/property';

export function generateContent(input: PropertyInput): GeneratedContent {
  const { 
    listingType, propertyType, category, location, size, buildingSize, bedrooms, bathrooms, 
    price, currency, furnishingStatus, amenities, ewaIncluded, uniqueSellingPoints,
    numberOfEntrances, numberOfFamilyHalls, numberOfLivingAreas, numberOfInternalKitchens,
    numberOfExternalKitchens, kitchenType, outsideQuarters, numberOfRoads
  } = input;

  const amenitiesList = amenities.join(', ');
  const ewaText = ewaIncluded ? 'EWA included' : 'EWA not included';
  const ewaTextAR = ewaIncluded ? 'شامل الكهرباء والماء' : 'غير شامل الكهرباء والماء';

  const hasBedrooms = bedrooms && bedrooms.trim() !== '';
  const hasBathrooms = bathrooms && bathrooms.trim() !== '';
  const hasBuildingSize = buildingSize && buildingSize.trim() !== '';
  const isVilla = propertyType === 'Villa';
  
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
  const titleEN = hasBedrooms && hasBathrooms 
    ? `${bedrooms}-Bedroom ${propertyType} for ${category === 'Investment' ? 'Investment' : 'Sale'} in ${location} | ${size} SQM | ${furnishingStatus}`
    : hasBedrooms 
      ? `${bedrooms}-Bedroom ${propertyType} for ${category === 'Investment' ? 'Investment' : 'Sale'} in ${location} | ${size} SQM | ${furnishingStatus}`
      : `${propertyType} for ${category === 'Investment' ? 'Investment' : 'Sale'} in ${location} | ${size} SQM | ${furnishingStatus}`;

  const propertyFinderEN = `
${titleEN}

PROPERTY DETAILS

🏠 Property Type: ${propertyType}
📋 Category: ${category}
📍 Location: ${location}
🎯 Purpose: ${category === 'Investment' ? 'Investment Opportunity' : 'For Sale'}

DESCRIPTION

We are pleased to present this distinguished ${propertyType?.toLowerCase()} located in the prime area of ${location}. This property represents an exceptional ${category?.toLowerCase()} opportunity${isVilla && hasBuildingSize ? `, featuring ${buildingSize} square meters of building space on a ${size} square meter plot` : isVilla ? `, offering a generous ${size} square meter plot` : `, offering ${size} square meters of thoughtfully designed space`}.

PROPERTY SPECIFICATIONS

${isVilla && hasBuildingSize ? `📐 Plot Size: ${size} sqm\n🏗️ Building Size: ${buildingSize} sqm` : `📐 Built-up Area: ${size} sqm`}${(propertyType === 'Land' || propertyType === 'Land Planning' || propertyType === 'Villa') && numberOfRoads ? `\n🛣️ Number of Roads: ${numberOfRoads}` : ''}${hasBedrooms ? `\n🛏️ Bedrooms: ${bedrooms}` : ''}${hasBathrooms ? `\n🚿 Bathrooms: ${bathrooms}` : ''}
${isVilla && numberOfEntrances ? `\n🚪 Entrances: ${numberOfEntrances}` : ''}${isVilla && numberOfFamilyHalls ? `\n👨‍👩‍👧‍👦 Family Halls: ${numberOfFamilyHalls}` : ''}${isVilla && numberOfLivingAreas ? `\n🛋️ Living Areas: ${numberOfLivingAreas}` : ''}${isVilla && kitchenType === 'Both' && (numberOfInternalKitchens || numberOfExternalKitchens) ? `\n🍳 Kitchens: ${numberOfInternalKitchens || '0'} Internal, ${numberOfExternalKitchens || '0'} External` : isVilla && kitchenType === 'Internal' && numberOfInternalKitchens ? `\n🍳 Internal Kitchens: ${numberOfInternalKitchens}` : isVilla && kitchenType === 'External' && numberOfExternalKitchens ? `\n🍳 External Kitchens: ${numberOfExternalKitchens}` : ''}${isVilla && outsideQuarters ? `\n🏠 Outside Quarters: Yes` : ''}
🛋️ Furnishing Status: ${furnishingStatus}
${ewaIncluded ? '⚡💧 Utilities: EWA Included!' : '🔌 Utilities: EWA Not Included'}

AMENITIES & FEATURES
${amenities.map(a => `${getAmenityEmoji(a)} ${a}`).join('\n')}
${uniqueSellingPoints ? `\n💎 ADDITIONAL HIGHLIGHTS\n${uniqueSellingPoints}` : ''}

PRICING

💰 Asking Price: BD ${Number(price).toLocaleString()}

For further information, property viewings, or to discuss this opportunity, please contact our property consultants at your earliest convenience.
  `.trim().replace(/\n\n\n/g, '\n\n');

  // Property Finder Arabic
  const locationAR = getArabicLocation(location);
  const priceAR = formatArabicPrice(price, currency);
  const sizeAR = toArabicNumerals(size);
  const bedroomsAR = toArabicNumerals(bedrooms);
  const bathroomsAR = toArabicNumerals(bathrooms);

  const bedroomsBathroomsARArabic = hasBedrooms && hasBathrooms 
    ? `• ${bedroomsAR} غرف نوم | ${bathroomsAR} حمامات`
    : hasBedrooms 
      ? `• ${bedroomsAR} غرف نوم`
      : hasBathrooms 
        ? `• ${bathroomsAR} حمامات`
        : '';

  const bedroomsBathroomsShortARArabic = hasBedrooms && hasBathrooms 
    ? `${bedroomsAR} غرف نوم | ${bathroomsAR} حمام | `
    : hasBedrooms 
      ? `${bedroomsAR} غرف نوم | `
      : hasBathrooms 
        ? `${bathroomsAR} حمام | `
        : '';

  const propertyFinderAR = `
${getArabicPropertyType(propertyType)} ${hasBedrooms ? `${bedroomsAR} غرف نوم` : ''} ${category === 'Investment' ? 'للاستثمار' : 'للبيع'} في ${locationAR} | ${sizeAR} متر مربع | ${getArabicFurnishing(furnishingStatus)}

تفاصيل العقار

🏠 نوع العقار: ${getArabicPropertyType(propertyType)}
📋 الفئة: ${getArabicCategory(category)}
📍 الموقع: ${locationAR}
🎯 الغرض: ${category === 'Investment' ? 'فرصة استثمارية' : 'للبيع'}

الوصف

يسرنا أن نقدم لكم هذا ${getArabicPropertyType(propertyType)} المتميز الواقع في المنطقة الرئيسية ${locationAR}. يمثل هذا العقار فرصة ${getArabicCategory(category)}ة استثنائية${isVilla && hasBuildingSize ? `، حيث يوفر ${toArabicNumerals(buildingSize)} متر مربع من المساحة المبنية على قطعة أرض ${sizeAR} متر مربع` : isVilla ? `، حيث يوفر قطعة أرض واسعة بمساحة ${sizeAR} متر مربع` : `، حيث يوفر ${sizeAR} متر مربع من المساحة المصممة بعناية`}.

مواصفات العقار

${isVilla && hasBuildingSize ? `📐 مساحة الأرض: ${sizeAR} متر مربع\n🏗️ المساحة المبنية: ${toArabicNumerals(buildingSize)} متر مربع` : `📐 المساحة المبنية: ${sizeAR} متر مربع`}${(propertyType === 'Land' || propertyType === 'Land Planning' || propertyType === 'Villa') && numberOfRoads ? `\n🛣️ عدد الشوارع: ${toArabicNumerals(numberOfRoads)}` : ''}${hasBedrooms ? `\n🛏️ غرف النوم: ${bedroomsAR}` : ''}${hasBathrooms ? `\n🚿 الحمامات: ${bathroomsAR}` : ''}
${isVilla && numberOfEntrances ? `\n🚪 المداخل: ${toArabicNumerals(numberOfEntrances)}` : ''}${isVilla && numberOfFamilyHalls ? `\n👨‍👩‍👧‍👦 صالات العائلة: ${toArabicNumerals(numberOfFamilyHalls)}` : ''}${isVilla && numberOfLivingAreas ? `\n🛋️ مناطق المعيشة: ${toArabicNumerals(numberOfLivingAreas)}` : ''}${isVilla && kitchenType === 'Both' && (numberOfInternalKitchens || numberOfExternalKitchens) ? `\n🍳 المطابخ: ${toArabicNumerals(numberOfInternalKitchens || '0')} داخلي، ${toArabicNumerals(numberOfExternalKitchens || '0')} خارجي` : isVilla && kitchenType === 'Internal' && numberOfInternalKitchens ? `\n🍳 المطابخ الداخلية: ${toArabicNumerals(numberOfInternalKitchens)}` : isVilla && kitchenType === 'External' && numberOfExternalKitchens ? `\n🍳 المطابخ الخارجية: ${toArabicNumerals(numberOfExternalKitchens)}` : ''}${isVilla && outsideQuarters ? `\n🏠 ملحق خارجي: نعم` : ''}
🛋️ حالة التأثيث: ${getArabicFurnishing(furnishingStatus)}
${ewaIncluded ? '⚡💧 المرافق: شامل الكهرباء والماء!' : '🔌 المرافق: غير شامل الكهرباء والماء'}

المرافق والخدمات
${amenities.map(a => `${getAmenityEmoji(a)} ${getArabicAmenity(a)}`).join('\n')}
${uniqueSellingPoints ? `\n💎 مميزات إضافية\n${uniqueSellingPoints}` : ''}

السعر

💰 السعر المطلوب: ${priceAR}

للمزيد من المعلومات أو لترتيب موعد معاينة أو لمناقشة هذه الفرصة، يرجى التواصل مع مستشاري العقارات لدينا في أقرب وقت ممكن.
  `.trim().replace(/\n\n\n/g, '\n\n');

  // Instagram English
  const instagramEN = `
🏠 ${propertyType?.toUpperCase()} FOR ${category === 'Investment' ? 'INVESTMENT' : 'SALE'}

📍 Location: ${location}${hasBedrooms ? `\n🛏️ ${bedrooms} Bedrooms` : ''}${hasBathrooms ? `\n🚿 ${bathrooms} Bathrooms` : ''}
${isVilla && hasBuildingSize ? `📐 Plot Size: ${size} SQM\n🏗️ Building Size: ${buildingSize} SQM` : `📐 Size: ${size} SQM`}
🛋️ ${furnishingStatus}
${ewaIncluded ? '⚡💧 EWA Included!' : ''}
💰 BD ${Number(price).toLocaleString()}

💎 Highlights:
${amenities.slice(0, 5).map(a => `${getAmenityEmoji(a)} ${a}`).join('\n')}
${uniqueSellingPoints ? `\n🌟 ${uniqueSellingPoints.split('.')[0]}` : ''}

📩 DM us for more details!
#RealEstate #${location.replace(/\s/g, '')} #PropertyForSale #${propertyType?.replace(/\s/g, '')} #LuxuryLiving #Bahrain
  `.trim();

  // Instagram Arabic
  const instagramAR = `
🏠 ${getArabicPropertyType(propertyType)} ${category === 'Investment' ? 'للاستثمار' : 'للبيع'}

📍 الموقع: ${locationAR}${hasBedrooms ? `\n🛏️ ${bedroomsAR} غرف نوم` : ''}${hasBathrooms ? `\n🚿 ${bathroomsAR} حمامات` : ''}
${isVilla && hasBuildingSize ? `📐 مساحة الأرض: ${sizeAR} م²\n🏗️ المساحة المبنية: ${toArabicNumerals(buildingSize)} م²` : `📐 المساحة: ${sizeAR} م²`}
🛋️ ${getArabicFurnishing(furnishingStatus)}
${ewaIncluded ? '⚡💧 شامل الكهرباء والماء!' : ''}
💰 ${priceAR}

💎 المميزات:
${amenities.slice(0, 5).map(a => `${getAmenityEmoji(a)} ${getArabicAmenity(a)}`).join('\n')}
${uniqueSellingPoints ? `\n🌟 ${uniqueSellingPoints.split('.')[0]}` : ''}

📩 راسلنا للمزيد من التفاصيل!
#عقارات #${locationAR.replace(/\s/g, '')} #عقار_للبيع #استثمار_عقاري #البحرين
  `.trim();

  // Website English
  const bedroomsLineEN = hasBedrooms ? `- Bedrooms: ${bedrooms}` : '';
  const bathroomsLineEN = hasBathrooms ? `- Bathrooms: ${bathrooms}` : '';
  const bedroomsLineAR = hasBedrooms ? `- غرف النوم: ${bedrooms}` : '';
  const bathroomsLineAR = hasBathrooms ? `- الحمامات: ${bathrooms}` : '';
  
  const descriptionEN = isVilla && hasBuildingSize 
    ? hasBedrooms && hasBathrooms 
      ? `This ${furnishingStatus?.toLowerCase()} villa features ${buildingSize} square meters of building space on a ${size} square meter plot, with ${bedrooms} spacious bedrooms and ${bathrooms} modern bathrooms.`
      : hasBedrooms 
        ? `This ${furnishingStatus?.toLowerCase()} villa features ${buildingSize} square meters of building space on a ${size} square meter plot, with ${bedrooms} spacious bedrooms.`
        : hasBathrooms 
          ? `This ${furnishingStatus?.toLowerCase()} villa features ${buildingSize} square meters of building space on a ${size} square meter plot, with ${bathrooms} modern bathrooms.`
          : `This ${furnishingStatus?.toLowerCase()} villa features ${buildingSize} square meters of building space on a ${size} square meter plot.`
    : hasBedrooms && hasBathrooms 
      ? `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters and features ${bedrooms} spacious bedrooms and ${bathrooms} modern bathrooms.`
      : hasBedrooms 
        ? `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters and features ${bedrooms} spacious bedrooms.`
        : hasBathrooms 
          ? `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters and features ${bathrooms} modern bathrooms.`
          : `This ${furnishingStatus?.toLowerCase()} property spans ${size} square meters.`;

  const descriptionAR = isVilla && hasBuildingSize 
    ? hasBedrooms && hasBathrooms 
      ? `تتميز هذه الفيلا ${getArabicFurnishing(furnishingStatus)} بمساحة مبنية ${toArabicNumerals(buildingSize)} متر مربع على قطعة أرض ${sizeAR} متر مربع، وتضم ${bedroomsAR} غرف نوم واسعة و${bathroomsAR} حمامات عصرية.`
      : hasBedrooms 
        ? `تتميز هذه الفيلا ${getArabicFurnishing(furnishingStatus)} بمساحة مبنية ${toArabicNumerals(buildingSize)} متر مربع على قطعة أرض ${sizeAR} متر مربع، وتضم ${bedroomsAR} غرف نوم واسعة.`
        : hasBathrooms 
          ? `تتميز هذه الفيلا ${getArabicFurnishing(furnishingStatus)} بمساحة مبنية ${toArabicNumerals(buildingSize)} متر مربع على قطعة أرض ${sizeAR} متر مربع، وتضم ${bathroomsAR} حمامات عصرية.`
          : `تتميز هذه الفيلا ${getArabicFurnishing(furnishingStatus)} بمساحة مبنية ${toArabicNumerals(buildingSize)} متر مربع على قطعة أرض ${sizeAR} متر مربع.`
    : hasBedrooms && hasBathrooms 
      ? `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${sizeAR} متر مربع ويضم ${bedroomsAR} غرف نوم واسعة و${bathroomsAR} حمامات عصرية.`
      : hasBedrooms 
        ? `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${sizeAR} متر مربع ويضم ${bedroomsAR} غرف نوم واسعة.`
        : hasBathrooms 
          ? `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${sizeAR} متر مربع ويضم ${bathroomsAR} حمامات عصرية.`
          : `يمتد هذا العقار ${getArabicFurnishing(furnishingStatus)} على مساحة ${sizeAR} متر مربع.`;

  const bedroomsLineARArabic = hasBedrooms ? `- غرف النوم: ${bedroomsAR}` : '';
  const bathroomsLineARArabic = hasBathrooms ? `- الحمامات: ${bathroomsAR}` : '';

  const websiteEN = `
${propertyType} in ${location} | ${category} Property

Discover this remarkable ${propertyType?.toLowerCase()} situated in ${location}, one of the most sought-after locations in the region. ${descriptionEN}

Key Features:
- Property Type: ${propertyType}
- Category: ${category}
${isVilla && hasBuildingSize ? `- Plot Size: ${size} sqm\n- Building Size: ${buildingSize} sqm` : `- Size: ${size} sqm`}
${bedroomsLineEN}
${bathroomsLineEN}
- Furnishing: ${furnishingStatus}
- Utilities: ${ewaText}

Amenities Include:
${amenitiesList}

${uniqueSellingPoints ? `Special Features: ${uniqueSellingPoints}` : ''}

Listed at BD ${Number(price).toLocaleString()}, this property represents excellent value for those seeking quality ${category?.toLowerCase()} real estate in ${location}.

Contact our team today for more information or to arrange a private viewing.
  `.trim().replace(/\n\n\n/g, '\n\n').replace(/^\n/gm, '');

  // Website Arabic
  const websiteAR = `
${getArabicPropertyType(propertyType)} في ${locationAR} | عقار ${getArabicCategory(category)}

اكتشف هذا ${getArabicPropertyType(propertyType)} الرائع الواقع في ${locationAR}، إحدى أكثر المناطق المرغوبة في المنطقة. ${descriptionAR}

المواصفات الرئيسية:
- نوع العقار: ${getArabicPropertyType(propertyType)}
- الفئة: ${getArabicCategory(category)}
${isVilla && hasBuildingSize ? `- مساحة الأرض: ${sizeAR} متر مربع\n- المساحة المبنية: ${toArabicNumerals(buildingSize)} متر مربع` : `- المساحة: ${sizeAR} متر مربع`}
${bedroomsLineARArabic}
${bathroomsLineARArabic}
- التأثيث: ${getArabicFurnishing(furnishingStatus)}
- المرافق: ${ewaTextAR}

المرافق تشمل:
${amenities.map(a => getArabicAmenity(a)).join('، ')}

${uniqueSellingPoints ? `مميزات خاصة: ${uniqueSellingPoints}` : ''}

مدرج بسعر ${priceAR}، يمثل هذا العقار قيمة ممتازة لمن يبحث عن عقار ${getArabicCategory(category)} عالي الجودة في ${locationAR}.

تواصل مع فريقنا اليوم للحصول على مزيد من المعلومات أو لترتيب معاينة خاصة.
  `.trim().replace(/\n\n\n/g, '\n\n').replace(/^\n/gm, '');

  return {
    propertyFinderTitleEN: `${propertyType} for ${category === 'Investment' ? 'Investment' : 'Sale/Rent'} in ${location}`,
    propertyFinderTitleAR: `${getArabicPropertyType(propertyType)} ${category === 'Investment' ? 'للاستثمار' : 'للبيع/للإيجار'} في ${locationAR}`,
    propertyFinderEN,
    propertyFinderAR,
    instagramEN,
    instagramAR,
    websiteEN,
    websiteAR,
  };
}

function getAmenityEmoji(amenity: string): string {
  const emojiMap: Record<string, string> = {
    'Swimming Pool': '🏊‍♂️',
    'Gym': '🏋️',
    'Parking': '🚗',
    'Security': '🔒',
    'Garden': '🌳',
    'Balcony': '🪟',
    'Central AC': '❄️',
    'Maid Room': '👤',
    'Storage': '📦',
    'Elevator': '🛗',
    'Sea View': '🌅',
    'City View': '🏙️',
    'Private Pool': '🏊',
    'Smart Home': '📱',
    'Terrace': '🌿',
  };
  return emojiMap[amenity] || '🔸';
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

function toArabicNumerals(num: string | number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
}

function formatArabicPrice(price: string, currency: string): string {
  const formattedNumber = Number(price).toLocaleString();
  const arabicNumber = toArabicNumerals(formattedNumber);
  return `${arabicNumber} دينار بحريني`;
}

function getArabicLocation(location: string): string {
  const locations: Record<string, string> = {
    // Bahrain
    'Juffair': 'الجفير',
    'Manama': 'المنامة',
    'Seef': 'السيف',
    'Riffa': 'الرفاع',
    'Muharraq': 'المحرق',
    'Amwaj Islands': 'جزر أمواج',
    'Amwaj': 'أمواج',
    'Budaiya': 'البديع',
    'Hamala': 'الهملة',
    'Saar': 'سار',
    'Janabiya': 'الجنبية',
    'Tubli': 'توبلي',
    'Isa Town': 'مدينة عيسى',
    'Hamad Town': 'مدينة حمد',
    'Busaiteen': 'البسيتين',
    'Hidd': 'الحد',
    'Diyar Al Muharraq': 'ديار المحرق',
    'Bahrain Bay': 'خليج البحرين',
    'Sanabis': 'السنابس',
    'Adliya': 'العدلية',
    'Hoora': 'الحورة',
    'Gudaibiya': 'القضيبية',
    'Zinj': 'الزنج',
    'Salmaniya': 'السلمانية',
    'Diplomatic Area': 'المنطقة الدبلوماسية',
    // UAE
    'Dubai': 'دبي',
    'Abu Dhabi': 'أبوظبي',
    'Sharjah': 'الشارقة',
    'Ajman': 'عجمان',
    'Downtown Dubai': 'وسط دبي',
    'Dubai Marina': 'مرسى دبي',
    'Palm Jumeirah': 'نخلة جميرا',
    'JBR': 'جي بي آر',
    'Business Bay': 'الخليج التجاري',
    // Saudi Arabia
    'Riyadh': 'الرياض',
    'Jeddah': 'جدة',
    'Dammam': 'الدمام',
    'Khobar': 'الخبر',
    'Mecca': 'مكة المكرمة',
    'Medina': 'المدينة المنورة',
    // General
    'City Center': 'وسط المدينة',
    'Waterfront': 'الواجهة البحرية',
  };
  
  // Check for exact match first
  if (locations[location]) {
    return locations[location];
  }
  
  // Check for partial matches (case insensitive)
  const lowerLocation = location.toLowerCase();
  for (const [eng, ar] of Object.entries(locations)) {
    if (lowerLocation.includes(eng.toLowerCase())) {
      return location.replace(new RegExp(eng, 'i'), ar);
    }
  }
  
  return location;
}
