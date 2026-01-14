import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Plus, Trash2, Check, X, ExternalLink } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoSubmission {
  id: string;
  youtube_url: string;
  title: string | null;
  description: string | null;
  quality_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const VideoQuality = () => {
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

    setSubmitting(true);
    try {
      const { error } = await supabase.from("video_submissions").insert({
        youtube_url: youtubeUrl.trim(),
        title: title.trim() || null,
        description: description.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Video Added",
        description: "Video has been submitted for quality review",
      });

      setYoutubeUrl("");
      setTitle("");
      setDescription("");
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

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("video_submissions")
        .update({ quality_status: status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Video marked as ${status}`,
      });

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
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

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error deleting video",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">✅ Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">❌ Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">⏳ Pending</Badge>;
    }
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
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

        {/* Add Video Form */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add YouTube Video for Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {submitting ? "Submitting..." : "Add Video for Review"}
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
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Date Added</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => {
                      const embedUrl = getYoutubeEmbedUrl(video.youtube_url);
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
                          <TableCell className="text-white">
                            <div>
                              <div className="font-medium">{video.title || "Untitled"}</div>
                              {video.description && (
                                <div className="text-sm text-slate-400 truncate max-w-xs">
                                  {video.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(video.quality_status)}</TableCell>
                          <TableCell className="text-slate-400">
                            {new Date(video.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={video.quality_status}
                                onValueChange={(value) => updateStatus(video.id, value)}
                              >
                                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
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
    </div>
  );
};

export default VideoQuality;
