import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OutputCard } from '@/components/OutputCard';
import { useBranch } from '@/contexts/BranchContext';
import { 
  Archive, 
  Home, 
  Search, 
  Calendar,
  MapPin,
  Building2,
  ChevronLeft,
  RefreshCw,
  RotateCcw,
  Trash2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeletedItem {
  id: string;
  created_at: string;
  deleted_at: string;
  deleted_by: string;
  property_type: string;
  category: string;
  listing_type: string;
  location: string;
  size: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  price: string;
  currency: string;
  furnishing_status: string | null;
  property_finder_title_en: string | null;
  property_finder_en: string | null;
  property_finder_title_ar: string | null;
  property_finder_ar: string | null;
  instagram_en: string | null;
  instagram_ar: string | null;
  website_en: string | null;
  website_ar: string | null;
  amenities: string[] | null;
  branch: string | null;
}

export default function DeletedDescriptions() {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DeletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [restoring, setRestoring] = useState<string | null>(null);
  const [permanentDeleting, setPermanentDeleting] = useState<string | null>(null);
  const { selectedBranch, showAllBranches, setShowAllBranches, getBranchName } = useBranch();

  useEffect(() => {
    fetchDeletedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllBranches, selectedBranch]);

  useEffect(() => {
    filterItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedItems, searchQuery]);

  const fetchDeletedItems = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('generated_listings')
        .select('*')
        .not('deleted_at', 'is', null);
      
      // Filter by branch if not showing all branches
      if (!showAllBranches && selectedBranch) {
        query = query.eq('branch', selectedBranch);
      }
      
      const { data, error } = await query.order('deleted_at', { ascending: false });

      if (error) throw error;
      
      setDeletedItems(data || []);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      toast.error('Failed to load deleted listings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...deletedItems];

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.property_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deleted_by.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const restoreItem = async (id: string) => {
    setRestoring(id);
    try {
      const { error } = await supabase
        .from('generated_listings')
        .update({
          deleted_at: null,
          deleted_by: null,
        })
        .eq('id', id);

      if (error) throw error;

      setDeletedItems(prev => prev.filter(item => item.id !== id));
      toast.success('Listing restored successfully');
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Failed to restore listing');
    } finally {
      setRestoring(null);
    }
  };

  const permanentDelete = async (id: string) => {
    setPermanentDeleting(id);
    try {
      const { error } = await supabase
        .from('generated_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDeletedItems(prev => prev.filter(item => item.id !== id));
      toast.success('Listing permanently deleted');
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error('Failed to permanently delete listing');
    } finally {
      setPermanentDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero py-6 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/history">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground flex items-center gap-2">
                  <Archive className="h-7 w-7" />
                  Deleted Listings
                </h1>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  {showAllBranches 
                    ? 'Viewing all branches' 
                    : selectedBranch && getBranchName(selectedBranch)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAllBranches(!showAllBranches)}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showAllBranches ? 'My Branch Only' : 'All Branches'}
              </Button>
              <Button 
                onClick={fetchDeletedItems} 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b bg-muted/30 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by location, type, or deleted by..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {filteredItems.length} deleted listing(s)
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto py-8 px-4">
        {/* Warning Alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Deleted Listings</AlertTitle>
          <AlertDescription>
            These listings have been soft-deleted. You can restore them or permanently delete them. 
            Permanent deletion cannot be undone.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Archive className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No deleted listings</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Your deleted listings will appear here'}
            </p>
            <Link to="/history">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border-destructive/50">
                <CardHeader className="bg-destructive/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.property_type}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge>{item.listing_type}</Badge>
                        <Badge variant="destructive">Deleted</Badge>
                      </div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {item.property_finder_title_en || `${item.property_type} in ${item.location}`}
                      </CardTitle>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {item.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Deleted: {format(new Date(item.deleted_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div>By: {item.deleted_by}</div>
                        {showAllBranches && item.branch && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {getBranchName(item.branch)}
                          </Badge>
                        )}
                        {item.size && <div>{item.size} sqm</div>}
                        {item.bedrooms && <div>{item.bedrooms} beds</div>}
                        {item.bathrooms && <div>{item.bathrooms} baths</div>}
                        <div className="font-semibold text-foreground">
                          {item.price} {item.currency}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreItem(item.id)}
                        disabled={restoring === item.id}
                        className="text-green-600 hover:text-green-700"
                      >
                        {restoring === item.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={permanentDeleting === item.id}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Forever
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Permanently Delete Listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the listing
                              and remove all its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => permanentDelete(item.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete Forever
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="propertyfinder" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="propertyfinder">Property Finder</TabsTrigger>
                      <TabsTrigger value="instagram">Instagram</TabsTrigger>
                      <TabsTrigger value="website">Website</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="propertyfinder" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {item.property_finder_en && (
                        <OutputCard
                          title="Property Finder - English"
                          content={item.property_finder_en}
                          propertyTitle={item.property_finder_title_en || undefined}
                          icon={<Building2 className="w-4 h-4" />}
                        />
                      )}
                      {item.property_finder_ar && (
                        <OutputCard
                          title="Property Finder - عربي"
                          content={item.property_finder_ar}
                          propertyTitle={item.property_finder_title_ar || undefined}
                          icon={<Building2 className="w-4 h-4" />}
                          isRTL
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="instagram" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {item.instagram_en && (
                        <OutputCard
                          title="Instagram - English"
                          content={item.instagram_en}
                          icon={<Building2 className="w-4 h-4" />}
                        />
                      )}
                      {item.instagram_ar && (
                        <OutputCard
                          title="Instagram - عربي"
                          content={item.instagram_ar}
                          icon={<Building2 className="w-4 h-4" />}
                          isRTL
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="website" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {item.website_en && (
                        <OutputCard
                          title="Website - English"
                          content={item.website_en}
                          icon={<Building2 className="w-4 h-4" />}
                        />
                      )}
                      {item.website_ar && (
                        <OutputCard
                          title="Website - عربي"
                          content={item.website_ar}
                          icon={<Building2 className="w-4 h-4" />}
                          isRTL
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
