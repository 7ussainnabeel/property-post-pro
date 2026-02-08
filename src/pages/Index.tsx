import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PropertyForm } from '@/components/PropertyForm';
import { GeneratedContent } from '@/components/GeneratedContent';
import { PropertyInput, GeneratedContent as GeneratedContentType } from '@/types/property';
import { Building2, Sparkles, Video, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/contexts/BranchContext';

const Index = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyInput | null>(null);
  const loadingToastId = useRef<string | number | null>(null);
  const { selectedBranch, getBranchName } = useBranch();

  const handleGenerate = async (data: PropertyInput) => {
    setIsLoading(true);
    setPropertyData(data);
    loadingToastId.current = toast.loading('Generating listings...');
    
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-listing', {
        body: { property: data }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        if (loadingToastId.current) toast.dismiss(loadingToastId.current);
        toast.error('Failed to generate content. Please try again.');
        return;
      }

      if (result?.error) {
        console.error('Edge function error:', result.error);
        if (loadingToastId.current) toast.dismiss(loadingToastId.current);
        if (result.error.includes('Rate limits')) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (result.error.includes('Payment required')) {
          toast.error('AI credits depleted. Please add funds to continue.');
        } else {
          toast.error(result.error);
        }
        return;
      }

      if (result?.content) {
        setGeneratedContent(result.content);
        
        // Save to database
        try {
          const { error: dbError } = await supabase
            .from('generated_listings')
            .insert({
              category: data.category,
              listing_type: data.listingType,
              location: data.location,
              size: data.size || null,
              bedrooms: data.bedrooms || null,
              bathrooms: data.bathrooms || null,
              price: data.price,
              currency: data.currency,
              furnishing_status: data.furnishingStatus || null,
              amenities: data.amenities || [],
              ewa_included: data.ewaIncluded || false,
              land_classification: data.landClassification || null,
              unique_selling_points: data.uniqueSellingPoints || null,
              agent: data.agent || null,
              branch: selectedBranch,
              property_finder_title_en: result.content.propertyFinderTitleEN || null,
              property_finder_en: result.content.propertyFinderEN || null,
              property_finder_title_ar: result.content.propertyFinderTitleAR || null,
              property_finder_ar: result.content.propertyFinderAR || null,
              instagram_en: result.content.instagramEN || null,
              instagram_ar: result.content.instagramAR || null,
              website_en: result.content.websiteEN || null,
              website_ar: result.content.websiteAR || null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
          
          if (dbError) {
            console.error('Error saving to database:', dbError);
          }
        } catch (saveError) {
          console.error('Error saving to history:', saveError);
        }
        
        if (loadingToastId.current) toast.dismiss(loadingToastId.current);
        toast.success('Content generated successfully!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      if (loadingToastId.current) toast.dismiss(loadingToastId.current);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero py-6 px-4 text-center relative">
        {/* Navigation Links */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Link to="/video-quality">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full">
              <Video className="h-4 w-4 mr-2" />
              Video Quality
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </Link>
        </div>

        {/* Branch Badge */}
        <div className="absolute top-4 left-4">
          <Link to="/branch-selection">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Building2 className="h-4 w-4 mr-2" />
              {selectedBranch ? getBranchName(selectedBranch) : 'Select Branch'}
            </Button>
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img 
              src="/CarltonLogo.png" 
              alt="Carlton Real Estate" 
              className="h-8 md:h-10"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
            Property Listing
            <span className="text-gradient-gold block mt-0.5">Content Generator</span>
          </h1>
          <p className="text-sm text-primary-foreground/80 max-w-2xl mx-auto font-body">
            Generate professional, bilingual property listings for Property Finder, Instagram, 
            and other platforms in seconds.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-secondary">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">AI-Powered • English & Arabic • Latest Hashtags</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form Section */}
          <div className="lg:sticky lg:top-8">
            <PropertyForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Output Section */}
          <div>
            {generatedContent ? (
              <GeneratedContent content={generatedContent} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border-2 border-dashed border-border rounded-xl bg-muted/30">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  Ready to Generate
                </h3>
                <p className="text-center text-muted-foreground max-w-sm">
                  Fill in your property details on the left to automatically 
                  generate AI-powered content with trending Bahrain hashtags.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            AI-Powered Real Estate Content Generator • Professional listings in English & Arabic
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
