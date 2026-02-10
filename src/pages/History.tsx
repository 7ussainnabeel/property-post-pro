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
  History, 
  Home, 
  Search, 
  Filter, 
  Star, 
  Calendar,
  MapPin,
  Building2,
  ChevronLeft,
  Trash2,
  RefreshCw,
  Loader2,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface HistoryItem {
  id: string;
  created_at: string;
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
  is_favorite: boolean | null;
  amenities: string[] | null;
  deleted_at: string | null;
  deleted_by: string | null;
  branch: string | null;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteUsername, setDeleteUsername] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { selectedBranch, showAllBranches, setShowAllBranches, getBranchName } = useBranch();

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllBranches, selectedBranch]);

  useEffect(() => {
    filterHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, searchQuery, selectedType, selectedCategory]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Fetch all listings without branch filter in the query
      // (filtering by branch will be done on client side)
      const { data, error } = await supabase
        .from('generated_listings')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast data to array and map to ensure branch field is included
      const items = (data as Array<Record<string, unknown>>) || [];
      let historyData = items.map((item) => ({
        ...item,
        branch: (item.branch as string | null) || selectedBranch || null,
      })) as HistoryItem[];
      
      // Filter by branch if needed
      if (!showAllBranches && selectedBranch) {
        historyData = historyData.filter(item => item.branch === selectedBranch);
      }
      
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...history];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.property_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.price.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.property_type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredHistory(filtered);
  };

  const toggleFavorite = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('generated_listings')
        .update({ is_favorite: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, is_favorite: !currentStatus } : item
      ));

      toast.success(currentStatus ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete clicked for item:', id);
    setItemToDelete(id);
    setDeleteUsername('');
    setDeleteDialogOpen(true);
  };

  const deleteItem = async (username: string) => {
    if (!itemToDelete) return;

    if (!username.trim()) {
      toast.error('Please enter your username to confirm deletion');
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('generated_listings')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: username.trim()
        })
        .eq('id', itemToDelete);

      if (error) throw error;

      setHistory(prev => prev.filter(item => item.id !== itemToDelete));
      toast.success('Item moved to deleted listings');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteUsername('');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const uniqueTypes = Array.from(new Set(history.map(item => item.property_type)));
  const uniqueCategories = Array.from(new Set(history.map(item => item.category)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero py-4 md:py-6 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <Link to="/">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0">
                    <ChevronLeft className="h-4 w-4 md:mr-1" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                </Link>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-primary-foreground flex items-center gap-2">
                    <History className="h-5 w-5 md:h-7 md:w-7 shrink-0" />
                    <span className="truncate">Generation History</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1 truncate">
                    {showAllBranches 
                      ? 'Viewing all branches' 
                      : selectedBranch && getBranchName(selectedBranch)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowAllBranches(!showAllBranches)}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Filter className="h-4 w-4 mr-1 md:mr-2" />
                <span className="text-xs sm:text-sm">{showAllBranches ? 'My Branch' : 'All Branches'}</span>
              </Button>
              <Button 
                onClick={fetchHistory} 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm">Refresh</span>
              </Button>
              <Link to="/deleted-descriptions">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Archive className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="text-xs sm:text-sm">Deleted</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b bg-muted/30 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by location, type, or price..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Property Type and Category Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-3 text-xs sm:text-sm text-muted-foreground">
            Showing {filteredHistory.length} of {history.length} listings
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto py-6 sm:py-8 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <History className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No history found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center">
              {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Start generating property listings to see them here'}
            </p>
            <Link to="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Generate Listings
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{item.property_type}</Badge>
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                        <Badge className="text-xs">{item.listing_type}</Badge>
                      </div>
                      <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        <span className="break-words">
                          {item.property_finder_title_en || `${item.property_type} in ${item.location}`}
                        </span>
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="hidden sm:inline">{format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</span>
                          <span className="sm:hidden">{format(new Date(item.created_at), 'MMM dd, yy')}</span>
                        </div>
                        {showAllBranches && item.branch && (
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Building2 className="h-3 w-3" />
                            {getBranchName(item.branch)}
                          </Badge>
                        )}
                        {item.size && (
                          <div className="whitespace-nowrap">{item.size} sqm</div>
                        )}
                        {item.bedrooms && (
                          <div className="whitespace-nowrap">{item.bedrooms} beds</div>
                        )}
                        {item.bathrooms && (
                          <div className="whitespace-nowrap">{item.bathrooms} baths</div>
                        )}
                        <div className="font-semibold text-foreground whitespace-nowrap">
                          {item.price} {item.currency}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end sm:justify-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(item.id, item.is_favorite)}
                        className={item.is_favorite ? 'text-yellow-500' : ''}
                      >
                        <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${item.is_favorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 sm:pt-6">
                  <Tabs defaultValue="propertyfinder" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                      <TabsTrigger value="propertyfinder" className="text-xs sm:text-sm px-2 py-2">Property Finder</TabsTrigger>
                      <TabsTrigger value="instagram" className="text-xs sm:text-sm px-2 py-2">Instagram</TabsTrigger>
                      <TabsTrigger value="website" className="text-xs sm:text-sm px-2 py-2am">Instagram</TabsTrigger>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This listing will be moved to deleted descriptions. You can restore it later from the recovery page.
            </p>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Enter your username to confirm *
              </label>
              <Input
                id="username"
                placeholder="Your username"
                value={deleteUsername}
                onChange={(e) => setDeleteUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deleteUsername.trim()) {
                    deleteItem(deleteUsername);
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
                setDeleteUsername('');
              }} 
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive" 
              onClick={() => deleteItem(deleteUsername)}
              disabled={deleting || !deleteUsername.trim()}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Listing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
