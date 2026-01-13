import { useState, useRef } from 'react';
import { PropertyForm } from '@/components/PropertyForm';
import { GeneratedContent } from '@/components/GeneratedContent';
import { PropertyInput, GeneratedContent as GeneratedContentType } from '@/types/property';
import { Building2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingToastId = useRef<string | number | null>(null);

  const handleGenerate = async (data: PropertyInput) => {
    setIsLoading(true);
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
      <header className="gradient-hero py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-secondary/20 rounded-xl">
              <Building2 className="w-8 h-8 text-secondary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Property Listing
            <span className="text-gradient-gold block mt-1">Content Generator</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto font-body">
            Generate professional, bilingual property listings for Property Finder, Instagram, 
            and other platforms in seconds.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-secondary">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">AI-Powered • English & Arabic • Latest Hashtags</span>
            <Sparkles className="w-5 h-5" />
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
