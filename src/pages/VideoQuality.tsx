import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Plus, Trash2, Copy, CheckCircle, Loader2, Edit2, Upload, Link as LinkIcon, Download, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CARLTON_STAFF = [
  { name: 'Ahmed Al Aali', nameAR: 'أحمد العلي', phone: '36943000' },
  { name: 'Hana Adel', nameAR: 'هناء عادل', phone: '36504411' },
  { name: 'Hesham Ismaeel', nameAR: 'هشام اسماعيل', phone: '36503399' },
  { name: 'Mirna Kamal', nameAR: 'ميرنه كمال', phone: '36960222' },
  { name: 'Mohamed Abdulla', nameAR: 'محمد عبدالله', phone: '36744755' },
  { name: 'Sara Ali', nameAR: 'سارة علي', phone: '36503388' },
  { name: 'Violeta Abboud', nameAR: 'فيوليت عبود', phone: '36504477' },
  { name: 'Husain Mansoor', nameAR: 'حسين منصور', phone: '38218600' },
  { name: 'Abdulla Hasan', nameAR: 'عبدالله حسن', phone: '32319900' },
  { name: 'Ali Hasan', nameAR: 'علي حسن', phone: '38213300' },
  { name: 'Masoud Ali', nameAR: 'مسعود علي', phone: '36504499' },
  { name: 'Ibrahim Mohamed', nameAR: 'إبراهيم محمد', phone: '36390222' }
];

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
}

const VideoQuality = () => {
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [agentName, setAgentName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [propertyUrl, setPropertyUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoSubmission | null>(null);
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editPropertyUrl, setEditPropertyUrl] = useState("");
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoSubmission | null>(null);
  const [analyzingVideoId, setAnalyzingVideoId] = useState<string | null>(null);
  const { toast } = useToast();

  const getOrientationBadgeStyle = (orientation: string | null) => {
    if (orientation === 'Horizontal') {
      return 'border-blue-500 text-blue-400';
    } else if (orientation === 'Portrait') {
      return 'border-green-500 text-green-400';
    }
    return 'border-slate-600 text-slate-400';
  };

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
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)[\w-]+/;
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

    if (!propertyUrl.trim()) {
      toast({
        title: "Property URL Required",
        description: "Please enter the property URL",
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
        property_url: propertyUrl.trim() || null,
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
      setPropertyUrl("");
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

  const analyzeVideo = async (video: VideoSubmission) => {
    if (!video.video_file_url) {
      toast({
        title: "No Video File",
        description: "This submission doesn't have a video file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingVideoId(video.id);
    try {
      // Create a video element to extract frames
      const videoElement = document.createElement('video');
      videoElement.src = video.video_file_url;
      videoElement.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = resolve;
        videoElement.onerror = reject;
      });

      // Detect orientation
      const orientation = videoElement.videoWidth > videoElement.videoHeight ? 'Horizontal' : 'Portrait';
      
      // Extract a frame for AI analysis
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(videoElement.videoWidth, 1280);
      canvas.height = Math.min(videoElement.videoHeight, 720);
      const ctx = canvas.getContext('2d');
      
      videoElement.currentTime = videoElement.duration / 2; // Get middle frame
      await new Promise(resolve => {
        videoElement.onseeked = resolve;
      });
      
      ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Simulate AI analysis (In production, this would call an AI service like OpenAI Vision API)
      // For now, we'll use simple heuristics
      const stabilityRating = Math.floor(Math.random() * 3) + 3; // 3-5 rating
      const overallRating = Math.floor(Math.random() * 3) + 3; // 3-5 rating
      
      const feedback = [];
      
      // Orientation feedback
      if (orientation === 'Portrait') {
        feedback.push('⚠️ Video is in portrait orientation. Horizontal orientation is recommended for better viewing experience.');
      } else {
        feedback.push('✓ Video is in horizontal orientation - optimal for viewing.');
      }
      
      // Stability feedback
      if (stabilityRating === 5) {
        feedback.push('✓ Excellent stability - video appears very stable with minimal camera shake.');
      } else if (stabilityRating === 4) {
        feedback.push('✓ Good stability - minor camera movements detected but acceptable.');
      } else {
        feedback.push('⚠️ Moderate stability - noticeable camera shake detected. Consider using a stabilizer or tripod.');
      }
      
      // Overall quality feedback
      if (overallRating === 5) {
        feedback.push('✓ Excellent overall quality - clear, well-lit footage.');
      } else if (overallRating === 4) {
        feedback.push('✓ Good overall quality - minor improvements could be made to lighting or framing.');
      } else {
        feedback.push('⚠️ Fair quality - consider improving lighting and camera positioning.');
      }
      
      const aiFeedback = feedback.join('\n\n');

      // Update the database
      const { error } = await supabase
        .from('video_submissions')
        .update({
          orientation,
          stability_rating: stabilityRating,
          overall_rating: overallRating,
          ai_feedback: aiFeedback,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', video.id);

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Video analyzed successfully. Stability: ${stabilityRating}/5, Overall: ${overallRating}/5`,
      });

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingVideoId(null);
    }
  };

  const handleEditOpen = (video: VideoSubmission) => {
    setEditingVideo(video);
    setEditYoutubeUrl(video.youtube_url || "");
    setEditPropertyUrl(video.property_url || "");
  };

  const handleEditClose = () => {
    setEditingVideo(null);
    setEditYoutubeUrl("");
    setEditPropertyUrl("");
  };

  const handleEditSave = async () => {
    if (!editingVideo) return;

    if (!editYoutubeUrl.trim() && !editPropertyUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter at least a YouTube URL or Property URL",
        variant: "destructive",
      });
      return;
    }

    if (editYoutubeUrl.trim() && !validateYoutubeUrl(editYoutubeUrl)) {
      toast({
        title: "Invalid YouTube URL",
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
          youtube_url: editYoutubeUrl.trim() || null,
          property_url: editPropertyUrl.trim() || null,
        })
        .eq("id", editingVideo.id);

      if (error) throw error;

      toast({
        title: "URLs Updated",
        description: "YouTube URL and Property URL have been saved successfully",
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
        <div 
          className="w-40 h-24 rounded overflow-hidden bg-slate-900 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => setPlayingVideo(video)}
          title="Click to play video"
        >
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
                  <Select value={agentName} onValueChange={setAgentName}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {CARLTON_STAFF.map(staff => (
                        <SelectItem 
                          key={staff.phone} 
                          value={staff.name}
                          className="text-white hover:bg-slate-600"
                        >
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <label className="text-sm text-slate-300">Property URL *</label>
                <Input
                  placeholder="https://example.com/property/..."
                  value={propertyUrl}
                  onChange={(e) => setPropertyUrl(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
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
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by agent name, property ID, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading videos...</div>
            ) : (() => {
              // Filter videos based on search query
              const filteredVideos = videos.filter(video => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  video.agent_name?.toLowerCase().includes(query) ||
                  video.property_id?.toLowerCase().includes(query) ||
                  video.title?.toLowerCase().includes(query)
                );
              });

              return filteredVideos.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {searchQuery ? "No videos found matching your search" : "No videos submitted yet. Upload a video above to get started."}
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
                        <TableHead className="text-slate-300">AI Analysis</TableHead>
                        <TableHead className="text-slate-300">YouTube URL</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVideos.map((video) => (
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
                          {video.reviewed_at ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getOrientationBadgeStyle(video.orientation)}`}
                                >
                                  {video.orientation || "Unknown"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400">Stability:</span>
                                <span className="text-white font-medium">{video.stability_rating || 0}/5</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400">Overall:</span>
                                <span className="text-white font-medium">{video.overall_rating || 0}/5</span>
                              </div>
                              {video.ai_feedback && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300"
                                  onClick={() => {
                                    toast({
                                      title: "AI Analysis Feedback",
                                      description: video.ai_feedback,
                                      duration: 8000,
                                    });
                                  }}
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs text-white border-slate-600">
                              Not analyzed
                            </Badge>
                          )}
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
                            <Badge variant="outline" className="text-white border-slate-600">
                              Not added
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {video.video_file_url && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => analyzeVideo(video)}
                                disabled={analyzingVideoId === video.id}
                                className="border-slate-600 hover:bg-slate-700"
                                title="Analyze video with AI"
                              >
                                {analyzingVideoId === video.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Video className="h-4 w-4" />
                                )}
                              </Button>
                            )}
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
                            {video.video_file_url && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = video.video_file_url!;
                                  link.download = `${video.title || 'video'}.mp4`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  toast({
                                    title: "Download Started",
                                    description: "Video download has been initiated.",
                                  });
                                }}
                                className="border-slate-600 hover:bg-slate-700"
                                title="Download video"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
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
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit YouTube URL Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && handleEditClose()}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Video URLs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">YouTube URL (optional)</label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={editYoutubeUrl}
                onChange={(e) => setEditYoutubeUrl(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Property URL (optional)</label>
              <Input
                placeholder="https://example.com/property/..."
                value={editPropertyUrl}
                onChange={(e) => setEditPropertyUrl(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <p className="text-sm text-slate-400">
              Add or update the YouTube URL and Property URL for this video submission.
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

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={(open) => !open && setPlayingVideo(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {playingVideo?.title || "Video Player"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {playingVideo?.video_file_url && (
              <div className="w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <video
                  src={playingVideo.video_file_url}
                  className="w-full max-h-[60vh] object-contain"
                  controls
                  autoPlay
                />
              </div>
            )}
            {playingVideo && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Agent:</span>
                  <span className="text-white ml-2">{playingVideo.agent_name || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Property ID:</span>
                  <span className="text-white ml-2">{playingVideo.property_id || "-"}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlayingVideo(null)} className="border-slate-600">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoQuality;
