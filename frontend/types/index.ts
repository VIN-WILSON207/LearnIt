// Subscription types
export type SubscriptionPlan = 'free' | 'basic' | 'pro';

export interface Subscription {
  plan: SubscriptionPlan;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'active' | 'expired' | 'cancelled';
}

// User types
export interface User {
  id: string;
  email: string;
  name: string; // Changed from fullName to match backend
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'; // Uppercase to match Prisma enum
  levelId?: string;
  level?: {
    id: string;
    name: string;
  };
  subscription?: Subscription | null;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  enrolledCount: number;
  rating: number;
  minPlan: SubscriptionPlan;
  image?: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number; // minutes
}

// Quiz types
export type QuestionType = 'multiple-choice' | 'short-answer' | 'true-false';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer?: number | string[]; // index or array of correct answers
  expectedAnswers?: string[]; // For short answer
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  totalQuestions: number;
  duration: number; // minutes
  minPlan: SubscriptionPlan;
  passingScore: number;
  questions: Question[];
  allowReview: boolean;
  shuffleQuestions: boolean;
}

export interface QuizAttempt {
  attemptId: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  attemptedAt: string;
  completionTime: number; // minutes
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number | string;
  isCorrect: boolean;
}

// Assignment types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  submissions: number;
}

// Forum types
export interface ForumReply {
  id: string;
  author: string;
  authorRole: 'student' | 'instructor' | 'admin';
  content: string;
  createdDate: string;
  isApproved: boolean;
  likes?: number;
}

export interface ForumDiscussion {
  id: string;
  courseId: string;
  title: string;
  author: string;
  authorRole: 'student' | 'instructor' | 'admin';
  content: string;
  createdDate: string;
  replies: ForumReply[];
  isModerated: boolean;
  minPlanAccess: SubscriptionPlan;
  views?: number;
}

// Progress types
export interface CourseProgress {
  courseId: string;
  title: string;
  progress: number; // 0-100 percentage
  lastAccessed: string;
  timeSpent: number; // minutes
  modulesCompleted: number;
  totalModules: number;
}

export interface UserProgress {
  userId: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageProgress: number;
  totalTimeSpent: number; // minutes
  certificatesEarned: number;
  currentStreak: number; // days
  coursesInProgress: CourseProgress[];
}

// Certificate types
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  issuedDate: string;
  expiryDate: string | null;
  certificateUrl: string;
  verificationCode: string;
  status: 'issued' | 'revoked';
}

// Payment types
export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  cta: string;
  badge?: string;
}

export interface PaymentTransaction {
  transactionId: string;
  userId: string;
  planId: SubscriptionPlan;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'successful' | 'failed';
  timestamp: string;
}

// Analytics types
export interface CourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  completionRate: number;
  averageRating: number;
  averageTimeSpent: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalInstructors: number;
  totalCourses: number;
  averageCompletion: number;
  totalEnrollments: number;
  subscribedUsers: {
    free: number;
    basic: number;
    pro: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  status: number;
}
