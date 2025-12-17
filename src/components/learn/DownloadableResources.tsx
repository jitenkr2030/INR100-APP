"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage,
  FileVideo,
  ExternalLink,
  Eye,
  Share2,
  Star
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'excel' | 'image' | 'video' | 'template' | 'worksheet';
  url: string;
  size: string;
  category: string;
  isPremium?: boolean;
  downloadCount?: number;
  rating?: number;
}

interface DownloadableResourcesProps {
  lessonId: string;
  resources?: Resource[];
  title?: string;
  description?: string;
  showCategories?: boolean;
  maxResources?: number;
}

export default function DownloadableResources({ 
  lessonId,
  resources = [],
  title = "Downloadable Resources",
  description = "Enhance your learning with these helpful materials",
  showCategories = true,
  maxResources
}: DownloadableResourcesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  // Default resources if none provided
  const defaultResources: Resource[] = [
    {
      id: 'worksheet-1',
      title: 'Financial Planning Worksheet',
      description: 'Comprehensive worksheet to track your income, expenses, and savings goals',
      type: 'pdf',
      url: `/courses/downloads/${lessonId}/worksheet.pdf`,
      size: '2.1 MB',
      category: 'Planning',
      downloadCount: 1250,
      rating: 4.8
    },
    {
      id: 'template-1',
      title: 'Investment Tracker Template',
      description: 'Excel template to track your SIP investments and portfolio performance',
      type: 'excel',
      url: `/courses/downloads/${lessonId}/investment-tracker.xlsx`,
      size: '156 KB',
      category: 'Tools',
      downloadCount: 890,
      rating: 4.6
    },
    {
      id: 'cheatsheet-1',
      title: 'Key Concepts Summary',
      description: 'Quick reference guide with all the important concepts from this lesson',
      type: 'pdf',
      url: `/courses/downloads/${lessonId}/summary.pdf`,
      size: '850 KB',
      category: 'Reference',
      downloadCount: 2100,
      rating: 4.9
    },
    {
      id: 'calculator-1',
      title: 'SIP Calculator Tool',
      description: 'Standalone calculator for SIP planning and projections',
      type: 'excel',
      url: `/courses/downloads/${lessonId}/sip-calculator.xlsx`,
      size: '234 KB',
      category: 'Tools',
      downloadCount: 756,
      rating: 4.7
    }
  ];

  const finalResources = resources.length > 0 ? resources : defaultResources;
  const displayedResources = maxResources ? finalResources.slice(0, maxResources) : finalResources;

  const categories = ['all', ...new Set(finalResources.map(r => r.category))];
  const filteredResources = selectedCategory === 'all' 
    ? displayedResources 
    : displayedResources.filter(r => r.category === selectedCategory);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'excel': return FileSpreadsheet;
      case 'image': return FileImage;
      case 'video': return FileVideo;
      default: return FileText;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-600 bg-red-100';
      case 'excel': return 'text-green-600 bg-green-100';
      case 'image': return 'text-purple-600 bg-purple-100';
      case 'video': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDownload = async (resource: Resource) => {
    setDownloadingIds(prev => new Set(prev).add(resource.id));
    
    try {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.title.replace(/\s+/g, '-');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Simulate tracking download (in real app, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(resource.id);
        return newSet;
      });
    }
  };

  const handlePreview = (resource: Resource) => {
    window.open(resource.url, '_blank');
  };

  const handleShare = (resource: Resource) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: resource.url,
      });
    } else {
      navigator.clipboard.writeText(resource.url);
      // You could show a toast notification here
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>

        {/* Category Filter */}
        {showCategories && categories.length > 1 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource) => {
            const FileIcon = getFileIcon(resource.type);
            const isDownloading = downloadingIds.has(resource.id);

            return (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  {/* File Icon */}
                  <div className={`p-2 rounded-lg ${getFileColor(resource.type)}`}>
                    <FileIcon className="h-5 w-5" />
                  </div>

                  {/* Resource Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{resource.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {resource.description}
                        </p>
                      </div>
                      
                      {resource.isPremium && (
                        <Star className="h-4 w-4 text-yellow-500 ml-2 flex-shrink-0" />
                      )}
                    </div>

                    {/* Resource Meta */}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span className="capitalize">{resource.type}</span>
                      <span>{resource.size}</span>
                      {resource.downloadCount && (
                        <span>{resource.downloadCount.toLocaleString()} downloads</span>
                      )}
                      {resource.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{resource.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mt-3">
                      <Button
                        onClick={() => handleDownload(resource)}
                        disabled={isDownloading}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => handlePreview(resource)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>

                      <Button
                        onClick={() => handleShare(resource)}
                        size="sm"
                        variant="ghost"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No resources available for this category</p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Pro Tip:</strong> Download these resources to practice and reinforce your learning. 
            Keep them handy for quick reference and real-world application!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}