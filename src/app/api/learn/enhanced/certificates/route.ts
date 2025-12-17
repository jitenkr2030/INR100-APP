import { NextRequest, NextResponse } from 'next/server';

// Certificate interfaces
interface Certificate {
  id: string;
  userId: string;
  type: 'module_completion' | 'assessment_excellence' | 'learning_journey' | 'special_achievement';
  title: string;
  description: string;
  moduleId?: number;
  assessmentId?: string;
  issuedAt: string;
  expiresAt?: string;
  score?: number;
  verificationCode: string;
  metadata: {
    completionDate: string;
    timeSpent: number;
    interactiveFeaturesUsed: string[];
    achievements: string[];
    level: number;
    xpAtCompletion: number;
  };
  template: {
    background: string;
    border: string;
    textColor: string;
    logo?: string;
    signature?: string;
  };
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  type: Certificate['type'];
  requirements: {
    minScore?: number;
    modules?: number[];
    timeSpent?: number;
    achievements?: string[];
  };
  design: {
    background: string;
    border: string;
    textColor: string;
    layout: string;
  };
}

// Mock certificates database
const mockCertificates: Certificate[] = [
  {
    id: 'cert-001',
    userId: 'demo-user-id',
    type: 'module_completion',
    title: 'Banking & Insurance Fundamentals',
    description: 'Successfully completed comprehensive course on banking products and insurance planning',
    moduleId: 17,
    issuedAt: '2024-12-15T10:30:00Z',
    verificationCode: 'BIF2024-001',
    metadata: {
      completionDate: '2024-12-15',
      timeSpent: 480, // minutes
      interactiveFeaturesUsed: ['calculators', 'case_studies', 'assessments'],
      achievements: ['Module Master', 'Calculator Master'],
      level: 3,
      xpAtCompletion: 1850
    },
    template: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid #ffd700',
      textColor: '#ffffff'
    }
  },
  {
    id: 'cert-002',
    userId: 'demo-user-id',
    type: 'assessment_excellence',
    title: 'Assessment Excellence - Banking & Insurance',
    description: 'Achieved outstanding performance with 95% score in Banking & Insurance assessment',
    moduleId: 17,
    assessmentId: 'assessment-module-17',
    issuedAt: '2024-12-16T14:20:00Z',
    score: 95,
    verificationCode: 'AE2024-017',
    metadata: {
      completionDate: '2024-12-16',
      timeSpent: 35,
      interactiveFeaturesUsed: ['calculators', 'case_studies'],
      achievements: ['Perfect Score', 'Assessment Champion'],
      level: 3,
      xpAtCompletion: 2100
    },
    template: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      border: '2px solid #ff6b6b',
      textColor: '#ffffff'
    }
  }
];

// Certificate templates
const certificateTemplates: CertificateTemplate[] = [
  {
    id: 'module_completion_template',
    name: 'Module Completion Certificate',
    description: 'Awarded for successfully completing a learning module',
    type: 'module_completion',
    requirements: {
      minScore: 70,
      timeSpent: 180 // minimum 3 hours
    },
    design: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid #ffd700',
      textColor: '#ffffff',
      layout: 'classic'
    }
  },
  {
    id: 'assessment_excellence_template',
    name: 'Assessment Excellence Certificate',
    description: 'Awarded for outstanding performance in assessments',
    type: 'assessment_excellence',
    requirements: {
      minScore: 90,
      achievements: ['Perfect Score']
    },
    design: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      border: '2px solid #ff6b6b',
      textColor: '#ffffff',
      layout: 'modern'
    }
  },
  {
    id: 'learning_journey_template',
    name: 'Learning Journey Certificate',
    description: 'Awarded for completing a comprehensive learning path',
    type: 'learning_journey',
    requirements: {
      modules: [17, 18, 19],
      timeSpent: 720 // minimum 12 hours
    },
    design: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      border: '2px solid #00f2fe',
      textColor: '#ffffff',
      layout: 'elegant'
    }
  }
];

// Mock certificate generation tracking
const certificateQueue = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user-id';
    const type = searchParams.get('type');
    const moduleId = searchParams.get('moduleId');
    
    // Get user's certificates
    let userCertificates = mockCertificates.filter(cert => cert.userId === userId);
    
    // Filter by type if specified
    if (type) {
      userCertificates = userCertificates.filter(cert => cert.type === type);
    }
    
    // Filter by module if specified
    if (moduleId) {
      userCertificates = userCertificates.filter(cert => cert.moduleId === parseInt(moduleId));
    }
    
    // Calculate certificate statistics
    const certificateStats = {
      total: userCertificates.length,
      byType: {
        module_completion: userCertificates.filter(c => c.type === 'module_completion').length,
        assessment_excellence: userCertificates.filter(c => c.type === 'assessment_excellence').length,
        learning_journey: userCertificates.filter(c => c.type === 'learning_journey').length,
        special_achievement: userCertificates.filter(c => c.type === 'special_achievement').length
      },
      averageScore: userCertificates.filter(c => c.score).reduce((sum, cert) => sum + cert.score!, 0) / 
                   (userCertificates.filter(c => c.score).length || 1),
      totalXpFromCertificates: userCertificates.reduce((sum, cert) => sum + cert.metadata.xpAtCompletion, 0)
    };
    
    // Check for available certificates to generate
    const availableCertificates = await checkAvailableCertificates(userId);
    
    // Get certificate templates
    const availableTemplates = certificateTemplates.filter(template => {
      // Check if user meets requirements for template
      return checkTemplateEligibility(userId, template);
    });
    
    return NextResponse.json({
      success: true,
      data: {
        certificates: userCertificates.sort((a, b) => 
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        ),
        stats: certificateStats,
        availableCertificates,
        templates: availableTemplates,
        verificationEnabled: true
      }
    });
  } catch (error) {
    console.error('Certificates retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type, moduleId, assessmentId, metadata } = await request.json();
    
    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user is eligible for certificate
    const eligibility = await checkCertificateEligibility(userId, type, moduleId, assessmentId);
    
    if (!eligibility.eligible) {
      return NextResponse.json(
        { success: false, error: eligibility.reason },
        { status: 400 }
      );
    }
    
    // Generate certificate
    const certificate = await generateCertificate(userId, type, moduleId, assessmentId, metadata);
    
    // Add to database
    mockCertificates.push(certificate);
    
    // Add to generation queue for processing
    const queueKey = `${userId}_${certificate.id}`;
    certificateQueue.set(queueKey, {
      certificate,
      status: 'processing',
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      data: {
        certificate,
        message: 'Certificate generated successfully',
        downloadUrl: `/api/learn/enhanced/certificates/${certificate.id}/download`,
        shareUrl: `/certificates/verify/${certificate.verificationCode}`
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { certificateId: string } }) {
  try {
    const certificateId = params.certificateId;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Get certificate by ID
    const certificate = mockCertificates.find(cert => cert.id === certificateId);
    
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    if (action === 'download') {
      // Generate PDF certificate (mock implementation)
      const pdfBuffer = await generateCertificatePDF(certificate);
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${certificate.title.replace(/\s+/g, '_')}_Certificate.pdf"`
        }
      });
    }
    
    if (action === 'verify') {
      // Verify certificate authenticity
      const verificationResult = await verifyCertificate(certificate);
      
      return NextResponse.json({
        success: true,
        data: verificationResult
      });
    }
    
    // Return certificate details
    return NextResponse.json({
      success: true,
      data: {
        certificate,
        canDownload: true,
        verificationCode: certificate.verificationCode
      }
    });
  } catch (error) {
    console.error('Certificate operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions

async function checkAvailableCertificates(userId: string): Promise<any[]> {
  const available = [];
  
  // Check for module completion certificates
  for (const template of certificateTemplates) {
    const eligibility = await checkCertificateEligibility(userId, template.type);
    if (eligibility.eligible && !hasCertificate(userId, template.type)) {
      available.push({
        type: template.type,
        title: template.name,
        description: template.description,
        requirements: template.requirements
      });
    }
  }
  
  return available;
}

function hasCertificate(userId: string, type: string): boolean {
  return mockCertificates.some(cert => cert.userId === userId && cert.type === type);
}

async function checkCertificateEligibility(
  userId: string, 
  type: string, 
  moduleId?: number, 
  assessmentId?: string
): Promise<{ eligible: boolean; reason?: string }> {
  // Mock user progress data
  const userProgress = {
    modulesCompleted: [17],
    assessmentScores: { 'assessment-module-17': 95 },
    totalTimeSpent: 600,
    achievements: ['Perfect Score', 'Module Master'],
    xp: 2100
  };
  
  switch (type) {
    case 'module_completion':
      if (!moduleId || !userProgress.modulesCompleted.includes(moduleId)) {
        return { eligible: false, reason: 'Module not completed' };
      }
      if (userProgress.totalTimeSpent < 180) {
        return { eligible: false, reason: 'Insufficient time spent on module' };
      }
      return { eligible: true };
      
    case 'assessment_excellence':
      if (!assessmentId || !userProgress.assessmentScores[assessmentId]) {
        return { eligible: false, reason: 'Assessment not taken or score not available' };
      }
      if (userProgress.assessmentScores[assessmentId] < 90) {
        return { eligible: false, reason: 'Score below 90% required for excellence certificate' };
      }
      return { eligible: true };
      
    case 'learning_journey':
      if (userProgress.modulesCompleted.length < 3) {
        return { eligible: false, reason: 'Need to complete at least 3 modules' };
      }
      if (userProgress.totalTimeSpent < 720) {
        return { eligible: false, reason: 'Insufficient total learning time' };
      }
      return { eligible: true };
      
    default:
      return { eligible: false, reason: 'Unknown certificate type' };
  }
}

async function generateCertificate(
  userId: string,
  type: string,
  moduleId?: number,
  assessmentId?: string,
  metadata?: any
): Promise<Certificate> {
  const template = certificateTemplates.find(t => t.type === type);
  if (!template) {
    throw new Error('Template not found');
  }
  
  // Mock user data
  const userData = {
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  const certificateId = `cert-${String(mockCertificates.length + 1).padStart(3, '0')}`;
  const verificationCode = generateVerificationCode(type, moduleId, assessmentId);
  
  return {
    id: certificateId,
    userId,
    type: type as Certificate['type'],
    title: getCertificateTitle(type, moduleId),
    description: getCertificateDescription(type, moduleId),
    moduleId,
    assessmentId,
    issuedAt: new Date().toISOString(),
    verificationCode,
    metadata: {
      completionDate: new Date().toISOString().split('T')[0],
      timeSpent: metadata?.timeSpent || 0,
      interactiveFeaturesUsed: metadata?.featuresUsed || [],
      achievements: metadata?.achievements || [],
      level: metadata?.level || 1,
      xpAtCompletion: metadata?.xp || 0
    },
    template: template.design
  };
}

function generateVerificationCode(type: string, moduleId?: number, assessmentId?: string): string {
  const prefix = type === 'module_completion' ? 'MC' : 
                 type === 'assessment_excellence' ? 'AE' : 
                 type === 'learning_journey' ? 'LJ' : 'SA';
  
  const suffix = moduleId ? moduleId.toString().padStart(3, '0') : 
                 assessmentId ? assessmentId.slice(-3) : '001';
  
  const year = new Date().getFullYear();
  
  return `${prefix}${year}-${suffix}`;
}

function getCertificateTitle(type: string, moduleId?: number): string {
  switch (type) {
    case 'module_completion':
      const moduleNames = {
        17: 'Banking & Insurance Fundamentals',
        18: 'Tax Planning & Investment',
        19: 'Goal-Based Investment Planning',
        20: 'Retirement Planning Mastery'
      };
      return moduleNames[moduleId as keyof typeof moduleNames] || 'Module Completion';
      
    case 'assessment_excellence':
      return 'Assessment Excellence';
      
    case 'learning_journey':
      return 'Learning Journey Achievement';
      
    default:
      return 'Certificate of Achievement';
  }
}

function getCertificateDescription(type: string, moduleId?: number): string {
  switch (type) {
    case 'module_completion':
      return `Successfully completed comprehensive course on ${getCertificateTitle(type, moduleId).toLowerCase()}`;
      
    case 'assessment_excellence':
      return 'Achieved outstanding performance with exceptional scores in assessments';
      
    case 'learning_journey':
      return 'Completed comprehensive learning journey demonstrating mastery across multiple modules';
      
    default:
      return 'Awarded for exceptional performance and dedication to learning';
  }
}

function checkTemplateEligibility(userId: string, template: CertificateTemplate): boolean {
  // Mock implementation - check if user meets template requirements
  const userProgress = {
    modulesCompleted: [17],
    totalTimeSpent: 600,
    assessmentScores: { 'assessment-module-17': 95 }
  };
  
  if (template.requirements.modules) {
    const hasRequiredModules = template.requirements.modules.every(mod => 
      userProgress.modulesCompleted.includes(mod)
    );
    if (!hasRequiredModules) return false;
  }
  
  if (template.requirements.timeSpent && userProgress.totalTimeSpent < template.requirements.timeSpent) {
    return false;
  }
  
  return true;
}

async function generateCertificatePDF(certificate: Certificate): Promise<Buffer> {
  // Mock PDF generation - in real implementation, use a library like jsPDF or Puppeteer
  const mockPdfContent = `Certificate: ${certificate.title}\n\nUser: ${certificate.userId}\nIssued: ${certificate.issuedAt}\nVerification Code: ${certificate.verificationCode}\n\n${certificate.description}`;
  
  return Buffer.from(mockPdfContent);
}

async function verifyCertificate(certificate: Certificate): Promise<any> {
  return {
    valid: true,
    certificate: {
      id: certificate.id,
      title: certificate.title,
      userId: certificate.userId,
      issuedAt: certificate.issuedAt,
      verificationCode: certificate.verificationCode
    },
    verificationDetails: {
      issuer: 'INR100 Financial Education Platform',
      issueDate: certificate.issuedAt,
      authenticity: 'Verified',
      metadata: certificate.metadata
    }
  };
}