import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Plus, Trash2, ExternalLink, Copy, CheckCircle, Loader2, Edit2, Star, Smartphone, Monitor, X } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface VideoSubmission {
  id: string;
  youtube_url: string;
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
}

const VideoQuality = () => {
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [agentName, setAgentName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoSubmission | null>(null);
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("video_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching videos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const validateYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const generateVideoLink = (id: string) => {
    return `${window.location.origin}/video-quality?video=${id}`;
  };

  const copyToClipboard = async (id: string) => {
    const link = generateVideoLink(id);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      toast({
        title: "Link Copied",
        description: "Video link has been copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const reviewVideo = async (videoId: string, youtubeUrl: string) => {
    setReviewingId(videoId);
    try {
      const { data, error } = await supabase.functions.invoke('review-video', {
        body: { videoId, youtubeUrl }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "AI Review Complete",
        description: `Video rated ${data.overall_rating}/10 - ${data.orientation} orientation`,
      });

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setReviewingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateYoutubeUrl(youtubeUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!agentName.trim()) {
      toast({
        title: "Agent Name Required",
        description: "Please enter the agent name",
        variant: "destructive",
      });
      return;
    }

    if (!propertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter the property ID",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("video_submissions").insert({
        youtube_url: youtubeUrl.trim(),
        title: title.trim() || null,
        description: description.trim() || null,
        agent_name: agentName.trim(),
        property_id: propertyId.trim(),
      }).select().single();

      if (error) throw error;

      setLastSubmittedId(data.id);

      toast({
        title: "Video Added",
        description: "Starting AI review...",
      });

      setYoutubeUrl("");
      setTitle("");
      setDescription("");
      setAgentName("");
      setPropertyId("");
      
      // Trigger AI review
      await reviewVideo(data.id, data.youtube_url);
      
      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error submitting video",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("video_submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Video Deleted",
        description: "Video has been removed",
      });

      if (lastSubmittedId === id) {
        setLastSubmittedId(null);
      }

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error deleting video",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditOpen = (video: VideoSubmission) => {
    setEditingVideo(video);
    setEditYoutubeUrl(video.youtube_url);
  };

  const handleEditClose = () => {
    setEditingVideo(null);
    setEditYoutubeUrl("");
  };

  const handleEditSave = async () => {
    if (!editingVideo) return;

    if (!editYoutubeUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateYoutubeUrl(editYoutubeUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setEditingSubmitting(true);
    try {
      const { error } = await supabase
        .from("video_submissions")
        .update({
          youtube_url: editYoutubeUrl.trim(),
          orientation: null,
          stability_rating: null,
          overall_rating: null,
          ai_feedback: null,
          reviewed_at: null,
        })
        .eq("id", editingVideo.id);

      if (error) throw error;

      toast({
        title: "URL Updated",
        description: "Starting AI review of new video...",
      });

      handleEditClose();
      
      // Trigger new AI review
      await reviewVideo(editingVideo.id, editYoutubeUrl.trim());
      
      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error updating video",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEditingSubmitting(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return "text-slate-400";
    if (rating >= 8) return "text-green-400";
    if (rating >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.round(rating / 2) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
          />
        ))}
        <span className={`ml-1 text-sm ${getRatingColor(rating)}`}>{rating}/10</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Video Quality Check</h1>
          </div>
        </div>

        {/* Success Card with Copy Link */}
        {lastSubmittedId && (
          <Card className="mb-8 bg-green-900/30 border-green-700">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-green-300 font-medium">Video submitted and reviewed!</p>
                    <p className="text-sm text-green-400/70">Copy the link below to share with others</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(lastSubmittedId)}
                  className="border-green-600 text-green-300 hover:bg-green-800/50"
                >
                  {copiedId === lastSubmittedId ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Video Form */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add YouTube Video for AI Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Agent Name *</label>
                  <Input
                    placeholder="Enter agent name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Property ID *</label>
                  <Input
                    placeholder="Enter property ID"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">YouTube URL *</label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Title (optional)</label>
                  <Input
                    placeholder="Video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Description (optional)</label>
                <Textarea
                  placeholder="Add notes about the video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting & Reviewing...
                  </>
                ) : (
                  "Add Video for AI Review"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Videos List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Video Submissions ({videos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading videos...</div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No videos submitted yet. Add a YouTube URL above to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Video</TableHead>
                      <TableHead className="text-slate-300">Agent</TableHead>
                      <TableHead className="text-slate-300">Property ID</TableHead>
                      <TableHead className="text-slate-300">Orientation</TableHead>
                      <TableHead className="text-slate-300">Stability</TableHead>
                      <TableHead className="text-slate-300">Overall</TableHead>
                      <TableHead className="text-slate-300">AI Feedback</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => {
                      const embedUrl = getYoutubeEmbedUrl(video.youtube_url);
                      const isReviewing = reviewingId === video.id;
                      return (
                        <TableRow key={video.id} className="border-slate-700">
                          <TableCell>
                            {embedUrl ? (
                              <div className="w-40 h-24 rounded overflow-hidden">
                                <iframe
                                  src={embedUrl}
                                  title={video.title || "YouTube video"}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <a
                                href={video.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Video
                              </a>
                            )}
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            {video.agent_name || "-"}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {video.property_id || "-"}
                          </TableCell>
                          <TableCell>
                            {isReviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : video.orientation ? (
                              <Badge variant={video.orientation === "horizontal" ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                                {video.orientation === "horizontal" ? (
                                  <Monitor className="h-3 w-3" />
                                ) : (
                                  <Smartphone className="h-3 w-3" />
                                )}
                                {video.orientation}
                              </Badge>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isReviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : video.stability_rating ? (
                              renderStars(video.stability_rating)
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isReviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : video.overall_rating ? (
                              renderStars(video.overall_rating)
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {isReviewing ? (
                              <span className="text-slate-400 text-sm">Reviewing...</span>
                            ) : video.ai_feedback ? (
                              <p className="text-slate-300 text-sm line-clamp-3" title={video.ai_feedback}>
                                {video.ai_feedback}
                              </p>
                            ) : (
                              <span className="text-slate-500 text-sm">Not reviewed</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditOpen(video)}
                                className="border-slate-600 hover:bg-slate-700"
                                title="Edit YouTube URL"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(video.id)}
                                className="border-slate-600 hover:bg-slate-700"
                                title="Copy link"
                              >
                                {copiedId === video.id ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => deleteVideo(video.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit YouTube URL Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && handleEditClose()}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit YouTube URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">YouTube URL *</label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={editYoutubeUrl}
                onChange={(e) => setEditYoutubeUrl(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <p className="text-sm text-slate-400">
              Changing the URL will trigger a new AI review of the video.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditClose} className="border-slate-600">
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editingSubmitting}>
              {editingSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoQuality;
