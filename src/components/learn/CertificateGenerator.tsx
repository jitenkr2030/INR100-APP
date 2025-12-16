"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  Clock, 
  Trophy,
  CheckCircle,
  ExternalLink,
  FileText,
  Mail
} from "lucide-react";

interface Certificate {
  id: string;
  certificateNumber: string;
  courseName: string;
  categoryName: string;
  issuedAt: string;
  completionPercentage: number;
  totalTimeSpent: number;
  finalScore?: number;
  pdfUrl?: string;
  isValid: boolean;
}

interface CertificateGeneratorProps {
  userId?: string;
  courseId?: string;
  showGenerateButton?: boolean;
}

export default function CertificateGenerator({ 
  userId = 'demo-user', 
  courseId,
  showGenerateButton = true 
}: CertificateGeneratorProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, [userId]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn/certificates?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setCertificates(data.data.certificates);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      // Fallback to mock data
      setCertificates(getMockCertificates());
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!courseId) return;

    try {
      setGenerating(true);
      const response = await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          categoryId: 'basics',
          moduleId: 'money-basics'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadCertificates();
      } else {
        console.error('Certificate generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = (certificate: Certificate) => {
    // In a real app, this would download the actual PDF
    // For now, we'll simulate the download
    const link = document.createElement('a');
    link.href = certificate.pdfUrl || '#';
    link.download = `INR100-Certificate-${certificate.certificateNumber}.pdf`;
    link.click();
  };

  const shareCertificate = (certificate: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `INR100 Certificate - ${certificate.courseName}`,
        text: `I just completed ${certificate.courseName} on INR100!`,
        url: window.location.href
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Certificate link copied to clipboard!');
    }
  };

  const getMockCertificates = (): Certificate[] => [
    {
      id: 'cert-1',
      certificateNumber: 'INR100-2025-001',
      courseName: 'Stock Market Foundations',
      categoryName: 'Investing Basics',
      issuedAt: '2025-12-15T10:30:00Z',
      completionPercentage: 100,
      totalTimeSpent: 180, // minutes
      finalScore: 95.5,
      pdfUrl: '#',
      isValid: true
    },
    {
      id: 'cert-2',
      certificateNumber: 'INR100-2025-002',
      courseName: 'Scam Awareness & Investment Safety',
      categoryName: 'Risk Management',
      issuedAt: '2025-12-14T14:20:00Z',
      completionPercentage: 100,
      totalTimeSpent: 90,
      finalScore: 100,
      pdfUrl: '#',
      isValid: true
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-6 w-6 text-yellow-600" />
            <span>Certificates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-6 w-6 text-yellow-600" />
            <span>Certificates</span>
            <Badge className="bg-yellow-100 text-yellow-800">
              {certificates.length} earned
            </Badge>
          </CardTitle>
          
          {showGenerateButton && courseId && (
            <Button 
              onClick={generateCertificate}
              disabled={generating}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {certificates.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Certificates Yet</h3>
            <p className="text-gray-500 mb-4">
              Complete your first course to earn a certificate!
            </p>
            {showGenerateButton && courseId && (
              <Button 
                onClick={generateCertificate}
                disabled={generating}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Generate Certificate
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="border border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Certificate Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-yellow-900">
                            Certificate of Completion
                          </h3>
                          <p className="text-yellow-700">
                            {certificate.courseName}
                          </p>
                        </div>
                        {certificate.isValid && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Issued</p>
                            <p className="text-sm font-medium">
                              {formatDate(certificate.issuedAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-medium">
                              {formatDuration(certificate.totalTimeSpent)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Completion</p>
                            <p className="text-sm font-medium">
                              {certificate.completionPercentage}%
                            </p>
                          </div>
                        </div>
                        
                        {certificate.finalScore && (
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Score</p>
                              <p className="text-sm font-medium">
                                {certificate.finalScore}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>Certificate No: {certificate.certificateNumber}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        size="sm"
                        onClick={() => downloadCertificate(certificate)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareCertificate(certificate)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(certificate.pdfUrl || '#', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Achievement Summary */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">Learning Achievements</h4>
                  <p className="text-sm text-blue-700">
                    You've earned {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} 
                    {' '}through your dedication to learning!
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-900">
                    {certificates.length > 0 ? '🎓' : '📚'}
                  </p>
                  <p className="text-xs text-blue-600">
                    {certificates.length > 0 ? 'Certified Expert' : 'Keep Learning!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}