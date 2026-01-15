import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Plus, Trash2, Copy, CheckCircle, Loader2, Edit2, Upload, Link as LinkIcon } from "lucide-react";
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
  youtube_url: string | null;
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
}

const VideoQuality = () => {
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [agentName, setAgentName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoSubmission | null>(null);
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const copyYoutubeUrl = async (youtubeUrl: string | null) => {
    if (!youtubeUrl) {
      toast({
        title: "No YouTube URL",
        description: "This video doesn't have a YouTube URL yet. Use Edit to add one.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(youtubeUrl);
      toast({
        title: "YouTube URL Copied",
        description: "YouTube URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 100MB",
          variant: "destructive",
        });
        return;
      }
      // Check file type
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select a video file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadVideo = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (!selectedFile) {
      toast({
        title: "Video Required",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setUploading(true);
    
    try {
      const videoFileUrl = await uploadVideo(selectedFile);

      const { error } = await supabase.from("video_submissions").insert({
        youtube_url: null,
        video_file_url: videoFileUrl,
        title: title.trim() || null,
        agent_name: agentName.trim(),
        property_id: propertyId.trim(),
      });

      if (error) throw error;

      toast({
        title: "Video Submitted",
        description: "Video has been uploaded successfully. You can now add a YouTube URL via the Edit button.",
      });

      setTitle("");
      setAgentName("");
      setPropertyId("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error submitting video",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const deleteVideo = async (id: string, videoFileUrl: string | null) => {
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
        title: "Video Deleted",
        description: "Video submission has been removed",
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

  const handleEditOpen = (video: VideoSubmission) => {
    setEditingVideo(video);
    setEditYoutubeUrl(video.youtube_url || "");
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
        })
        .eq("id", editingVideo.id);

      if (error) throw error;

      toast({
        title: "YouTube URL Added",
        description: "YouTube URL has been saved successfully",
      });

      handleEditClose();
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

  const renderVideoPreview = (video: VideoSubmission) => {
    if (video.video_file_url) {
      return (
        <div className="w-40 h-24 rounded overflow-hidden bg-slate-900">
          <video
            src={video.video_file_url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        </div>
      );
    }
    
    return <span className="text-slate-500">No video</span>;
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
              Upload Video
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

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Title (optional)</label>
                <Input
                  placeholder="Video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Video File * (Max 100MB)</label>
                <div className="flex items-center gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0 file:mr-4"
                  />
                  {selectedFile && (
                    <Badge variant="secondary" className="shrink-0">
                      {selectedFile.name}
                    </Badge>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? "Uploading..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Video
                  </>
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
                No videos submitted yet. Upload a video above to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Video</TableHead>
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Agent</TableHead>
                      <TableHead className="text-slate-300">Property ID</TableHead>
                      <TableHead className="text-slate-300">YouTube URL</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id} className="border-slate-700">
                        <TableCell>{renderVideoPreview(video)}</TableCell>
                        <TableCell className="text-white font-medium">
                          {video.title || "-"}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {video.agent_name || "-"}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {video.property_id || "-"}
                        </TableCell>
                        <TableCell>
                          {video.youtube_url ? (
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm truncate max-w-[150px]" title={video.youtube_url}>
                                {video.youtube_url}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                              Not added
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditOpen(video)}
                              className="border-slate-600 hover:bg-slate-700"
                              title={video.youtube_url ? "Edit YouTube URL" : "Add YouTube URL"}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                copyYoutubeUrl(video.youtube_url);
                                if (video.youtube_url) {
                                  setCopiedId(video.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }
                              }}
                              className="border-slate-600 hover:bg-slate-700"
                              title="Copy YouTube URL"
                              disabled={!video.youtube_url}
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
                              onClick={() => deleteVideo(video.id, video.video_file_url)}
                              title="Delete submission"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit YouTube URL Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && handleEditClose()}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingVideo?.youtube_url ? "Edit YouTube URL" : "Add YouTube URL"}
            </DialogTitle>
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
              Add the YouTube URL for this video submission.
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
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoQuality;
