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
import { Building2, MapPin, Bed, Bath, DollarSign, Sofa, Sparkles, Zap, X, Layers, RefreshCw } from 'lucide-react';

const PROPERTY_TYPES: PropertyType[] = [
  'Land', 'Villa', 'Apartment', 'Office', 'Shop', 'Store', 
  'Land Planning', 'Building', 'Compound', 'Farm', 'Projects', 
  'Factory', 'Medical Facility'
];

const CATEGORIES: PropertyCategory[] = ['Residential', 'Commercial', 'Investment'];

const FURNISHING_OPTIONS: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

const LAND_CLASSIFICATIONS: { value: LandClassification; label: string }[] = [
  { value: 'RA', label: 'RA - Residential A' },
  { value: 'RB', label: 'RB - Residential B' },
  { value: 'RC', label: 'RC - Residential C' },
  { value: 'RD', label: 'RD - Residential D' },
  { value: 'BA', label: 'BA - Business A' },
  { value: 'BB', label: 'BB - Business B' },
  { value: 'BC', label: 'BC - Business C' },
  { value: 'BD', label: 'BD - Business D' },
  { value: 'CA', label: 'CA - Commercial A' },
  { value: 'CB', label: 'CB - Commercial B' },
  { value: 'IA', label: 'IA - Industrial A' },
  { value: 'IB', label: 'IB - Industrial B' },
];

const COMMON_AMENITIES = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden',
  'Balcony', 'Central AC', 'Maid Room', 'Storage', 'Elevator',
  'Sea View', 'City View', 'Private Pool', 'Smart Home', 'Terrace',
  'Hospital', 'Mosque', 'Airport', 'Strategic Access to Main Roads'
];

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

  // Auto-calculate price from size (sqm) and price per feet
  useEffect(() => {
    if (formData.size && formData.pricePerFeet && !isNaN(Number(formData.size)) && !isNaN(Number(formData.pricePerFeet))) {
      const sqm = Number(formData.size);
      const pricePerFeet = Number(formData.pricePerFeet);
      const calculatedPrice = Math.round(sqm * 10.764 * pricePerFeet);
      setFormData(prev => ({ ...prev, price: calculatedPrice.toString() }));
    }
  }, [formData.size, formData.pricePerFeet]);

  // Auto-generate with debouncing - only once when minimum data is entered
  useEffect(() => {
    // Check if we have minimum required fields
    const hasMinimumData = formData.propertyType && formData.category && formData.location;
    
    // Don't generate if already loading or no minimum data
    if (!hasMinimumData || isLoading) return;

    // Debounce the generation by 1.5 seconds
    const timeoutId = setTimeout(() => {
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
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listingType"
                  value="Sale"
                  checked={formData.listingType === 'Sale'}
                  onChange={(e) => setFormData(prev => ({ ...prev, listingType: e.target.value as ListingType }))}
                  className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium">For Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listingType"
                  value="Rent"
                  checked={formData.listingType === 'Rent'}
                  onChange={(e) => setFormData(prev => ({ ...prev, listingType: e.target.value as ListingType }))}
                  className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium">For Rent</span>
              </label>
            </div>
          </div>

          {/* Property Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Property Type
              </Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value: PropertyType) => setFormData(prev => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: PropertyCategory) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {/* Price per Feet & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Price per Feet</Label>
              <Input
                placeholder="e.g., 50"
                type="number"
                value={formData.pricePerFeet}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerFeet: e.target.value }))}
              />
            </div>

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

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              Amenities & Facilities
            </Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map(amenity => (
                <Badge
                  key={amenity}
                  variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    formData.amenities.includes(amenity) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                  {formData.amenities.includes(amenity) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
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

          {/* Update Description Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => onGenerate(formData)}
              disabled={isLoading || !formData.propertyType || !formData.category || !formData.location}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Generating...' : 'Update Description'}
            </Button>
          </div>

        </form>
      </CardContent>
      </Card>
    </>
  );
}
