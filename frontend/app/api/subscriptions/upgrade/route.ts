import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_BASE}/api/subscriptions/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
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
