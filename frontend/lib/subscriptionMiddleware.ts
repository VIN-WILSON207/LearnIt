// Subscription-based access control middleware
import { User, SubscriptionPlan } from '@/types';

// Define feature access by subscription plan
export const planFeatures: Record<SubscriptionPlan, Record<string, boolean | string>> = {
  free: {
    accessCourses: true,
    accessQuizzes: false, // Disabled for free users
    attemptQuiz: false,
    downloadCertificates: false,
    accessNotes: 'limited', // Limited notes (5 pages)
    accessAssignments: false,
    accessDiscussions: true,
    accessAnalytics: false,
    storageLimit: '100MB',
  },
  basic: {
    accessCourses: true,
    accessQuizzes: true,
    attemptQuiz: true,
    downloadCertificates: false,
    accessNotes: 'full',
    accessAssignments: true,
    accessDiscussions: true,
    accessAnalytics: true, // Limited
    storageLimit: '1GB',
  },
  pro: {
    accessCourses: true,
    accessQuizzes: true,
    attemptQuiz: true, // Unlimited attempts
    downloadCertificates: true,
    accessNotes: 'full',
    accessAssignments: true,
    accessDiscussions: true,
    accessAnalytics: true, // Full analytics
    storageLimit: '10GB',
  },
};

// Check if user has access to a feature
export const checkFeatureAccess = (userPlan: SubscriptionPlan, feature: string): boolean | string => {
  const features = planFeatures[userPlan];
  return features[feature] ?? false;
};

// Check if subscription is active and not expired
export const isSubscriptionActive = (user: User): boolean => {
  if (!user.subscription) return false;
  
  const { status, endDate } = user.subscription;
  if (status !== 'active') return false;
  
  const expiryDate = new Date(endDate);
  const today = new Date();
  
  return today <= expiryDate;
};

// Get user's effective plan (downgrade to free if expired)
export const getEffectivePlan = (user: User): SubscriptionPlan => {
  if (!isSubscriptionActive(user)) {
    return 'free'; // Auto-downgrade on expiry
  }
  return user.subscription?.plan ?? 'free';
};

// Check if user can access a resource based on minPlan requirement
export const canAccessResource = (user: User, minPlan: SubscriptionPlan): boolean => {
  const effectivePlan = getEffectivePlan(user);
  
  const planHierarchy: Record<SubscriptionPlan, number> = {
    free: 0,
    basic: 1,
    pro: 2,
  };
  
  return planHierarchy[effectivePlan] >= planHierarchy[minPlan];
};

// Get remaining quiz attempts for user (basic: 3/month, pro: unlimited)
export const getRemainingQuizAttempts = (user: User, quizId: string): number | 'unlimited' => {
  const plan = getEffectivePlan(user);
  
  if (plan === 'free') return 0; // No access
  if (plan === 'pro') return 'unlimited';
  
  // For basic: would need to track attempts per month
  // This is simplified - in real app, track in database
  return 3;
};

// Downgrade user subscription on expiry
export const autoDowngradeExpiredSubscription = (user: User): User => {
  if (!isSubscriptionActive(user) && user.subscription?.plan !== 'free') {
    return {
      ...user,
      subscription: {
        plan: 'free',
        startDate: user.subscription?.startDate || new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Free plan for 1 year
        status: 'expired',
      },
    };
  }
  return user;
};

// Validate if course is accessible
export const validateCourseAccess = (user: User, courseMinPlan: SubscriptionPlan): { access: boolean; reason?: string } => {
  if (!isSubscriptionActive(user) && courseMinPlan !== 'free') {
    return {
      access: false,
      reason: 'Subscription expired. Please upgrade to continue.',
    };
  }
  
  if (!canAccessResource(user, courseMinPlan)) {
    return {
      access: false,
      reason: `This course requires ${courseMinPlan} plan or higher.`,
    };
  }
  
  return { access: true };
};
