export type PropertyCategory = 'Residential' | 'Commercial' | 'Investment';

export type PropertyType = 
  | 'Land'
  | 'Villa'
  | 'Apartment'
  | 'Office'
  | 'Shop'
  | 'Store'
  | 'Land Planning'
  | 'Building'
  | 'Compound'
  | 'Farm'
  | 'Projects'
  | 'Factory'
  | 'Medical Facility';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export interface PropertyInput {
  propertyType: PropertyType | '';
  category: PropertyCategory | '';
  location: string;
  size: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  currency: string;
  furnishingStatus: FurnishingStatus | '';
  amenities: string[];
  ewaIncluded: boolean;
  uniqueSellingPoints: string;
}

export interface GeneratedContent {
  propertyFinderEN: string;
  propertyFinderAR: string;
  instagramEN: string;
  instagramAR: string;
  websiteEN: string;
  websiteAR: string;
}
