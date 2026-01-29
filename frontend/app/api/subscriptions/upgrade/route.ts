import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mockData';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, newPlan, paymentMethod } = body;

    if (!userId || !newPlan) {
      return NextResponse.json(
        { error: 'Missing userId or newPlan' },
        { status: 400 }
      );
    }

    // Validate plan (include student plans)
    if (!['free', 'basic', 'pro', 'student_basic', 'student_pro'].includes(newPlan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Handle payment simulation
    const paymentDetails = {
      method: paymentMethod || 'card',
      status: 'successful',
      transactionId: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Mock payment processing (in real app, integrate Stripe/PayPal)
    if (newPlan !== 'free' && !paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method required for paid plans' },
        { status: 400 }
      );
    }

    // Calculate dates
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Update user subscription
    const updatedUser = {
      ...user,
      subscription: {
        plan: newPlan as any,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'active' as const,
      },
    };

    // In real app, persist to database
    // For now, return success response
    return NextResponse.json(
      {
        success: true,
        message: `Successfully upgraded to ${newPlan} plan`,
        user: updatedUser,
        paymentDetails,
        features: {
          pro: {
            certificateAccess: true,
            unlimitedQuizAttempts: true,
            fullNotes: true,
            advancedAnalytics: true,
          },
          basic: {
            certificateAccess: false,
            quizAttempts: 3,
            fullNotes: true,
            basicAnalytics: true,
          },
          free: {
            certificateAccess: false,
            quizAttempts: 0,
            limitedNotes: 5,
            noAnalytics: true,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process subscription upgrade' },
      { status: 500 }
    );
  }
};

// GET: Retrieve available plans
export const GET = async (request: NextRequest) => {
  const role = request.nextUrl.searchParams.get('role');

  const basePlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'LKR',
      billingCycle: 'month',
      features: [
        'Access to basic courses',
        'Limited study materials (5 pages)',
        'Community forums access',
        'NO quizzes & assessments',
        'NO certificates',
      ],
      cta: 'Current Plan',
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 299,
      currency: 'LKR',
      billingCycle: 'month',
      features: [
        'All Free features +',
        'Full study materials access',
        'Quizzes (3 attempts/month)',
        'Basic progress analytics',
        'NO certificates',
      ],
      cta: 'Upgrade to Basic',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 999,
      currency: 'LKR',
      billingCycle: 'month',
      features: [
        'All Basic features +',
        'Unlimited quiz attempts',
        'Download certificates',
        'Advanced analytics dashboard',
        'Priority support',
      ],
      cta: 'Upgrade to Pro',
      badge: 'Most Popular',
    },
  ];

  // Student-specific discounted plans
  const studentPlans = [
    {
      id: 'student_basic',
      name: 'Student Basic',
      price: 149,
      currency: 'LKR',
      billingCycle: 'month',
      features: [
        'All Free features +',
        'Full study materials access',
        'Quizzes (5 attempts/month)',
        'Basic progress analytics',
        'NO certificates',
      ],
      cta: 'Upgrade to Student Basic',
      badge: 'Student Discount',
    },
    {
      id: 'student_pro',
      name: 'Student Pro',
      price: 399,
      currency: 'LKR',
      billingCycle: 'month',
      features: [
        'All Basic features +',
        'Unlimited quiz attempts',
        'Download certificates',
        'Advanced analytics dashboard',
        'Priority support',
      ],
      cta: 'Upgrade to Student Pro',
      badge: 'Student Discount',
    },
  ];

  const plans = role === 'student' ? [basePlans[0], studentPlans[0], studentPlans[1]] : basePlans;

  return NextResponse.json({ plans }, { status: 200 });
};
