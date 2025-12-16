"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  FileText,
  Image,
  Video,
  Code,
  Calculator,
  Award,
  Clock
} from "lucide-react";
import ContentRenderer from "./ContentRenderer";

interface LessonPlayerProps {
  lesson: any;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onTimeUpdate: (time: number) => void;
  onComplete: () => void;
}

export default function LessonPlayer({ 
  lesson, 
  isPlaying, 
  onPlayToggle, 
  onTimeUpdate, 
  onComplete 
}: LessonPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Simulate progress tracking
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const progressPercent = (newTime / (lesson.estimatedDuration * 60)) * 100;
          setProgress(progressPercent);
          onTimeUpdate(newTime);
          
          // Auto-complete after estimated duration
          if (newTime >= lesson.estimatedDuration * 60) {
            onComplete();
            return newTime;
          }
          
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, lesson.estimatedDuration, onTimeUpdate, onComplete]);

  const handleRestart = () => {
    setCurrentTime(0);
    setProgress(0);
    onTimeUpdate(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



  const getContentIcon = () => {
    if (!lesson.content) return FileText;
    
    switch (lesson.content.type) {
      case 'video': return Video;
      case 'interactive': return Code;
      case 'quiz': return Calculator;
      case 'text':
      case 'markdown': return FileText;
      default: return FileText;
    }
  };

  const ContentIcon = getContentIcon();

  return (
    <div className="space-y-6">
      {/* Player Controls */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onPlayToggle}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(lesson.estimatedDuration * 60)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleRestart}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Display */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ContentIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">{lesson.title}</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {lesson.content?.type || 'text'}
            </span>
          </div>
          
          <ContentRenderer content={lesson.content || { type: 'text', html: lesson.description }} />
        </CardContent>
      </Card>

      {/* Lesson Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Estimated Time</p>
            <p className="font-semibold">{lesson.estimatedDuration} min</p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Content Type</p>
            <p className="font-semibold capitalize">{lesson.content?.type || 'Text'}</p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">XP Reward</p>
            <p className="font-semibold">+{lesson.xpReward || 50} XP</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}