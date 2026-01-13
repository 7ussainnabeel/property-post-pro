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

export type LandClassification = 'RA' | 'RB' | 'RC' | 'RD' | 'BA' | 'BB' | 'BC' | 'BD' | 'CA' | 'CB' | 'IA' | 'IB' | '';

export interface PropertyInput {
  propertyType: PropertyType | '';
  category: PropertyCategory | '';
  location: string;
  size: string;
  buildingSize?: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  currency: string;
  furnishingStatus: FurnishingStatus | '';
  amenities: string[];
  ewaIncluded: boolean;
  uniqueSellingPoints: string;
  landClassification: LandClassification;
}

export interface GeneratedContent {
  propertyFinderTitleEN: string;
  propertyFinderTitleAR: string;
  propertyFinderEN: string;
  propertyFinderAR: string;
  instagramEN: string;
  instagramAR: string;
  websiteEN: string;
  websiteAR: string;
}
