import { useState } from 'react';
import { PropertyInput, PropertyCategory, PropertyType, FurnishingStatus } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Bed, Bath, DollarSign, Sofa, Sparkles, Zap, X } from 'lucide-react';

const PROPERTY_TYPES: PropertyType[] = [
  'Land', 'Villa', 'Apartment', 'Office', 'Shop', 'Store', 
  'Land Planning', 'Building', 'Compound', 'Farm', 'Projects', 
  'Factory', 'Medical Facility'
];

const CATEGORIES: PropertyCategory[] = ['Residential', 'Commercial', 'Investment'];

const FURNISHING_OPTIONS: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

const COMMON_AMENITIES = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden',
  'Balcony', 'Central AC', 'Maid Room', 'Storage', 'Elevator',
  'Sea View', 'City View', 'Private Pool', 'Smart Home', 'Terrace'
];

interface PropertyFormProps {
  onGenerate: (data: PropertyInput) => void;
  isLoading?: boolean;
}

export function PropertyForm({ onGenerate, isLoading }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyInput>({
    propertyType: '',
    category: '',
    location: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    price: '',
    currency: 'BHD',
    furnishingStatus: '',
    amenities: [],
    ewaIncluded: false,
    uniqueSellingPoints: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
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
              <Label className="text-sm font-medium">Size (sqm)</Label>
              <Input
                placeholder="e.g., 150"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
              />
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
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

          {/* Price & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Price
              </Label>
              <Input
                placeholder="e.g., 85000"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BHD">BHD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Furnishing Status */}
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

          {/* EWA Included */}
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

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold gradient-gold text-navy shadow-gold hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                Generating Content...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Listings
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
