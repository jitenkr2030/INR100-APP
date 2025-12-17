import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Industry Certifications API
// Manages partnerships with certification bodies and credential verification

interface CertificationBody {
  id: string;
  name: string;
  fullName: string;
  type: 'government' | 'private' | 'international' | 'industry_association';
  description: string;
  website: string;
  logo: string;
  accreditation: string[];
  credibility: 'high' | 'medium' | 'low';
  globalRecognition: boolean;
  partnership: {
    status: 'active' | 'pending' | 'expired';
    startDate: Date;
    endDate?: Date;
    terms: string;
    commission?: number;
    benefits: string[];
  };
}

interface Certification {
  id: string;
  bodyId: string;
  name: string;
  fullName: string;
  category: 'investment_advisory' | 'financial_planning' | 'risk_management' | 'wealth_management' | 'insurance' | 'tax_planning';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  requirements: CertificationRequirement[];
  examDetails: ExamDetails;
  validity: {
    duration: number; // years
    renewalRequired: boolean;
    cpdCredits: number;
  };
  scope: string[];
  prerequisites: string[];
  learningPath: LearningPathStep[];
  careerImpact: CareerImpact;
  recognition: {
    industry: string[];
    employers: string[];
    salaryImpact: {
      average: number;
      range: [number, number];
    };
  };
  cost: {
    examFee: number;
    studyMaterial: number;
    totalEstimated: number;
  };
}

interface CertificationRequirement {
  type: 'education' | 'experience' | 'training' | 'assessment' | 'background_check';
  description: string;
  details: string;
  mandatory: boolean;
  alternatives?: string[];
}

interface ExamDetails {
  format: 'online' | 'offline' | 'hybrid';
  duration: number; // minutes
  questions: number;
  passingScore: number;
  attempts: number;
  retakePolicy: string;
  languages: string[];
  centers?: string[];
  scheduling: string;
}

interface LearningPathStep {
  moduleId: number;
  title: string;
  description: string;
  duration: number; // hours
  mandatory: boolean;
  assessmentRequired: boolean;
  practicalApplication: boolean;
}

interface CareerImpact {
  jobRoles: string[];
  salaryRange: [number, number];
  industryDemand: 'high' | 'medium' | 'low';
  growthPotential: number; // percentage
  skillDevelopment: string[];
}

interface UserCertification {
  id: string;
  userId: string;
  certificationId: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired' | 'suspended';
  enrolledDate: Date;
  startDate?: Date;
  completedDate?: Date;
  expiryDate?: Date;
  progress: {
    modulesCompleted: number;
    totalModules: number;
    overallProgress: number;
  };
  exam?: {
    attempts: ExamAttempt[];
    bestScore: number;
    passed: boolean;
    certificateIssued?: string;
  };
  payment?: {
    amount: number;
    status: 'pending' | 'paid' | 'refunded';
    transactionId: string;
    date: Date;
  };
  cpdCredits?: {
    earned: number;
    required: number;
    nextRenewal: Date;
  };
}

interface ExamAttempt {
  id: string;
  attemptNumber: number;
  date: Date;
  score: number;
  passed: boolean;
  certificateNumber?: string;
  feedback?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'certifications';
    const userId = searchParams.get('userId');
    const certificationId = searchParams.get('certificationId');
    const bodyId = searchParams.get('bodyId');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    
    switch (action) {
      case 'certifications':
        return await getAvailableCertifications(category, level, userId);
      case 'certification':
        return await getCertificationDetails(certificationId);
      case 'bodies':
        return await getCertificationBodies(bodyId);
      case 'user-certifications':
        return await getUserCertifications(userId);
      case 'eligibility':
        return await checkEligibility(userId, certificationId);
      case 'progress':
        return await getCertificationProgress(userId, certificationId);
      case 'exam-schedule':
        return await getExamSchedule(certificationId, userId);
      case 'verify':
        return await verifyCertificate(searchParams.get('certificateNumber'));
      case 'career-path':
        return await getCareerPath(certificationId, userId);
      case 'partnerships':
        return await getActivePartnerships();
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Certifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'enroll':
        return await enrollInCertification(await request.json());
      case 'schedule-exam':
        return await scheduleExam(await request.json());
      case 'submit-application':
        return await submitCertificationApplication(await request.json());
      case 'renew':
        return await renewCertification(await request.json());
      case 'update-progress':
        return await updateCertificationProgress(await request.json());
      case 'request-credentials':
        return await requestCredentials(await request.json());
      case 'partner-application':
        return await applyForPartnership(await request.json());
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Certifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get available certifications
async function getAvailableCertifications(category?: string, level?: string, userId?: string) {
  const certifications = getMockCertifications();
  
  let filteredCertifications = certifications;
  
  // Filter by category
  if (category) {
    filteredCertifications = filteredCertifications.filter(c => c.category === category);
  }
  
  // Filter by level
  if (level) {
    filteredCertifications = filteredCertifications.filter(c => c.level === level);
  }
  
  // Add user-specific data if userId provided
  if (userId) {
    const userCertifications = await getUserCertificationsData(userId);
    const userLearningProgress = await getUserLearningProgress(userId);
    
    filteredCertifications = filteredCertifications.map(cert => {
      const userCert = userCertifications.find(uc => uc.certificationId === cert.id);
      const eligibility = checkUserEligibility(userLearningProgress, cert);
      
      return {
        ...cert,
        isEligible: eligibility.eligible,
        eligibilityReasons: eligibility.reasons,
        userStatus: userCert?.status || 'not_enrolled',
        userProgress: userCert?.progress || null,
        recommended: eligibility.recommended
      };
    });
  }
  
  return NextResponse.json({
    success: true,
    data: {
      certifications: filteredCertifications,
      categories: [...new Set(certifications.map(c => c.category))],
      levels: [...new Set(certifications.map(c => c.level))],
      totalCount: filteredCertifications.length
    }
  });
}

// Get certification details
async function getCertificationDetails(certificationId: string | null) {
  if (!certificationId) {
    return NextResponse.json(
      { success: false, error: 'certificationId required' },
      { status: 400 }
    );
  }
  
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  if (!certification) {
    return NextResponse.json(
      { success: false, error: 'Certification not found' },
      { status: 404 }
    );
  }
  
  const certificationBodies = getMockCertificationBodies();
  const body = certificationBodies.find(b => b.id === certification.bodyId);
  
  return NextResponse.json({
    success: true,
    data: {
      certification,
      body,
      careerOutcomes: generateCareerOutcomes(certification),
      industryRecognition: analyzeIndustryRecognition(certification),
      successRate: calculateSuccessRate(certificationId)
    }
  });
}

// Get certification bodies
async function getCertificationBodies(bodyId?: string) {
  const bodies = getMockCertificationBodies();
  
  let filteredBodies = bodies;
  
  if (bodyId) {
    filteredBodies = bodies.filter(b => b.id === bodyId);
  }
  
  return NextResponse.json({
    success: true,
    data: {
      bodies: filteredBodies,
      totalCount: filteredBodies.length
    }
  });
}

// Get user certifications
async function getUserCertifications(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const userCertifications = await getUserCertificationsData(userId);
  const certifications = getMockCertifications();
  
  const enrichedCertifications = userCertifications.map(uc => ({
    ...uc,
    certification: certifications.find(c => c.id === uc.certificationId)
  }));
  
  const summary = {
    total: userCertifications.length,
    active: userCertifications.filter(uc => uc.status === 'in_progress').length,
    completed: userCertifications.filter(uc => uc.status === 'completed').length,
    expired: userCertifications.filter(uc => uc.status === 'expired').length,
    averageProgress: userCertifications.length > 0 
      ? userCertifications.reduce((sum, uc) => sum + uc.progress.overallProgress, 0) / userCertifications.length 
      : 0
  };
  
  return NextResponse.json({
    success: true,
    data: {
      certifications: enrichedCertifications,
      summary
    }
  });
}

// Check eligibility for certification
async function checkEligibility(userId: string | null, certificationId: string | null) {
  if (!userId || !certificationId) {
    return NextResponse.json(
      { success: false, error: 'userId and certificationId required' },
      { status: 400 }
    );
  }
  
  const userLearningProgress = await getUserLearningProgress(userId);
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  if (!certification) {
    return NextResponse.json(
      { success: false, error: 'Certification not found' },
      { status: 404 }
    );
  }
  
  const eligibility = checkUserEligibility(userLearningProgress, certification);
  
  return NextResponse.json({
    success: true,
    data: {
      eligible: eligibility.eligible,
      reasons: eligibility.reasons,
      missingRequirements: eligibility.missingRequirements,
      recommendations: eligibility.recommendations,
      estimatedTimeToEligibility: eligibility.estimatedTime
    }
  });
}

// Get certification progress
async function getCertificationProgress(userId: string | null, certificationId: string | null) {
  if (!userId || !certificationId) {
    return NextResponse.json(
      { success: false, error: 'userId and certificationId required' },
      { status: 400 }
    );
  }
  
  const userCertifications = await getUserCertificationsData(userId);
  const userCert = userCertifications.find(uc => uc.certificationId === certificationId);
  
  if (!userCert) {
    return NextResponse.json(
      { success: false, error: 'User not enrolled in this certification' },
      { status: 404 }
    );
  }
  
  const learningProgress = await getUserLearningProgress(userId);
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  const progress = {
    overallProgress: userCert.progress.overallProgress,
    modulesCompleted: userCert.progress.modulesCompleted,
    totalModules: userCert.progress.totalModules,
    status: userCert.status,
    estimatedCompletion: calculateEstimatedCompletion(userCert, certification),
    nextMilestone: getNextMilestone(userCert, certification),
    performanceMetrics: calculatePerformanceMetrics(userCert),
    recommendations: generateProgressRecommendations(userCert, certification, learningProgress)
  };
  
  return NextResponse.json({
    success: true,
    data: { progress }
  });
}

// Get exam schedule
async function getExamSchedule(certificationId: string | null, userId?: string) {
  if (!certificationId) {
    return NextResponse.json(
      { success: false, error: 'certificationId required' },
      { status: 400 }
    );
  }
  
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  if (!certification) {
    return NextResponse.json(
      { success: false, error: 'Certification not found' },
      { status: 404 }
    );
  }
  
  const schedule = {
    upcomingExams: generateUpcomingExams(certification),
    availableSlots: generateAvailableSlots(certification),
    examCenters: certification.examDetails.centers || [],
    registrationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    preparationResources: generatePreparationResources(certification)
  };
  
  return NextResponse.json({
    success: true,
    data: { schedule }
  });
}

// Verify certificate
async function getVerifyCertificate(certificateNumber: string | null) {
  if (!certificateNumber) {
    return NextResponse.json(
      { success: false, error: 'certificateNumber required' },
      { status: 400 }
    );
  }
  
  // Mock certificate verification
  const isValid = certificateNumber.startsWith('CERT') && certificateNumber.length === 12;
  
  const verificationResult = {
    valid: isValid,
    certificateNumber,
    status: isValid ? 'valid' : 'invalid',
    holder: isValid ? {
      name: 'John Doe',
      certification: 'Certified Financial Planner',
      issueDate: new Date('2024-01-15'),
      expiryDate: new Date('2027-01-15'),
      verificationCode: 'ABC123XYZ'
    } : null,
    verificationDetails: isValid ? {
      issuedBy: 'Indian Institute of Financial Planning',
      accreditation: 'ISO 17024:2012',
      verificationMethod: 'Digital signature + Blockchain'
    } : null
  };
  
  return NextResponse.json({
    success: true,
    data: verificationResult
  });
}

// Get career path information
async function getCareerPath(certificationId: string | null, userId?: string) {
  if (!certificationId) {
    return NextResponse.json(
      { success: false, error: 'certificationId required' },
      { status: 400 }
    );
  }
  
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  if (!certification) {
    return NextResponse.json(
      { success: false, error: 'Certification not found' },
      { status: 404 }
    );
  }
  
  const careerPath = {
    currentLevel: certification.level,
    nextLevels: generateNextLevels(certification),
    careerProgression: generateCareerProgression(certification),
    salaryProjections: generateSalaryProjections(certification),
    skillDevelopment: certification.careerImpact.skillDevelopment,
    industryDemand: certification.careerImpact.industryDemand,
    growthOpportunities: identifyGrowthOpportunities(certification),
    successStories: generateSuccessStories(certification)
  };
  
  return NextResponse.json({
    success: true,
    data: { careerPath }
  });
}

// Get active partnerships
async function getActivePartnerships() {
  const bodies = getMockCertificationBodies();
  const activePartnerships = bodies.filter(b => b.partnership.status === 'active');
  
  const summary = {
    totalPartnerships: activePartnerships.length,
    governmentPartnerships: activePartnerships.filter(b => b.type === 'government').length,
    privatePartnerships: activePartnerships.filter(b => b.type === 'private').length,
    internationalPartnerships: activePartnerships.filter(b => b.type === 'international').length,
    upcomingExpirations: activePartnerships.filter(b => {
      const daysUntilExpiry = (b.partnership.endDate?.getTime() || 0 - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 90;
    }).length
  };
  
  return NextResponse.json({
    success: true,
    data: {
      partnerships: activePartnerships,
      summary
    }
  });
}

// Enroll in certification
async function enrollInCertification(data: { 
  userId: string; 
  certificationId: string; 
  paymentMethod?: string 
}) {
  const { userId, certificationId, paymentMethod } = data;
  
  if (!userId || !certificationId) {
    return NextResponse.json(
      { success: false, error: 'userId and certificationId required' },
      { status: 400 }
    );
  }
  
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  if (!certification) {
    return NextResponse.json(
      { success: false, error: 'Certification not found' },
      { status: 404 }
    );
  }
  
  // Check eligibility
  const userLearningProgress = await getUserLearningProgress(userId);
  const eligibility = checkUserEligibility(userLearningProgress, certification);
  
  if (!eligibility.eligible) {
    return NextResponse.json(
      { success: false, error: 'User not eligible for this certification', details: eligibility.reasons },
      { status: 400 }
    );
  }
  
  // Create enrollment
  const enrollment: UserCertification = {
    id: `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    certificationId,
    status: 'enrolled',
    enrolledDate: new Date(),
    progress: {
      modulesCompleted: 0,
      totalModules: certification.learningPath.length,
      overallProgress: 0
    },
    payment: paymentMethod ? {
      amount: certification.cost.totalEstimated,
      status: 'pending',
      transactionId: `txn_${Date.now()}`,
      date: new Date()
    } : undefined
  };
  
  // Store enrollment (in real implementation, would save to database)
  console.log('Certification enrollment created:', enrollment);
  
  // Award XP for enrollment
  await awardEnrollmentXp(userId, certification);
  
  return NextResponse.json({
    success: true,
    data: {
      enrollment,
      certification,
      paymentInstructions: paymentMethod ? generatePaymentInstructions(enrollment) : null,
      learningPath: certification.learningPath,
      nextSteps: generateEnrollmentNextSteps(certification)
    }
  });
}

// Schedule exam
async function scheduleExam(data: { 
  userId: string; 
  certificationId: string; 
  preferredDate: Date; 
  center?: string 
}) {
  const { userId, certificationId, preferredDate, center } = data;
  
  // Validate user enrollment
  const userCertifications = await getUserCertificationsData(userId);
  const userCert = userCertifications.find(uc => uc.certificationId === certificationId);
  
  if (!userCert || userCert.status !== 'in_progress') {
    return NextResponse.json(
      { success: false, error: 'User must be enrolled and in progress to schedule exam' },
      { status: 400 }
    );
  }
  
  // Check minimum progress requirement (typically 80% completion)
  if (userCert.progress.overallProgress < 80) {
    return NextResponse.json(
      { success: false, error: 'Minimum 80% progress required to schedule exam' },
      { status: 400 }
    );
  }
  
  const examBooking = {
    id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    certificationId,
    scheduledDate: preferredDate,
    center: center || 'Online',
    status: 'confirmed',
    bookingDate: new Date(),
    examDetails: {
      duration: 180, // minutes
      format: 'online',
      instructions: generateExamInstructions(certificationId)
    }
  };
  
  return NextResponse.json({
    success: true,
    data: {
      booking: examBooking,
      confirmation: 'Exam scheduled successfully',
      preparationChecklist: generatePreparationChecklist(certificationId),
      examDayInstructions: generateExamDayInstructions()
    }
  });
}

// Submit certification application
async function submitCertificationApplication(data: { 
  userId: string; 
  certificationId: string; 
  documents: string[]; 
  experienceProof: string 
}) {
  const { userId, certificationId, documents, experienceProof } = data;
  
  const application = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    certificationId,
    status: 'submitted',
    submittedDate: new Date(),
    documents,
    experienceProof,
    reviewTimeline: '15-30 business days',
    nextSteps: [
      'Document verification in progress',
      'Experience validation',
      'Interview (if required)',
      'Final decision'
    ]
  };
  
  return NextResponse.json({
    success: true,
    data: {
      application,
      message: 'Certification application submitted successfully',
      trackingId: application.id,
      estimatedDecision: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
}

// Renew certification
async function renewCertification(data: { 
  userId: string; 
  certificationId: string; 
  cpdCredits: number 
}) {
  const { userId, certificationId, cpdCredits } = data;
  
  const userCertifications = await getUserCertificationsData(userId);
  const userCert = userCertifications.find(uc => uc.certificationId === certificationId);
  
  if (!userCert || userCert.status !== 'completed') {
    return NextResponse.json(
      { success: false, error: 'Valid certification required for renewal' },
      { status: 400 }
    );
  }
  
  // Check CPD credits requirement
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  if (cpdCredits < certification?.validity.cpdCredits) {
    return NextResponse.json(
      { success: false, error: `Minimum ${certification?.validity.cpdCredits} CPD credits required` },
      { status: 400 }
    );
  }
  
  const renewal = {
    id: `renew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    certificationId,
    previousExpiry: userCert.expiryDate,
    newExpiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
    cpdCredits,
    status: 'approved',
    renewedDate: new Date()
  };
  
  return NextResponse.json({
    success: true,
    data: {
      renewal,
      message: 'Certification renewed successfully',
      newExpiryDate: renewal.newExpiry
    }
  });
}

// Update certification progress
async function updateCertificationProgress(data: { 
  userId: string; 
  certificationId: string; 
  moduleId: number; 
  completed: boolean; 
  score?: number 
}) {
  const { userId, certificationId, moduleId, completed, score } = data;
  
  const userCertifications = await getUserCertificationsData(userId);
  const userCert = userCertifications.find(uc => uc.certificationId === certificationId);
  
  if (!userCert) {
    return NextResponse.json(
      { success: false, error: 'User not enrolled in this certification' },
      { status: 404 }
    );
  }
  
  // Update progress
  if (completed) {
    userCert.progress.modulesCompleted += 1;
    userCert.progress.overallProgress = (userCert.progress.modulesCompleted / userCert.progress.totalModules) * 100;
    
    // Check if all modules completed
    if (userCert.progress.modulesCompleted === userCert.progress.totalModules) {
      userCert.status = 'completed';
      userCert.completedDate = new Date();
    }
  }
  
  // Award XP for module completion
  if (completed) {
    await awardModuleXp(userId, certificationId, moduleId, score);
  }
  
  return NextResponse.json({
    success: true,
    data: {
      progress: userCert.progress,
      status: userCert.status,
      nextModule: getNextModule(userCert, certificationId),
      achievements: completed ? [`Module ${moduleId} Completed`] : []
    }
  });
}

// Request credentials verification
async function requestCredentials(data: { 
  userId: string; 
  certificationId: string; 
  purpose: 'job' | 'promotion' | 'freelance' | 'consulting' 
}) {
  const { userId, certificationId, purpose } = data;
  
  const credentialsRequest = {
    id: `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    certificationId,
    purpose,
    status: 'processing',
    requestedDate: new Date(),
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    formats: ['PDF Certificate', 'Digital Badge', 'Blockchain Verification']
  };
  
  return NextResponse.json({
    success: true,
    data: {
      request: credentialsRequest,
      message: 'Credentials verification request submitted',
      trackingId: credentialsRequest.id
    }
  });
}

// Apply for partnership
async function applyForPartnership(data: { 
  organizationName: string; 
  organizationType: string; 
  contactDetails: any; 
  partnershipType: string 
}) {
  const { organizationName, organizationType, contactDetails, partnershipType } = data;
  
  const partnershipApplication = {
    id: `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    organizationName,
    organizationType,
    contactDetails,
    partnershipType,
    status: 'under_review',
    submittedDate: new Date(),
    reviewTimeline: '30-60 business days',
    requirements: generatePartnershipRequirements(partnershipType)
  };
  
  return NextResponse.json({
    success: true,
    data: {
      application: partnershipApplication,
      message: 'Partnership application submitted successfully',
      referenceId: partnershipApplication.id
    }
  });
}

// Helper Functions

function getMockCertificationBodies(): CertificationBody[] {
  return [
    {
      id: 'iifp',
      name: 'IIFP',
      fullName: 'Indian Institute of Financial Planning',
      type: 'private',
      description: 'Leading financial planning education provider in India',
      website: 'https://www.iifp.co.in',
      logo: '/images/certifications/iifp-logo.png',
      accreditation: ['ISO 9001:2015', 'NASD Regulatory'],
      credibility: 'high',
      globalRecognition: false,
      partnership: {
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-12-31'),
        terms: 'Educational content integration and certification programs',
        commission: 15,
        benefits: [
          'Co-branded certification programs',
          'Shared student database',
          'Joint marketing initiatives',
          'Revenue sharing model'
        ]
      }
    },
    {
      id: 'nism',
      name: 'NISM',
      fullName: 'National Institute of Securities Markets',
      type: 'government',
      description: 'Securities and Exchange Board of India (SEBI) subsidiary',
      website: 'https://www.nism.ac.in',
      logo: '/images/certifications/nism-logo.png',
      accreditation: ['SEBI Recognized', 'ISO 27001'],
      credibility: 'high',
      globalRecognition: true,
      partnership: {
        status: 'active',
        startDate: new Date('2024-01-01'),
        terms: 'Content development and assessment partnership',
        benefits: [
          'Official certification programs',
          'Regulatory compliance',
          'Industry-standard assessments',
          'Government backing'
        ]
      }
    },
    {
      id: 'cfa-institute',
      name: 'CFA Institute',
      fullName: 'CFA Institute',
      type: 'international',
      description: 'Global association of investment professionals',
      website: 'https://www.cfainstitute.org',
      logo: '/images/certifications/cfa-logo.png',
      accreditation: ['GIPS Standards', 'CFA Program'],
      credibility: 'high',
      globalRecognition: true,
      partnership: {
        status: 'pending',
        startDate: new Date('2025-01-01'),
        terms: 'Content partnership for CFA curriculum',
        benefits: [
          'Global recognition',
          'Premium content access',
          'International standards',
          'Career advancement support'
        ]
      }
    }
  ];
}

function getMockCertifications(): Certification[] {
  return [
    {
      id: 'cfp',
      bodyId: 'iifp',
      name: 'CFP',
      fullName: 'Certified Financial Planner',
      category: 'financial_planning',
      level: 'advanced',
      description: 'Comprehensive financial planning certification covering all aspects of personal finance',
      requirements: [
        {
          type: 'education',
          description: 'Bachelor\'s degree in any discipline',
          details: 'Must have completed graduation with minimum 50% marks',
          mandatory: true
        },
        {
          type: 'experience',
          description: '2 years of relevant work experience',
          details: 'Experience in banking, insurance, financial planning, or related fields',
          mandatory: true
        },
        {
          type: 'training',
          description: 'Complete 180 hours of CFP education',
          details: 'Structured learning program covering 6 modules',
          mandatory: true
        },
        {
          type: 'assessment',
          description: 'Pass CFP Certification Examination',
          details: '4-hour comprehensive exam with 150 questions',
          mandatory: true
        }
      ],
      examDetails: {
        format: 'online',
        duration: 240,
        questions: 150,
        passingScore: 70,
        attempts: 3,
        retakePolicy: '30-day waiting period between attempts',
        languages: ['English', 'Hindi'],
        scheduling: 'Available throughout the year'
      },
      validity: {
        duration: 3,
        renewalRequired: true,
        cpdCredits: 15
      },
      scope: [
        'Financial Planning Process',
        'Risk Management and Insurance Planning',
        'Investment Planning',
        'Tax Planning and Management',
        'Retirement Planning and Employee Benefits',
        'Estate Planning'
      ],
      prerequisites: ['Module 1', 'Module 2', 'Module 3', 'Module 17'],
      learningPath: [
        {
          moduleId: 1,
          title: 'Financial Planning Process',
          description: 'Understanding the fundamentals of financial planning',
          duration: 30,
          mandatory: true,
          assessmentRequired: true,
          practicalApplication: true
        },
        {
          moduleId: 17,
          title: 'Insurance and Risk Management',
          description: 'Comprehensive insurance planning and risk assessment',
          duration: 35,
          mandatory: true,
          assessmentRequired: true,
          practicalApplication: true
        },
        {
          moduleId: 18,
          title: 'Tax Planning and Management',
          description: 'Tax-efficient investment and planning strategies',
          duration: 40,
          mandatory: true,
          assessmentRequired: true,
          practicalApplication: true
        }
      ],
      careerImpact: {
        jobRoles: [
          'Financial Planner',
          'Investment Advisor',
          'Wealth Manager',
          'Tax Consultant',
          'Insurance Advisor'
        ],
        salaryRange: [400000, 1200000],
        industryDemand: 'high',
        growthPotential: 25,
        skillDevelopment: [
          'Client Relationship Management',
          'Portfolio Analysis',
          'Tax Optimization',
          'Risk Assessment',
          'Estate Planning'
        ]
      },
      recognition: {
        industry: ['Banking', 'Insurance', 'Asset Management', 'Broking'],
        employers: [
          'HDFC Bank',
          'ICICI Prudential',
          'SBI Life',
          'Kotak Mahindra',
          'Aditya Birla Capital'
        ],
        salaryImpact: {
          average: 750000,
          range: [400000, 1500000]
        }
      },
      cost: {
        examFee: 15000,
        studyMaterial: 8000,
        totalEstimated: 23000
      }
    },
    {
      id: 'nim',
      bodyId: 'nism',
      name: 'NIM',
      fullName: 'NISM Investment Advisor',
      category: 'investment_advisory',
      level: 'intermediate',
      description: 'Investment advisory certification for professionals in securities market',
      requirements: [
        {
          type: 'education',
          description: '12th grade or equivalent',
          details: 'Minimum educational qualification required',
          mandatory: true
        },
        {
          type: 'training',
          description: 'Complete NISM Investment Advisor certification course',
          details: '100 hours of structured training',
          mandatory: true
        },
        {
          type: 'assessment',
          description: 'Pass NISM Investment Advisor examination',
          details: '2-hour exam with 100 questions',
          mandatory: true
        }
      ],
      examDetails: {
        format: 'online',
        duration: 120,
        questions: 100,
        passingScore: 60,
        attempts: 5,
        retakePolicy: 'No waiting period',
        languages: ['English', 'Hindi', 'Regional Languages'],
        scheduling: 'Monthly schedule'
      },
      validity: {
        duration: 3,
        renewalRequired: true,
        cpdCredits: 10
      },
      scope: [
        'Investment Products',
        'Client Suitability',
        'Risk Disclosure',
        'Portfolio Management',
        'Regulatory Compliance'
      ],
      prerequisites: ['Module 1', 'Module 2', 'Module 3'],
      learningPath: [
        {
          moduleId: 1,
          title: 'Investment Fundamentals',
          description: 'Basic concepts of investments and securities',
          duration: 25,
          mandatory: true,
          assessmentRequired: true,
          practicalApplication: false
        },
        {
          moduleId: 3,
          title: 'Investment Strategies',
          description: 'Various investment strategies and asset allocation',
          duration: 30,
          mandatory: true,
          assessmentRequired: true,
          practicalApplication: true
        }
      ],
      careerImpact: {
        jobRoles: [
          'Investment Advisor',
          'Relationship Manager',
          'Research Analyst',
          'Portfolio Manager'
        ],
        salaryRange: [300000, 800000],
        industryDemand: 'medium',
        growthPotential: 15,
        skillDevelopment: [
          'Market Analysis',
          'Product Knowledge',
          'Client Advisory',
          'Regulatory Knowledge'
        ]
      },
      recognition: {
        industry: ['Securities', 'Broking', 'Asset Management'],
        employers: [
          'Zerodha',
          'Upstox',
          'Angel Broking',
          'Motilal Oswal',
          'IIFL Securities'
        ],
        salaryImpact: {
          average: 550000,
          range: [300000, 900000]
        }
      },
      cost: {
        examFee: 3000,
        studyMaterial: 2000,
        totalEstimated: 5000
      }
    }
  ];
}

async function getUserCertificationsData(userId: string): Promise<UserCertification[]> {
  // Mock implementation - in real app, would fetch from database
  return [
    {
      id: 'cert_1',
      userId,
      certificationId: 'cfp',
      status: 'in_progress',
      enrolledDate: new Date('2024-11-01'),
      startDate: new Date('2024-11-15'),
      progress: {
        modulesCompleted: 2,
        totalModules: 3,
        overallProgress: 67
      },
      exam: {
        attempts: [],
        bestScore: 0,
        passed: false
      }
    }
  ];
}

async function getUserLearningProgress(userId: string) {
  // Mock implementation - would fetch from learning progress API
  return {
    completedModules: [1, 2, 3, 17, 18],
    totalModules: 23,
    averageScore: 85,
    currentLevel: 5,
    xp: 2500
  };
}

function checkUserEligibility(learningProgress: any, certification: Certification) {
  const reasons = [];
  const missingRequirements = [];
  const recommendations = [];
  
  // Check module prerequisites
  const unmetPrerequisites = certification.prerequisites.filter(prereq => 
    !learningProgress.completedModules.includes(parseInt(prereq))
  );
  
  if (unmetPrerequisites.length > 0) {
    reasons.push(`Missing prerequisites: ${unmetPrerequisites.join(', ')}`);
    missingRequirements.push(...unmetPrerequisites);
    recommendations.push(`Complete required modules: ${unmetPrerequisites.join(', ')}`);
  }
  
  // Check minimum score requirement
  if (learningProgress.averageScore < 75) {
    reasons.push('Average learning score below 75%');
    recommendations.push('Improve performance in learning modules');
  }
  
  const eligible = unmetPrerequisites.length === 0 && learningProgress.averageScore >= 75;
  const recommended = eligible && learningProgress.averageScore >= 85;
  
  return {
    eligible,
    reasons,
    missingRequirements,
    recommendations,
    estimatedTime: unmetPrerequisites.length > 0 ? '2-4 weeks' : 'Ready now',
    recommended
  };
}

function generateCareerOutcomes(certification: Certification) {
  return {
    immediateBenefits: [
      'Enhanced credibility with clients',
      'Access to premium job opportunities',
      'Higher earning potential',
      'Professional network expansion'
    ],
    longTermBenefits: [
      'Career advancement opportunities',
      'Entrepreneurship possibilities',
      'Industry recognition',
      'Continuous learning culture'
    ],
    skillEnhancement: certification.careerImpact.skillDevelopment,
    networkExpansion: [
      'Professional associations',
      'Alumni networks',
      'Industry events',
      'Online communities'
    ]
  };
}

function analyzeIndustryRecognition(certification: Certification) {
  return {
    marketDemand: certification.careerImpact.industryDemand,
    employerPreference: 'High',
    regulatoryRecognition: certification.category === 'investment_advisory' ? 'Mandatory' : 'Preferred',
    internationalEquivalence: certification.category === 'financial_planning' ? 'CFP Global' : 'Regional',
    salaryPremium: '15-30% increase',
    careerAcceleration: '2-3 years faster progression'
  };
}

function calculateSuccessRate(certificationId: string) {
  // Mock success rate calculation
  return {
    overallPassRate: 0.78,
    firstAttemptPassRate: 0.65,
    averageAttempts: 1.4,
    timeToCompletion: '6-12 months',
    dropOutRate: 0.15
  };
}

function generateUpcomingExams(certification: Certification) {
  return [
    {
      date: new Date('2025-01-15'),
      time: '10:00 AM',
      format: certification.examDetails.format,
      seats: 50,
      available: 23
    },
    {
      date: new Date('2025-01-30'),
      time: '2:00 PM',
      format: certification.examDetails.format,
      seats: 50,
      available: 47
    },
    {
      date: new Date('2025-02-15'),
      time: '10:00 AM',
      format: certification.examDetails.format,
      seats: 50,
      available: 50
    }
  ];
}

function generateAvailableSlots(certification: Certification) {
  const slots = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    slots.push({
      date: date.toISOString().split('T')[0],
      times: ['10:00 AM', '2:00 PM', '6:00 PM'],
      available: Math.floor(Math.random() * 20) + 10
    });
  }
  return slots;
}

function generatePreparationResources(certification: Certification) {
  return {
    studyMaterials: [
      'Official study guide',
      'Practice question bank',
      'Video lectures',
      'Case studies'
    ],
    practiceTests: [
      'Chapter-wise tests',
      'Module-wise assessments',
      'Full-length mock exams',
      'Speed tests'
    ],
    supportResources: [
      'Online discussion forums',
      'Study groups',
      'Mentorship program',
      'Expert guidance'
    ]
  };
}

function generateNextLevels(certification: Certification) {
  const nextLevels = [];
  
  if (certification.level === 'basic') {
    nextLevels.push({
      level: 'intermediate',
      certifications: ['Investment Analyst', 'Financial Consultant'],
      timeToAdvance: '2-3 years'
    });
  } else if (certification.level === 'intermediate') {
    nextLevels.push({
      level: 'advanced',
      certifications: ['Senior Financial Planner', 'Wealth Manager'],
      timeToAdvance: '3-5 years'
    });
  } else if (certification.level === 'advanced') {
    nextLevels.push({
      level: 'expert',
      certifications: ['Chief Financial Officer', 'Investment Director'],
      timeToAdvance: '5-8 years'
    });
  }
  
  return nextLevels;
}

function generateCareerProgression(certification: Certification) {
  return {
    entryLevel: certification.careerImpact.jobRoles[0],
    midLevel: `Senior ${certification.careerImpact.jobRoles[0]}`,
    seniorLevel: `Lead ${certification.careerImpact.jobRoles[0]}`,
    executiveLevel: certification.careerImpact.jobRoles[certification.careerImpact.jobRoles.length - 1],
    timeline: {
      entryToMid: '2-3 years',
      midToSenior: '3-5 years',
      seniorToExecutive: '5-8 years'
    }
  };
}

function generateSalaryProjections(certification: Certification) {
  const current = certification.careerImpact.salaryRange;
  return {
    current: current,
    year1: [current[0] * 1.2, current[1] * 1.2],
    year3: [current[0] * 1.5, current[1] * 1.5],
    year5: [current[0] * 2.0, current[1] * 2.0],
    factors: [
      'Experience accumulation',
      'Skill development',
      'Network expansion',
      'Performance track record'
    ]
  };
}

function identifyGrowthOpportunities(certification: Certification) {
  return [
    'Digital finance and fintech',
    'Sustainable investing',
    'Robo-advisory services',
    'International markets',
    'Alternative investments',
    'Behavioral finance'
  ];
}

function generateSuccessStories(certification: Certification) {
  return [
    {
      name: 'Rajesh Kumar',
      role: 'Senior Financial Planner',
      company: 'HDFC Bank',
      achievement: 'Increased client portfolio by 300%',
      timeline: '2 years post-certification'
    },
    {
      name: 'Priya Sharma',
      role: 'Wealth Manager',
      company: 'ICICI Prudential',
      achievement: 'Managed ₹100 Cr AUM within 18 months',
      timeline: '1.5 years post-certification'
    }
  ];
}

function calculateEstimatedCompletion(userCert: UserCertification, certification?: Certification) {
  if (!certification) return null;
  
  const remainingModules = certification.learningPath.length - userCert.progress.modulesCompleted;
  const averageModuleTime = 35; // hours
  const studyHoursPerWeek = 10;
  
  const weeksNeeded = (remainingModules * averageModuleTime) / studyHoursPerWeek;
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + weeksNeeded * 7);
  
  return completionDate;
}

function getNextMilestone(userCert: UserCertification, certification?: Certification) {
  if (!certification) return null;
  
  const nextModule = certification.learningPath[userCert.progress.modulesCompleted];
  return nextModule ? {
    module: nextModule.title,
    description: `Complete ${nextModule.title} module`,
    progress: userCert.progress.overallProgress
  } : {
    module: 'Final Exam',
    description: 'Schedule and complete certification examination',
    progress: 100
  };
}

function calculatePerformanceMetrics(userCert: UserCertification) {
  return {
    consistency: userCert.progress.overallProgress > 80 ? 'Excellent' : 
                 userCert.progress.overallProgress > 60 ? 'Good' : 'Needs Improvement',
    pace: userCert.progress.overallProgress / ((Date.now() - userCert.enrolledDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) > 10 ? 'On Track' : 'Behind',
    engagement: userCert.progress.overallProgress > 70 ? 'High' : 'Moderate'
  };
}

function generateProgressRecommendations(userCert: UserCertification, certification: Certification, learningProgress: any) {
  const recommendations = [];
  
  if (userCert.progress.overallProgress < 50) {
    recommendations.push('Increase study time to 15 hours per week');
    recommendations.push('Join study groups for better understanding');
  }
  
  if (learningProgress.averageScore < 80) {
    recommendations.push('Focus on improving quiz scores');
    recommendations.push('Review challenging topics');
  }
  
  if (certification.level === 'advanced' && userCert.progress.overallProgress > 80) {
    recommendations.push('Consider taking the exam soon');
    recommendations.push('Prepare for practical case studies');
  }
  
  return recommendations;
}

function generatePreparationResources(certification: Certification) {
  return {
    studyPlan: '8-week structured study plan',
    resources: [
      'Official certification guide',
      'Video tutorials (50+ hours)',
      'Practice question bank (1000+ questions)',
      'Case study workbook',
      'Mock examination series'
    ],
    support: [
      '24/7 online doubt clearing',
      'Expert mentor guidance',
      'Peer study groups',
      'Weekly progress reviews'
    ]
  };
}

function generateExamInstructions(certificationId: string) {
  return {
    technicalRequirements: [
      'Stable internet connection',
      'Webcam and microphone',
      'Quiet environment',
      'Valid ID proof'
    ],
    guidelines: [
      'No external help allowed',
      'Single monitor setup',
      'Proctored examination',
      'Time-bound completion'
    ],
    preparation: [
      'Practice with mock tests',
      'Familiarize with exam interface',
      'Review calculator usage',
      'Prepare required documents'
    ]
  };
}

function generatePreparationChecklist(certificationId: string) {
  return [
    'Complete all learning modules',
    'Score 80%+ in practice tests',
    'Review weak areas',
    'Practice time management',
    'Prepare required documents',
    'Test technical setup',
    'Get adequate sleep',
    'Arrive 30 minutes early'
  ];
}

function generateExamDayInstructions() {
  return {
    beforeExam: [
      'Arrive 30 minutes early',
      'Carry valid ID proof',
      'Check technical setup',
      'Stay calm and focused'
    ],
    duringExam: [
      'Read questions carefully',
      'Manage time effectively',
      'Mark difficult questions for review',
      'Stay within time limits'
    ],
    afterExam: [
      'Wait for result notification',
      'Review performance feedback',
      'Plan next steps based on result',
      'Continue learning regardless of outcome'
    ]
  };
}

function getNextModule(userCert: UserCertification, certificationId: string) {
  const certifications = getMockCertifications();
  const certification = certifications.find(c => c.id === certificationId);
  
  if (!certification) return null;
  
  const nextModule = certification.learningPath[userCert.progress.modulesCompleted];
  return nextModule || null;
}

async function awardEnrollmentXp(userId: string, certification: Certification) {
  const xp = 100;
  
  await prisma.xpGain.create({
    data: {
      userId,
      source: 'certification_enrollment',
      sourceId: certification.id,
      amount: xp,
      reason: `Enrolled in ${certification.name} certification`
    }
  });
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: xp
      }
    }
  });
}

async function awardModuleXp(userId: string string, moduleId, certificationId:: number, score?: number) {
  const baseXp = 50;
  const scoreBonus = score ? Math.floor(score / 10) : 0;
  const xp = baseXp + scoreBonus;
  
  await prisma.xpGain.create({
    data: {
      userId,
      source: 'certification_module',
      sourceId: `${certificationId}_${moduleId}`,
      amount: xp,
      reason: `Completed certification module ${moduleId}`
    }
  });
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: xp
      }
    }
  });
}

function generatePaymentInstructions(enrollment: UserCertification) {
  return {
    amount: enrollment.payment?.amount,
    methods: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI'],
    instructions: [
      'Payment must be completed within 7 days of enrollment',
      'Receipt will be generated immediately',
      'Refund policy applies as per terms',
      'EMI options available for amounts above ₹10,000'
    ]
  };
}

function generateEnrollmentNextSteps(certification: Certification) {
  return [
    'Complete payment to activate enrollment',
    'Access learning portal and study materials',
    'Join student community groups',
    'Schedule kick-off call with mentor',
    'Begin with Module 1',
    'Track progress regularly',
    'Join study groups',
    'Prepare for assessments'
  ];
}

function generatePartnershipRequirements(partnershipType: string) {
  const requirements = {
    educational: [
      'Accredited educational institution',
      'Minimum 3 years experience',
      'Qualified faculty members',
      'Quality assurance framework'
    ],
    corporate: [
      'Minimum 100 employees',
      'Industry presence for 5+ years',
      'Compliance with regulations',
      'Professional training infrastructure'
    ],
    government: [
      'Government approval',
      'Public sector recognition',
      'Compliance framework',
      'Transparency measures'
    ]
  };
  
  return requirements[partnershipType as keyof typeof requirements] || [];
}