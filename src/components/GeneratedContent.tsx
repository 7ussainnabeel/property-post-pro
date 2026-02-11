import { GeneratedContent as GeneratedContentType } from '@/types/property';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OutputCard } from './OutputCard';
import { Building2, Instagram, Globe, FileText } from 'lucide-react';

interface GeneratedContentProps {
  content: GeneratedContentType;
}

export function GeneratedContent({ content }: GeneratedContentProps) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-up">
      <div className="text-center px-2">
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-foreground">
          Generated Listings
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Click any output to copy to clipboard
        </p>
      </div>

      <Tabs defaultValue="propertyfinder" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto sm:h-12 p-1 bg-muted/60">
          <TabsTrigger 
            value="propertyfinder" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-0"
          >
            <Building2 className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Property Finder</span>
          </TabsTrigger>
          <TabsTrigger 
            value="instagram"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-0"
          >
            <Instagram className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Instagram</span>
          </TabsTrigger>
          <TabsTrigger 
            value="website"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-0"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs sm:text-sm hidden sm:inline">Website & Others</span>
            <span className="text-xs sm:text-sm sm:hidden">Website</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="propertyfinder" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <OutputCard
                title="English Title"
                content={content.propertyFinderTitleEN}
                icon={<FileText className="w-4 h-4 text-primary" />}
              />
              <OutputCard
                title="English Description"
                content={content.propertyFinderEN}
                icon={<FileText className="w-4 h-4 text-primary" />}
              />
            </div>
            <div className="space-y-4">
              <OutputCard
                title="Arabic Title"
                content={content.propertyFinderTitleAR}
                icon={<FileText className="w-4 h-4 text-primary" />}
                isRTL
              />
              <OutputCard
                title="Arabic Description"
                content={content.propertyFinderAR}
                icon={<FileText className="w-4 h-4 text-primary" />}
                isRTL
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instagram" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <OutputCard
              title="English Caption"
              content={content.instagramEN}
              icon={<Instagram className="w-4 h-4 text-pink-500" />}
            />
            <OutputCard
              title="Arabic Caption"
              content={content.instagramAR}
              icon={<Instagram className="w-4 h-4 text-pink-500" />}
              isRTL
            />
          </div>
        </TabsContent>

        <TabsContent value="website" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <OutputCard
              title="English Description"
              content={content.websiteEN}
              icon={<Globe className="w-4 h-4 text-blue-500" />}
            />
            <OutputCard
              title="Arabic Description"
              content={content.websiteAR}
              icon={<Globe className="w-4 h-4 text-blue-500" />}
              isRTL
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
