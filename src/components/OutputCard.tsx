import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface OutputCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  isRTL?: boolean;
}

export function OutputCard({ title, content, icon, isRTL }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-soft border-0 animate-scale-in overflow-hidden group hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3 flex flex-row items-center justify-between bg-muted/30">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          {icon}
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="pt-3">
        <div 
          className={`text-sm leading-relaxed whitespace-pre-wrap ${isRTL ? 'text-right' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{ fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : undefined }}
        >
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
