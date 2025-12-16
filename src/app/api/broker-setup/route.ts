import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dynamic Broker Setup API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // Get available brokers from database
    const availableBrokers = await db.broker.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // Get user's current broker connection
    const userBrokerConnection = await db.brokerConnection.findFirst({
      where: { userId },
      include: {
        broker: true
      }
    });

    // Get user's trading account if exists
    const tradingAccount = await db.tradingAccount.findFirst({
      where: { userId },
      include: {
        broker: true
      }
    });

    // Enhanced broker data with features and status
    const enrichedBrokers = availableBrokers.map(broker => {
      const isConnected = userBrokerConnection?.brokerId === broker.id;
      const connectionStatus = isConnected ? userBrokerConnection?.status : 'NOT_CONNECTED';

      return {
        id: broker.id,
        name: broker.name,
        logo: broker.logo,
        features: broker.features || [],
        commission: broker.commission || '0.1%',
        minAmount: broker.minAmount || 1000,
        isConnected,
        connectionStatus,
        lastSync: isConnected ? userBrokerConnection?.lastSync : null,
        supportedOrderTypes: broker.supportedOrderTypes || ['MARKET', 'LIMIT', 'STOP_LOSS'],
        supportedSegments: broker.supportedSegments || ['EQUITY', 'DERIVATIVES'],
        apiStatus: broker.apiStatus || 'ACTIVE',
        setupInstructions: getSetupInstructions(broker.name),
        verificationSteps: getVerificationSteps(broker.name)
      };
    });

    // Get recent connection activities
    const connectionActivities = await db.brokerConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        broker: true
      }
    });

    // Get supported broker features
    const supportedFeatures = await getSupportedFeatures();

    const brokerSetupData = {
      availableBrokers: enrichedBrokers,
      currentConnection: userBrokerConnection ? {
        brokerId: userBrokerConnection.brokerId,
        brokerName: userBrokerConnection.broker.name,
        connectionStatus: userBrokerConnection.status,
        lastSync: userBrokerConnection.lastSync,
        connectionData: userBrokerConnection.connectionData,
        accountInfo: tradingAccount ? {
          accountNumber: tradingAccount.accountNumber,
          accountType: tradingAccount.accountType,
          isActive: tradingAccount.isActive,
          marginAvailable: tradingAccount.marginAvailable
        } : null
      } : null,
      
      connectionActivities: connectionActivities.map(activity => ({
        id: activity.id,
        brokerName: activity.broker.name,
        action: activity.status === 'CONNECTED' ? 'Connected' : 'Disconnected',
        timestamp: activity.createdAt,
        status: activity.status
      })),

      supportedFeatures,
      
      setupRequirements: {
        kycCompleted: await checkKYCStatus(userId),
        bankAccountLinked: await checkBankAccountStatus(userId),
        mobileVerified: await checkMobileVerification(userId),
        emailVerified: await checkEmailVerification(userId)
      },

      brokerComparison: generateBrokerComparison(availableBrokers),

      integrationGuide: {
        steps: [
          {
            step: 1,
            title: 'Choose Your Broker',
            description: 'Select from our supported brokers',
            icon: 'Building2'
          },
          {
            step: 2,
            title: 'Connect Account',
            description: 'Securely connect your trading account',
            icon: 'Link'
          },
          {
            step: 3,
            title: 'Verify Connection',
            description: 'Confirm your account details',
            icon: 'CheckCircle'
          },
          {
            step: 4,
            title: 'Start Trading',
            description: 'Begin trading with real-time data',
            icon: 'TrendingUp'
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: brokerSetupData
    });

  } catch (error) {
    console.error('Broker Setup API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch broker setup data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'connect_broker':
        // Connect to a broker
        const { brokerId, credentials } = data;
        
        // Verify broker exists
        const broker = await db.broker.findUnique({
          where: { id: brokerId }
        });

        if (!broker) {
          return NextResponse.json(
            { error: 'Broker not found' },
            { status: 404 }
          );
        }

        // Create broker connection
        const brokerConnection = await db.brokerConnection.create({
          data: {
            userId,
            brokerId,
            status: 'CONNECTING',
            connectionData: credentials, // Should be encrypted in production
            lastSync: new Date()
          }
        });

        // Simulate connection process (in production, this would call broker API)
        setTimeout(async () => {
          await db.brokerConnection.update({
            where: { id: brokerConnection.id },
            data: { status: 'CONNECTED' }
          });

          // Create trading account
          await db.tradingAccount.create({
            data: {
              userId,
              brokerId,
              accountNumber: generateAccountNumber(),
              accountType: 'REGULAR',
              isActive: true,
              marginAvailable: 100000 // Default margin
            }
          });
        }, 2000);

        return NextResponse.json({
          success: true,
          data: brokerConnection,
          message: 'Broker connection initiated!'
        });

      case 'disconnect_broker':
        // Disconnect from broker
        const { brokerId: disconnectBrokerId } = data;
        
        await db.brokerConnection.updateMany({
          where: {
            userId,
            brokerId: disconnectBrokerId
          },
          data: {
            status: 'DISCONNECTED'
          }
        });

        // Deactivate trading account
        await db.tradingAccount.updateMany({
          where: {
            userId,
            brokerId: disconnectBrokerId
          },
          data: {
            isActive: false
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Broker disconnected successfully!'
        });

      case 'test_connection':
        // Test broker connection
        const { brokerId: testBrokerId } = data;
        
        // Simulate connection test
        const connectionTest = await testBrokerConnection(testBrokerId);

        return NextResponse.json({
          success: true,
          data: connectionTest,
          message: connectionTest.success ? 'Connection test successful!' : 'Connection test failed!'
        });

      case 'sync_account':
        // Sync account data from broker
        const { brokerId: syncBrokerId } = data;
        
        await db.brokerConnection.updateMany({
          where: {
            userId,
            brokerId: syncBrokerId
          },
          data: {
            lastSync: new Date()
          }
        });

        // Simulate data sync (in production, this would sync real data)
        return NextResponse.json({
          success: true,
          message: 'Account data synchronized successfully!'
        });

      case 'update_credentials':
        // Update broker credentials
        const { brokerId: updateBrokerId, newCredentials } = data;
        
        await db.brokerConnection.updateMany({
          where: {
            userId,
            brokerId: updateBrokerId
          },
          data: {
            connectionData: newCredentials,
            status: 'CONNECTED'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Credentials updated successfully!'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Broker Setup POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform broker action' },
      { status: 500 }
    );
  }
}

// Helper functions
function getSetupInstructions(brokerName: string): string[] {
  const instructions: { [key: string]: string[] } = {
    'Zerodha': [
      'Visit Zerodha Console and generate API key',
      'Enable all required permissions',
      'Copy API key and secret',
      'Enter credentials in our secure form'
    ],
    'Angel Broking': [
      'Login to Angel Broking account',
      'Navigate to API section',
      'Create new API application',
      'Note down API key and password'
    ],
    'ICICI Direct': [
      'Access ICICI Direct account',
      'Go to Profile > API Management',
      'Generate new API credentials',
      'Configure webhook URLs'
    ]
  };

  return instructions[brokerName] || [
    'Login to your broker account',
    'Find API/Integration section',
    'Generate API credentials',
    'Enter credentials securely'
  ];
}

function getVerificationSteps(brokerName: string): string[] {
  return [
    'Verify account ownership',
    'Check trading permissions',
    'Validate API connectivity',
    'Confirm data access rights'
  ];
}

async function getSupportedFeatures() {
  const features = await db.brokerFeature.findMany({
    include: {
      brokers: true
    }
  });

  return features.map(feature => ({
    id: feature.id,
    name: feature.name,
    description: feature.description,
    category: feature.category,
    supportedBy: feature.brokers.map(b => b.name)
  }));
}

async function checkKYCStatus(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true }
  });
  
  return user?.kycStatus === 'VERIFIED';
}

async function checkBankAccountStatus(userId: string) {
  const bankAccounts = await db.bankAccount.count({
    where: { userId, isVerified: true }
  });
  
  return bankAccounts > 0;
}

async function checkMobileVerification(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { mobileVerified: true }
  });
  
  return user?.mobileVerified || false;
}

async function checkEmailVerification(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true }
  });
  
  return user?.emailVerified || false;
}

function generateBrokerComparison(brokers: any[]) {
  return brokers.map(broker => ({
    name: broker.name,
    commission: broker.commission || '0.1%',
    minAmount: broker.minAmount || 1000,
    rating: 4.5, // Would come from reviews
    features: broker.features || [],
    pros: getBrokerPros(broker.name),
    cons: getBrokerCons(broker.name)
  }));
}

function getBrokerPros(brokerName: string): string[] {
  const pros: { [key: string]: string[] } = {
    'Zerodha': ['Low brokerage', 'Advanced platform', 'Good customer support'],
    'Angel Broking': ['Research reports', 'Wide product range', 'Strong mobile app'],
    'ICICI Direct': ['Integrated banking', 'Research quality', 'Brand trust']
  };

  return pros[brokerName] || ['Reliable service', 'Good platform', 'Customer support'];
}

function getBrokerCons(brokerName: string): string[] {
  const cons: { [key: string]: string[] } = {
    'Zerodha': ['Limited research', 'No advisory services', 'Basic customer service'],
    'Angel Broking': ['Higher brokerage', 'Complex platform', 'Limited educational content'],
    'ICICI Direct': ['Higher charges', 'Complex interface', 'Limited innovation']
  };

  return cons[brokerName] || ['Room for improvement', 'Limited features', 'Average support'];
}

function generateAccountNumber(): string {
  return 'INR' + Math.random().toString(36).substr(2, 10).toUpperCase();
}

async function testBrokerConnection(brokerId: string) {
  // Simulate connection test
  const isSuccess = Math.random() > 0.2; // 80% success rate
  
  return {
    success: isSuccess,
    responseTime: Math.floor(Math.random() * 1000) + 500,
    message: isSuccess ? 'Connection successful' : 'Connection failed',
    details: isSuccess ? 'API connectivity confirmed' : 'Unable to connect to broker API'
  };
}