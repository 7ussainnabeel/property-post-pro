import { GeneratedContent as GeneratedContentType } from '@/types/property';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OutputCard } from './OutputCard';
import { Building2, Instagram, Globe, FileText } from 'lucide-react';

interface GeneratedContentProps {
  content: GeneratedContentType;
}

export function GeneratedContent({ content }: GeneratedContentProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Generated Listings
        </h2>
        <p className="text-muted-foreground mt-1">
          Click any output to copy to clipboard
        </p>
      </div>

      <Tabs defaultValue="propertyfinder" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/60">
          <TabsTrigger 
            value="propertyfinder" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Property Finder
          </TabsTrigger>
          <TabsTrigger 
            value="instagram"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
          >
            <Instagram className="w-4 h-4 mr-2" />
            Instagram
          </TabsTrigger>
          <TabsTrigger 
            value="website"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
          >
            <Globe className="w-4 h-4 mr-2" />
            Websites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="propertyfinder" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <OutputCard
              title="English Version"
              content={content.propertyFinderEN}
              icon={<FileText className="w-4 h-4 text-primary" />}
            />
            <OutputCard
              title="Arabic Version"
              content={content.propertyFinderAR}
              icon={<FileText className="w-4 h-4 text-primary" />}
              isRTL
            />
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
