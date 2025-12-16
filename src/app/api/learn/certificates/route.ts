import { NextRequest, NextResponse } from 'next/server';
import ProgressService from '@/lib/progressService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // In a real app, this would fetch from database
    // For now, return mock certificate data
    const certificates = getMockCertificates(userId);

    return NextResponse.json({
      success: true,
      data: {
        certificates,
        summary: {
          total: certificates.length,
          thisMonth: certificates.filter(c => {
            const issuedDate = new Date(c.issuedAt);
            const now = new Date();
            return issuedDate.getMonth() === now.getMonth() && 
                   issuedDate.getFullYear() === now.getFullYear();
          }).length,
          totalLearningTime: certificates.reduce((sum, c) => sum + c.totalTimeSpent, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, categoryId, moduleId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'User ID and Course ID are required' },
        { status: 400 }
      );
    }

    const progressService = ProgressService.getInstance();
    const result = await progressService.generateCertificate(
      userId, 
      courseId, 
      categoryId, 
      moduleId
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          certificate: {
            id: result.data.id,
            certificateNumber: result.data.certificateNumber,
            issuedAt: result.data.issuedAt,
            completionPercentage: result.data.completionPercentage,
            totalTimeSpent: result.data.totalTimeSpent,
            pdfUrl: generatePDFUrl(result.data.certificateNumber),
            isValid: result.data.isValid
          },
          message: 'Certificate generated successfully!'
        }
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Generate certificate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

function getMockCertificates(userId: string) {
  // Mock certificate data based on user ID
  const baseCertificates = [
    {
      id: 'cert-stock-foundations',
      certificateNumber: `INR100-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      courseName: 'Stock Market Foundations',
      categoryName: 'Investing Basics',
      issuedAt: '2025-12-15T10:30:00Z',
      completionPercentage: 100,
      totalTimeSpent: 180, // 3 hours
      finalScore: 95.5,
      pdfUrl: '#',
      isValid: true
    },
    {
      id: 'cert-scam-awareness',
      certificateNumber: `INR100-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      courseName: 'Scam Awareness & Investment Safety',
      categoryName: 'Risk Management',
      issuedAt: '2025-12-14T14:20:00Z',
      completionPercentage: 100,
      totalTimeSpent: 90, // 1.5 hours
      finalScore: 100,
      pdfUrl: '#',
      isValid: true
    }
  ];

  // Add more certificates based on user engagement
  const additionalCertificates = [];
  
  // If user has been active, add more certificates
  if (userId !== 'demo-user') {
    additionalCertificates.push({
      id: 'cert-mutual-funds',
      certificateNumber: `INR100-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      courseName: 'Mutual Funds Deep Dive',
      categoryName: 'Investment Strategies',
      issuedAt: '2025-12-13T16:45:00Z',
      completionPercentage: 100,
      totalTimeSpent: 240, // 4 hours
      finalScore: 88.2,
      pdfUrl: '#',
      isValid: true
    });

    additionalCertificates.push({
      id: 'cert-behavioral-finance',
      certificateNumber: `INR100-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      courseName: 'Behavioral Finance & Psychology',
      categoryName: 'Advanced Concepts',
      issuedAt: '2025-12-12T11:15:00Z',
      completionPercentage: 100,
      totalTimeSpent: 120, // 2 hours
      finalScore: 92.8,
      pdfUrl: '#',
      isValid: true
    });
  }

  return [...baseCertificates, ...additionalCertificates];
}

function generatePDFUrl(certificateNumber: string): string {
  // In a real app, this would be a actual PDF URL
  return `https://api.inr100.com/certificates/pdf/${certificateNumber}`;
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('id');

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    // In a real app, this would invalidate the certificate in the database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Certificate invalidated successfully'
    });
  } catch (error) {
    console.error('Invalidate certificate error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate certificate' },
      { status: 500 }
    );
  }
}