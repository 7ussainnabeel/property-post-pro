import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, RefreshCw, Search, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VideoSubmission {
  id: string;
  youtube_url: string | null;
  property_url: string | null;
  video_file_url: string | null;
  title: string | null;
  description: string | null;
  notes: string | null;
  agent_name: string | null;
  property_id: string | null;
  orientation: string | null;
  stability_rating: number | null;
  overall_rating: number | null;
  ai_feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

const DeletedVideos = () => {
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);
  const [permanentDeleting, setPermanentDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDeletedVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("video_submissions")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error fetching deleted videos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDeletedVideos();
  }, [fetchDeletedVideos]);

  const restoreVideo = async (id: string) => {
    setRestoring(id);
    try {
      const { error } = await supabase
        .from("video_submissions")
        .update({
          deleted_at: null,
          deleted_by: null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Video Restored",
        description: "Video submission has been restored successfully",
      });

      fetchDeletedVideos();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error restoring video",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  const permanentDelete = async (id: string, videoFileUrl: string | null) => {
    setPermanentDeleting(id);
    try {
      // Delete from storage if it's an uploaded file
      if (videoFileUrl) {
        const path = videoFileUrl.split("/videos/")[1];
        if (path) {
          await supabase.storage.from("videos").remove([path]);
        }
      }

      const { error } = await supabase
        .from("video_submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Video Permanently Deleted",
        description: "Video submission has been permanently removed",
      });

      fetchDeletedVideos();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error deleting video",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPermanentDeleting(null);
    }
  };

  const restoreAll = async () => {
    try {
      const { error } = await supabase
        .from("video_submissions")
        .update({
          deleted_at: null,
          deleted_by: null,
        })
        .not("deleted_at", "is", null);

      if (error) throw error;

      toast({
        title: "All Videos Restored",
        description: "All deleted videos have been restored successfully",
      });

      fetchDeletedVideos();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error restoring videos",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredVideos = videos.filter((video) => {
    const query = searchQuery.toLowerCase();
    return (
      video.title?.toLowerCase().includes(query) ||
      video.agent_name?.toLowerCase().includes(query) ||
      video.property_id?.toLowerCase().includes(query) ||
      video.deleted_by?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/video-quality">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 shrink-0">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Trash2 className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="truncate">Deleted Video Recovery</span>
            </h1>
          </div>
          {videos.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600 w-full sm:w-auto text-xs sm:text-sm">
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Restore All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restore All Videos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restore all {videos.length} deleted video{videos.length !== 1 ? 's' : ''} back to the video quality page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={restoreAll}>Restore All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {videos.length > 0 && (
          <Alert className="mb-6 bg-amber-950/50 border-amber-500">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-300 text-sm sm:text-base">Recovery Center</AlertTitle>
            <AlertDescription className="text-amber-200 text-xs sm:text-sm">
              These videos have been deleted but can still be restored. Permanent deletion will remove them forever.
            </AlertDescription>
          </Alert>
        )}

        {videos.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by title, agent, property ID, or deleted by..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 h-9 sm:h-10 text-sm"
              />
            </div>
          </div>
        )}

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">
              Deleted Videos ({filteredVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Loading deleted videos...
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm px-4">
                {searchQuery ? "No matching deleted videos found" : "No deleted videos found"}
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                  {filteredVideos.map((video) => (
                    <Card key={video.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Title: </span>
                            <span className="text-white">{video.title || "Untitled"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Agent: </span>
                            <span className="text-white">{video.agent_name || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Property ID: </span>
                            <span className="text-white">{video.property_id || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Deleted: </span>
                            <span className="text-white">{video.deleted_at ? formatDate(video.deleted_at) : "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Deleted By: </span>
                            <span className="text-white">{video.deleted_by || "Unknown"}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-600">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreVideo(video.id)}
                            disabled={restoring === video.id}
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600 flex-1 min-w-[120px] text-xs"
                          >
                            {restoring === video.id ? (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                Restoring...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Restore
                              </>
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={permanentDeleting === video.id}
                                className="flex-1 min-w-[120px] text-xs"
                              >
                                {permanentDeleting === video.id ? (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete Forever
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the video
                                  "{video.title || 'Untitled'}" and remove all associated data from storage.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => permanentDelete(video.id, video.video_file_url)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Forever
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Agent</TableHead>
                      <TableHead className="text-slate-300">Property ID</TableHead>
                      <TableHead className="text-slate-300">Deleted</TableHead>
                      <TableHead className="text-slate-300">Deleted By</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideos.map((video) => (
                      <TableRow key={video.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-white">
                          {video.title || "Untitled"}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {video.agent_name || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {video.property_id || "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {video.deleted_at ? formatDate(video.deleted_at) : "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {video.deleted_by || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restoreVideo(video.id)}
                              disabled={restoring === video.id}
                              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                            >
                              {restoring === video.id ? (
                                <>Restoring...</>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Restore
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={permanentDeleting === video.id}
                                >
                                  {permanentDeleting === video.id ? (
                                    <>Deleting...</>
                                  ) : (
                                    <>
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Permanent Delete
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the video
                                    "{video.title || 'Untitled'}" and remove all associated data from storage.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => permanentDelete(video.id, video.video_file_url)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Forever
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
                </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeletedVideos;
