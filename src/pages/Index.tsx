import { useState } from 'react';
import { PropertyForm } from '@/components/PropertyForm';
import { GeneratedContent } from '@/components/GeneratedContent';
import { generateContent } from '@/utils/contentGenerator';
import { PropertyInput, GeneratedContent as GeneratedContentType } from '@/types/property';
import { Building2, Sparkles } from 'lucide-react';

const Index = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (data: PropertyInput) => {
    setIsLoading(true);
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = generateContent(data);
    setGeneratedContent(content);
    setIsLoading(false);
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
            <span className="text-sm font-medium">English & Arabic • Multiple Platforms</span>
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
                  Fill in your property details on the left and click "Generate Listings" 
                  to create professional content for all platforms.
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
            Real Estate Content Generator • Create professional listings in English & Arabic
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
