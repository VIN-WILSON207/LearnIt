import { NextRequest, NextResponse } from 'next/server';
import { getEffectivePlan, canAccessResource } from '@/lib/subscriptionMiddleware';

// Mock certificates database
const mockCertificates: Record<string, any> = {};

// GET: Retrieve user certificates
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const certificateId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  if (certificateId) {
    const cert = mockCertificates[certificateId];
    if (!cert) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(cert, { status: 200 });
  }

  // Get all certificates for user
  const userCerts = Object.values(mockCertificates).filter(
    (cert: any) => cert.userId === userId
  );

  return NextResponse.json(
    {
      userId,
      certificatesEarned: userCerts.length,
      certificates: userCerts,
    },
    { status: 200 }
  );
};

// POST: Issue certificate when course is completed
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, courseId, courseName, userSubscriptionPlan, completionDate } = body;

    if (!userId || !courseId || !courseName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check subscription: Only Pro plan can download certificates
    if (!canAccessResource({ id: userId, subscription: { plan: userSubscriptionPlan, startDate: '', endDate: '', status: 'active' } } as any, 'pro' as any)) {
      return NextResponse.json(
        {
          error: 'Insufficient subscription',
          message: 'Only Pro plan members can download certificates',
          requiredPlan: 'pro',
        },
        { status: 403 }
      );
    }

    const certificateId = `CERT-${Date.now()}`;
    const certificate = {
      id: certificateId,
      userId,
      courseId,
      courseName,
      issuedDate: completionDate || new Date().toISOString().split('T')[0],
      expiryDate: null, // Certificates don't expire
      certificateUrl: `/certificates/${certificateId}.pdf`,
      verificationCode: `VERIFY-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: 'issued',
    };

    mockCertificates[certificateId] = certificate;

    return NextResponse.json(
      {
        success: true,
        message: 'Certificate issued successfully',
        certificate,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to issue certificate' },
      { status: 500 }
    );
  }
};

// DELETE: Revoke certificate (admin only)
export const DELETE = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { certificateId, userRole } = body;

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!certificateId) {
      return NextResponse.json(
        { error: 'certificateId is required' },
        { status: 400 }
      );
    }

    const cert = mockCertificates[certificateId];
    if (!cert) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    delete mockCertificates[certificateId];

    return NextResponse.json(
      {
        success: true,
        message: 'Certificate revoked successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revoke certificate' },
      { status: 500 }
    );
  }
};
