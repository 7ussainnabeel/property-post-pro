import { useState, useEffect } from 'react';
import { PropertyInput, PropertyCategory, PropertyType, FurnishingStatus, LandClassification, ListingType } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Bed, Bath, DollarSign, Sofa, Sparkles, Zap, X, Layers, RefreshCw, Home, TrendingUp, Map, Briefcase, ShoppingBag, Store, Factory, Hospital, MapPinned, Trees, FolderKanban, FileCheck, Route, Droplets, FileText, Lightbulb, Plug, UtensilsCrossed, Users, Package, User, Leaf, Waves, Wind, Camera, Shield, Shirt, Snowflake, Dumbbell, Flame, Clapperboard, Cpu, DoorClosed, Car, Mountain, Dog, Wifi, Gamepad2, Bell, UserCheck, Expand, ShoppingCart, Cuboid } from 'lucide-react';

const PROPERTY_TYPES: PropertyType[] = [
  'Land', 'Villa', 'Apartment', 'Office', 'Shop', 'Store', 
  'Land Planning', 'Building', 'Compound', 'Farm', 'Projects', 
  'Factory', 'Medical Facility'
];

const CATEGORIES: PropertyCategory[] = ['Residential', 'Commercial', 'Investment'];

const FURNISHING_OPTIONS: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

const LAND_CLASSIFICATIONS: { value: LandClassification; label: string }[] = [
  { value: 'AG', label: 'AG - Agricultural Areas' },
  { value: 'B3', label: 'B3 - Apartment Blocks - 3 Stories' },
  { value: 'B4', label: 'B4 - Apartment Blocks - 4 Stories' },
  { value: 'COM', label: 'COM - Commercial Showroom Area' },
  { value: 'BR5', label: 'BR5 - Connected Building Areas' },
  { value: 'RHA', label: 'RHA - Connected Residential Area - A' },
  { value: 'RHB', label: 'RHB - Connected Residential Area - B' },
  { value: 'RHC', label: 'RHC - Connected Residential Area - C' },
  { value: 'F', label: 'F - Frozen' },
  { value: 'RG', label: 'RG - Garden Residential Area' },
  { value: 'GB', label: 'GB - Green Building' },
  { value: 'DA', label: 'DA - Industrial Manufacturing Projects A' },
  { value: 'DB', label: 'DB - Industrial Manufacturing Projects B' },
  { value: 'BC', label: 'BC - Investment Apartment Block Areas - C' },
  { value: 'BA', label: 'BA - Investment Apartment Block Areas - A' },
  { value: 'BB', label: 'BB - Investment Apartment Block Areas - B' },
  { value: 'BD', label: 'BD - Investment Apartment Block Areas - D' },
  { value: 'BE', label: 'BE - Investment Apartment Block Areas - E' },
  { value: 'LD', label: 'LD - Light Industries Areas' },
  { value: 'MOH', label: 'MOH - Ministry of Housing Projects Zone' },
  { value: 'RA', label: 'RA - Private Residential Area - A' },
  { value: 'RB', label: 'RB - Private Residential Area - B' },
  { value: 'S', label: 'S - Service Areas' },
  { value: 'SP', label: 'SP - Special Nature Projects Areas' },
  { value: 'SP(g)', label: 'SP(g) - Special Nature Projects Areas - g' },
  { value: 'UP', label: 'UP - Unclassified' },
  { value: 'US', label: 'US - Under Studying' },
  { value: 'WS', label: 'WS - Workshops and Maintenance Services Areas' },
];

const LAND_RESIDENTIAL_AMENITIES = [
  'Building Permit', 'Asphalt Road', 'Sanitary Network', 'Building Plan', 
  'Street Lighting', 'Electricity & Water'
];

const VILLA_RESIDENTIAL_AMENITIES = [
  'Open Kitchen', 'Mejlas', 'Store', 'Maid Room', 'Garden', 'Sea View', 
  'Swimming Pool', 'Elevator', 'CCTV', 'Security System', 'Laundry', 
  'Central A/C', 'Basement', 'Gym', 'BBQ', 'Cinema', 'Home Appliances', 
  'Closed Kitchen', 'Guard Room', 'Dirty Kitchen', 'Walk-in Closet', 
  'Smart Home System'
];

const APARTMENT_RESIDENTIAL_AMENITIES = [
  'Open Kitchen', 'Store', 'Balcony', 'Maid Room', 'Playground', 'Garden', 
  'Sea View', 'Swimming Pool', 'Elevator', 'CCTV', 'Security System', 
  'Laundry', 'Central A/C', 'WiFi', 'Gym', 'Games Area', 'BBQ', 'Cinema', 
  'Home Appliances', 'Closed Kitchen', 'Reception', 'Security Guard', 
  'Walk-in Closet', 'Terrace', 'Pets Allowed', 'City View', 'Smart Home System'
];

const LAND_COMMERCIAL_AMENITIES = [
  'Building Permit', 'Asphalt Road', 'Sanitary Network', 'Building Plan',
  'Street Lighting', 'Electricity & Water'
];

const VILLA_COMMERCIAL_AMENITIES = [
  'Open Kitchen', 'Mejlas', 'Store', 'Maid Room', 'Garden', 'Sea View',
  'Swimming Pool', 'Elevator', 'CCTV', 'Security System', 'Laundry',
  'Central A/C', 'Basement', 'Gym', 'BBQ', 'Cinema', 'Home Appliances',
  'Closed Kitchen', 'Guard Room', 'Dirty Kitchen', 'Walk-in Closet',
  'Smart Home System'
];

const BUILDING_COMMERCIAL_AMENITIES = [
  'Sea View', 'Swimming Pool', 'Shared Bathrooms', 'Shared Meetings Rooms',
  'Elevator', 'CCTV', 'Security System', 'Central A/C', 'Basement', 'Gym',
  'Games Area', 'BBQ', 'Cinema', 'Car Parking', 'Guard Room', 'Reception',
  'City View'
];

const OFFICE_COMMERCIAL_AMENITIES = [
  'Meetings Room', 'Sea View', 'Shared Bathrooms', 'Shared Meetings Rooms',
  'Elevator', 'CCTV', 'Security System', 'Central A/C', 'Car Parking',
  'Open Space', 'Equipped', 'Reception', 'Security Guard', 'City View',
  'Smart Home System'
];

const SHOP_COMMERCIAL_AMENITIES = [
  'Store', 'Sea View', 'Shared Bathrooms', 'CCTV', 'Security System',
  'Central A/C', 'Car Parking', 'Equipped', 'Mezzanine', 'Security Guard'
];

const STORE_COMMERCIAL_AMENITIES = [
  'CCTV', 'Security System', 'Guard Room', 'Equipped', 'Mezzanine',
  'Security Guard'
];

const COMMON_AMENITIES = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden',
  'Balcony', 'Central AC', 'Maid Room', 'Storage', 'Elevator',
  'City View', 'Private Pool', 'Smart Home', 'Terrace',
  'Hospital', 'Mosque'
];

const getAmenitiesForProperty = (propertyType: string, category: string): string[] => {
  if (propertyType === 'Land' && category === 'Residential') {
    return LAND_RESIDENTIAL_AMENITIES;
  }
  if (propertyType === 'Villa' && category === 'Residential') {
    return VILLA_RESIDENTIAL_AMENITIES;
  }
  if (propertyType === 'Apartment' && category === 'Residential') {
    return APARTMENT_RESIDENTIAL_AMENITIES;
  }
  if (propertyType === 'Land' && category === 'Commercial') {
    return LAND_COMMERCIAL_AMENITIES;
  }
  if (propertyType === 'Villa' && category === 'Commercial') {
    return VILLA_COMMERCIAL_AMENITIES;
  }
  if (propertyType === 'Building' && category === 'Commercial') {
    return BUILDING_COMMERCIAL_AMENITIES;
  }
  if (propertyType === 'Office' && category === 'Commercial') {
    return OFFICE_COMMERCIAL_AMENITIES;
  }
  if (propertyType === 'Shop' && category === 'Commercial') {
    return SHOP_COMMERCIAL_AMENITIES;
  }
  if (propertyType === 'Store' && category === 'Commercial') {
    return STORE_COMMERCIAL_AMENITIES;
  }
  if (propertyType === 'Building' && category === 'Investment') {
    return BUILDING_COMMERCIAL_AMENITIES;
  }
  if (propertyType === 'Land Planning' && category === 'Investment') {
    return LAND_COMMERCIAL_AMENITIES;
  }
  return COMMON_AMENITIES;
};

// Get icon for each amenity
const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, any> = {
    'Building Permit': FileCheck,
    'Asphalt Road': Route,
    'Sanitary Network': Droplets,
    'Building Plan': FileText,
    'Street Lighting': Lightbulb,
    'Electricity & Water': Plug,
    'Open Kitchen': UtensilsCrossed,
    'Mejlas': Users,
    'Store': Package,
    'Maid Room': User,
    'Garden': Leaf,
    'Sea View': Waves,
    'Swimming Pool': Waves,
    'Elevator': Building2,
    'CCTV': Camera,
    'Security System': Shield,
    'Laundry': Shirt,
    'Central A/C': Snowflake,
    'Basement': Building2,
    'Gym': Dumbbell,
    'BBQ': Flame,
    'Cinema': Clapperboard,
    'Home Appliances': Cpu,
    'Closed Kitchen': DoorClosed,
    'Guard Room': Shield,
    'Dirty Kitchen': UtensilsCrossed,
    'Walk-in Closet': DoorClosed,
    'Smart Home System': Cpu,
    'Balcony': Mountain,
    'Playground': Gamepad2,
    'WiFi': Wifi,
    'Games Area': Gamepad2,
    'Reception': Bell,
    'Security Guard': UserCheck,
    'Terrace': Mountain,
    'Pets Allowed': Dog,
    'City View': Building2,
    'Shared Bathrooms': Droplets,
    'Shared Meetings Rooms': Users,
    'Car Parking': Car,
    'Meetings Room': Users,
    'Open Space': Expand,
    'Equipped': ShoppingCart,
    'Mezzanine': Layers,
    'Parking': Car,
    'Security': Shield,
    'Storage': Package,
    'Private Pool': Waves,
    'Smart Home': Cpu,
    'Hospital': Hospital,
    'Mosque': Building2
  };
  return iconMap[amenity] || Sparkles;
};

const CARLTON_STAFF = [
  { name: 'Ahmed Al Aali', nameAR: 'أحمد العلي', phone: '36943000' },
  { name: 'Hana Adel', nameAR: 'هناء عادل', phone: '36504411' },
  { name: 'Hesham Ismaeel', nameAR: 'هشام اسماعيل', phone: '36503399' },
  { name: 'Mirna Kamal', nameAR: 'ميرنه كمال', phone: '36960222' },
  { name: 'Mohamed Abdulla', nameAR: 'محمد عبدالله', phone: '36744755' },
  { name: 'Sara Ali', nameAR: 'سارة علي', phone: '36503388' },
  { name: 'Violeta Abboud', nameAR: 'فيوليت عبود', phone: '36504477' },
  { name: 'Husain Mansoor', nameAR: 'حسين منصور', phone: '38218600' },
  { name: 'Abdulla Hasan', nameAR: 'عبدالله حسن', phone: '32319900' },
  { name: 'Ali Hasan', nameAR: 'علي حسن', phone: '38213300' },
  { name: 'Masoud Ali', nameAR: 'مسعود علي', phone: '36504499' },
  { name: 'Ibrahim Mohamed', nameAR: 'إبراهيم محمد', phone: '36390222' }
];

// Get icon for each property type
const getPropertyTypeIcon = (type: PropertyType) => {
  const iconMap: Record<PropertyType, any> = {
    'Land': Map,
    'Villa': Home,
    'Apartment': Building2,
    'Office': Briefcase,
    'Shop': ShoppingBag,
    'Store': Store,
    'Factory': Factory,
    'Medical Facility': Hospital,
    'Building': Building2,
    'Land Planning': MapPinned,
    'Compound': Layers,
    'Farm': Trees,
    'Projects': FolderKanban
  };
  return iconMap[type] || Building2;
};

// Get property types based on category
const getPropertyTypesForCategory = (category: PropertyCategory | ''): PropertyType[] => {
  if (category === 'Residential') {
    return ['Land', 'Villa', 'Apartment'];
  }
  if (category === 'Commercial') {
    return ['Land', 'Villa', 'Building', 'Office', 'Shop', 'Store', 'Factory', 'Medical Facility'];
  }
  if (category === 'Investment') {
    return ['Building', 'Land Planning', 'Compound', 'Farm', 'Projects'];
  }
  return PROPERTY_TYPES;
};

interface PropertyFormProps {
  onGenerate: (data: PropertyInput) => void;
  isLoading?: boolean;
}

export function PropertyForm({ onGenerate, isLoading }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyInput>({
    listingType: 'Sale',
    propertyType: '',
    category: '',
    location: '',
    size: '',
    buildingSize: '',
    bedrooms: '',
    bathrooms: '',
    pricePerFeet: '',
    price: '',
    currency: 'BHD',
    furnishingStatus: '',
    amenities: [],
    agent: '',
    ewaIncluded: false,
    uniqueSellingPoints: '',
    landClassification: '',
    // Villa-specific fields
    numberOfEntrances: '',
    numberOfFamilyHalls: '',
    numberOfLivingAreas: '',
    numberOfInternalKitchens: '',
    numberOfExternalKitchens: '',
    kitchenType: '',
    outsideQuarters: false,
    // Land and Villa field
    numberOfRoads: '',
  });

  // Clear amenities when property type or category changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, amenities: [] }));
  }, [formData.propertyType, formData.category]);

  // Auto-calculate price from size (sqm) and price per feet/sqm
  useEffect(() => {
    if (formData.size && formData.pricePerFeet && !isNaN(Number(formData.size)) && !isNaN(Number(formData.pricePerFeet))) {
      const sqm = Number(formData.size);
      const pricePerUnit = Number(formData.pricePerFeet);
      
      // For Apartment Sale: price per sqm calculation (sqm x price per sqm)
      // For other properties: price per feet calculation (sqm x 10.764 x price per feet)
      const isApartmentForSale = formData.propertyType === 'Apartment' && formData.listingType === 'Sale';
      const calculatedPrice = isApartmentForSale 
        ? Math.round(sqm * pricePerUnit)
        : Math.round(sqm * 10.764 * pricePerUnit);
      
      setFormData(prev => ({ ...prev, price: calculatedPrice.toString() }));
    }
  }, [formData.size, formData.pricePerFeet, formData.propertyType, formData.listingType]);

  // Auto-generate with debouncing - only once when minimum data is entered
  useEffect(() => {
    // Check basic required fields
    const hasBasicData = formData.propertyType && formData.category && formData.location 
      && formData.size && formData.price && formData.furnishingStatus && formData.agent;
    
    // Additional checks for Villa and Apartment - require bedrooms and bathrooms
    const isVillaOrApartment = formData.propertyType === 'Villa' || formData.propertyType === 'Apartment';
    const hasVillaApartmentData = !isVillaOrApartment || (formData.bedrooms && formData.bathrooms);
    
    // Check if all required fields are filled
    const hasMinimumData = hasBasicData && hasVillaApartmentData;
    
    // Debug logging
    console.log('Auto-generate check:', {
      hasBasicData,
      isVillaOrApartment,
      hasVillaApartmentData,
      hasMinimumData,
      isLoading,
      propertyType: formData.propertyType,
      category: formData.category,
      location: formData.location,
      size: formData.size,
      price: formData.price,
      furnishingStatus: formData.furnishingStatus,
      agent: formData.agent,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms
    });
    
    // Don't generate if already loading or no minimum data
    if (!hasMinimumData || isLoading) return;

    // Debounce the generation by 1.5 seconds
    const timeoutId = setTimeout(() => {
      console.log('Triggering auto-generate with data:', formData);
      onGenerate(formData);
    }, 1500);

    return () => clearTimeout(timeoutId);
    // Only trigger on formData changes, not isLoading to prevent loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is now handled automatically, but keep this for accessibility
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <>
      <Card className="shadow-medium border-0 overflow-hidden">
        <CardHeader className="gradient-hero text-primary-foreground pb-8 pt-6">
          <CardTitle className="text-2xl font-display flex items-center gap-3">
            <Building2 className="w-7 h-7" />
            Property Details
          </CardTitle>
          <p className="text-primary-foreground/80 mt-1 font-body text-sm">
            Enter your property information to generate professional listings
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Type - Sale or Rent */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Listing Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.listingType === 'Sale' ? 'default' : 'outline'}
                className={`flex-1 ${formData.listingType === 'Sale' ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                onClick={() => setFormData(prev => ({ ...prev, listingType: 'Sale' }))}
              >
                For Sale
              </Button>
              <Button
                type="button"
                variant={formData.listingType === 'Rent' ? 'default' : 'outline'}
                className={`flex-1 ${formData.listingType === 'Rent' ? 'bg-green-600 hover:bg-green-700 border-green-600' : 'hover:bg-green-50 hover:border-green-300'}`}
                onClick={() => setFormData(prev => ({ ...prev, listingType: 'Rent' }))}
              >
                For Rent
              </Button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.category === 'Residential' ? 'default' : 'outline'}
                  className="flex-1 flex items-center gap-2"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'Residential' }))}
                >
                  <Home className="w-4 h-4" />
                  Residential
                </Button>
                <Button
                  type="button"
                  variant={formData.category === 'Commercial' ? 'default' : 'outline'}
                  className="flex-1 flex items-center gap-2"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'Commercial' }))}
                >
                  <Building2 className="w-4 h-4" />
                  Commercial
                </Button>
                <Button
                  type="button"
                  variant={formData.category === 'Investment' ? 'default' : 'outline'}
                  className="flex-1 flex items-center gap-2"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'Investment' }))}
                >
                  <TrendingUp className="w-4 h-4" />
                  Investment
                </Button>
              </div>
            </div>

            {/* Property Type - Only show after category is selected */}
            {formData.category && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="flex flex-wrap gap-2">
                  {getPropertyTypesForCategory(formData.category).map(type => {
                    const Icon = getPropertyTypeIcon(type);
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.propertyType === type ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                      >
                        <Icon className="w-4 h-4" />
                        {type}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Land Classification (shown for Land types) */}
          {(formData.propertyType === 'Land' || formData.propertyType === 'Land Planning') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Land Classification
              </Label>
              <Select
                value={formData.landClassification}
                onValueChange={(value: LandClassification) => setFormData(prev => ({ ...prev, landClassification: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {LAND_CLASSIFICATIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location
              </Label>
              <Input
                placeholder="e.g., Juffair, Manama"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{formData.propertyType === 'Villa' ? 'Plot Size (sqm)' : 'Size (sqm)'}</Label>
              <Input
                placeholder="e.g., 150"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
              />
            </div>
          </div>

          {/* Number of Roads (shown for Land and Villa only) */}
          {(formData.propertyType === 'Land' || formData.propertyType === 'Land Planning' || formData.propertyType === 'Villa') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Number of Roads</Label>
              <Input
                placeholder="e.g., 2"
                type="number"
                value={formData.numberOfRoads}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfRoads: e.target.value }))}
              />
            </div>
          )}

          {/* Building Size (shown for Villa only) */}
          {formData.propertyType === 'Villa' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Building Size (sqm)</Label>
              <Input
                placeholder="e.g., 280"
                type="number"
                value={formData.buildingSize}
                onChange={(e) => setFormData(prev => ({ ...prev, buildingSize: e.target.value }))}
              />
            </div>
          )}

          {/* Villa-specific fields */}
          {formData.propertyType === 'Villa' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of Entrances</Label>
                  <Input
                    placeholder="e.g., 2"
                    type="number"
                    value={formData.numberOfEntrances}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfEntrances: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of Family Halls</Label>
                  <Input
                    placeholder="e.g., 1"
                    type="number"
                    value={formData.numberOfFamilyHalls}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfFamilyHalls: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of Living Areas</Label>
                  <Input
                    placeholder="e.g., 2"
                    type="number"
                    value={formData.numberOfLivingAreas}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfLivingAreas: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kitchen Type</Label>
                  <Select
                    value={formData.kitchenType}
                    onValueChange={(value: 'Internal' | 'External' | 'Both') => setFormData(prev => ({ ...prev, kitchenType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select kitchen type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="External">External</SelectItem>
                      <SelectItem value="Both">Both Internal & External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Kitchen count fields based on type */}
              {formData.kitchenType === 'Both' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Number of Internal Kitchens</Label>
                    <Input
                      placeholder="e.g., 1"
                      type="number"
                      value={formData.numberOfInternalKitchens}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfInternalKitchens: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Number of External Kitchens</Label>
                    <Input
                      placeholder="e.g., 1"
                      type="number"
                      value={formData.numberOfExternalKitchens}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfExternalKitchens: e.target.value }))}
                    />
                  </div>
                </div>
              ) : formData.kitchenType === 'Internal' ? (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of Internal Kitchens</Label>
                  <Input
                    placeholder="e.g., 1"
                    type="number"
                    value={formData.numberOfInternalKitchens}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfInternalKitchens: e.target.value }))}
                  />
                </div>
              ) : formData.kitchenType === 'External' ? (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of External Kitchens</Label>
                  <Input
                    placeholder="e.g., 1"
                    type="number"
                    value={formData.numberOfExternalKitchens}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfExternalKitchens: e.target.value }))}
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Outside Quarters</Label>
                  <div className="flex items-center h-10 px-3 border border-input rounded-md bg-background">
                    <Switch
                      checked={formData.outsideQuarters}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, outsideQuarters: checked }))}
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formData.outsideQuarters ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Bedrooms & Bathrooms (shown for Villa and Apartment only) */}
          {(formData.propertyType === 'Villa' || formData.propertyType === 'Apartment') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  Bedrooms
                </Label>
                <Input
                  placeholder="e.g., 3"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  Bathrooms
                </Label>
                <Input
                  placeholder="e.g., 2"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Price per Feet/SQM & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hide Price per SQM for Apartment Rent and Commercial properties (Office, Shop, Store, Building, Compound, Farm, Projects) */}
            {!(formData.propertyType === 'Apartment' && formData.listingType === 'Rent') && 
             !(formData.category === 'Commercial' && ['Office', 'Shop', 'Store', 'Building', 'Compound', 'Farm', 'Projects'].includes(formData.propertyType)) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {formData.propertyType === 'Apartment' && formData.listingType === 'Sale' ? 'Price per SQM' : 'Price per Feet'}
                </Label>
                <Input
                  placeholder="e.g., 50"
                  type="number"
                  value={formData.pricePerFeet}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerFeet: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-semibold">BD</span>
                Price
              </Label>
              <Input
                placeholder="e.g., 85000"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
          </div>

          {/* Furnishing Status (shown for Villa and Apartment only) */}
          {(formData.propertyType === 'Villa' || formData.propertyType === 'Apartment') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sofa className="w-4 h-4 text-muted-foreground" />
                Furnishing Status
              </Label>
              <Select
                value={formData.furnishingStatus}
                onValueChange={(value: FurnishingStatus) => setFormData(prev => ({ ...prev, furnishingStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select furnishing" />
                </SelectTrigger>
                <SelectContent>
                  {FURNISHING_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amenities - Only show after property type is selected */}
          {formData.propertyType && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                Amenities & Facilities
              </Label>
              <div className="flex flex-wrap gap-2">
                {getAmenitiesForProperty(formData.propertyType, formData.category).map(amenity => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <Badge
                      key={amenity}
                      variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                      className={`cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 ${
                        formData.amenities.includes(amenity) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {amenity}
                      {formData.amenities.includes(amenity) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unique Selling Points */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Unique Selling Points</Label>
            <Textarea
              placeholder="What makes this property special? e.g., Recently renovated, prime location, stunning views..."
              value={formData.uniqueSellingPoints}
              onChange={(e) => setFormData(prev => ({ ...prev, uniqueSellingPoints: e.target.value }))}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Carlton Staff Agent */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Carlton Staff Agent</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {CARLTON_STAFF.map(staff => (
                <Button
                  key={staff.phone}
                  type="button"
                  variant={formData.agent === staff.phone ? 'default' : 'outline'}
                  className="text-xs px-2 py-2 h-auto whitespace-normal leading-tight"
                  onClick={() => setFormData(prev => ({ ...prev, agent: staff.phone }))}
                >
                  {staff.name}
                </Button>
              ))}
            </div>
          </div>

          {/* EWA Included (shown for Villa and Apartment only) */}
          {(formData.propertyType === 'Villa' || formData.propertyType === 'Apartment') && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-secondary" />
                <div>
                  <Label className="text-sm font-medium">EWA Included</Label>
                  <p className="text-xs text-muted-foreground">Electricity and Water Authority</p>
                </div>
              </div>
              <Switch
                checked={formData.ewaIncluded}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ewaIncluded: checked }))}
              />
            </div>
          )}

          {/* Generate Description Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => onGenerate(formData)}
              disabled={isLoading || !formData.propertyType || !formData.category || !formData.location}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Generating...' : 'Generate Description'}
            </Button>
          </div>

        </form>
      </CardContent>
      </Card>
    </>
  );
}
