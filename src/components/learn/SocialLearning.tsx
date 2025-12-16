"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Users, 
  Share2, 
  ThumbsUp, 
  Send,
  Trophy,
  TrendingUp,
  Clock,
  BookOpen,
  Heart,
  Reply,
  UserPlus,
  UserCheck,
  Globe,
  Zap,
  Award
} from "lucide-react";

interface Discussion {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked: boolean;
  course?: string;
  lesson?: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  isJoined: boolean;
  category: string;
  lastActivity: string;
  image?: string;
}

interface ProgressShare {
  id: string;
  userName: string;
  userAvatar?: string;
  achievement: string;
  course: string;
  progress: number;
  timestamp: string;
  likes: number;
  comments: number;
}

interface SocialLearningProps {
  userId?: string;
  currentCourse?: string;
  currentLesson?: string;
}

export default function SocialLearning({ 
  userId = 'demo-user', 
  currentCourse,
  currentLesson 
}: SocialLearningProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [progressShares, setProgressShares] = useState<ProgressShare[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discussions");

  useEffect(() => {
    loadSocialData();
  }, [userId, currentCourse, currentLesson]);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      
      // Load discussions
      const discussionsResponse = await fetch(`/api/learn/social/discussions?course=${currentCourse}&lesson=${currentLesson}`);
      const discussionsData = await discussionsResponse.json();
      
      // Load study groups
      const groupsResponse = await fetch(`/api/learn/social/groups?course=${currentCourse}`);
      const groupsData = await groupsResponse.json();
      
      // Load progress shares
      const sharesResponse = await fetch(`/api/learn/social/shares?course=${currentCourse}`);
      const sharesData = await sharesResponse.json();

      if (discussionsData.success) setDiscussions(discussionsData.data.discussions);
      if (groupsData.success) setStudyGroups(groupsData.data.groups);
      if (sharesData.success) setProgressShares(sharesData.data.shares);

    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/learn/social/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content: newMessage,
          course: currentCourse,
          lesson: currentLesson
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDiscussions(prev => [result.data, ...prev]);
          setNewMessage("");
        }
      }
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/learn/social/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setStudyGroups(prev => prev.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: true, members: group.members + 1 }
            : group
        ));
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLike = async (type: 'discussion' | 'share', id: string) => {
    try {
      const response = await fetch(`/api/learn/social/${type}/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        if (type === 'discussion') {
          setDiscussions(prev => prev.map(discussion => 
            discussion.id === id 
              ? { 
                  ...discussion, 
                  isLiked: !discussion.isLiked, 
                  likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1 
                }
              : discussion
          ));
        } else {
          setProgressShares(prev => prev.map(share => 
            share.id === id 
              ? { ...share, likes: share.likes + 1 }
              : share
          ));
        }
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span>Social Learning</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-3 m-0 rounded-none h-auto p-0">
              <TabsTrigger value="discussions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <MessageCircle className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="groups" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <Users className="h-4 w-4 mr-2" />
                Study Groups
              </TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="discussions" className="p-6 m-0">
            {/* Post New Message */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Share your thoughts or ask a question..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePostMessage()}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2 text-sm text-gray-500">
                      {currentCourse && <Badge variant="secondary">{currentCourse}</Badge>}
                      {currentLesson && <Badge variant="outline">Lesson: {currentLesson}</Badge>}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handlePostMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={discussion.userAvatar} />
                      <AvatarFallback>{discussion.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{discussion.userName}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(discussion.timestamp)}</span>
                        {discussion.course && (
                          <Badge variant="outline" className="text-xs">
                            {discussion.course}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{discussion.content}</p>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike('discussion', discussion.id)}
                          className={discussion.isLiked ? 'text-blue-600' : 'text-gray-500'}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {discussion.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <Reply className="h-4 w-4 mr-1" />
                          {discussion.replies} replies
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {discussions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No discussions yet. Be the first to start a conversation!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="p-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyGroups.map((group) => (
                <div key={group.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm">{group.name}</h3>
                        <Badge variant="outline" className="text-xs">{group.category}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{group.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{group.members} members</span>
                          <span>•</span>
                          <span>Active {formatTimeAgo(group.lastActivity)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={group.isJoined ? "outline" : "default"}
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={group.isJoined}
                          className="text-xs"
                        >
                          {group.isJoined ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Joined
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3 mr-1" />
                              Join
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {studyGroups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No study groups available for this course yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="p-6 m-0">
            <div className="space-y-4">
              {progressShares.map((share) => (
                <div key={share.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={share.userAvatar} />
                      <AvatarFallback>{share.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{share.userName}</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {share.achievement}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatTimeAgo(share.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Just completed <strong>{share.course}</strong> course
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike('share', share.id)}
                        >
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          {share.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {share.comments} comments
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {progressShares.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent achievements to show yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}