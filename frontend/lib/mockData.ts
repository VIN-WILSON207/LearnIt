// Mock user database with enhanced fields
export const mockUsers = [
  {
    id: '1',
    email: 'student@example.com',
    password: 'student123',
    fullName: 'Amal Perera',
    role: 'student',
    avatar: 'https://via.placeholder.com/40?text=AP',
    educationalLevel: 'A/L', // O/L or A/L
    subscription: {
      plan: 'pro', // free, basic, pro
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active', // active, expired, cancelled
    },
  },
  {
    id: '2',
    email: 'instructor@example.com',
    password: 'instructor123',
    fullName: 'Dr. Kamal Silva',
    role: 'instructor',
    avatar: 'https://via.placeholder.com/40?text=KS',
    educationalLevel: null,
    subscription: null, // Instructors don't have subscriptions
  },
  {
    id: '3',
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: 'admin',
    avatar: 'https://via.placeholder.com/40?text=AU',
    educationalLevel: null,
    subscription: null,
  },
];

// Mock subscription plans
export const subscriptionPlans = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      noteAccess: 'Limited introductory notes',
      learningMaterials: 'Sample only',
      assessments: false,
      certificates: false,
      progressTracking: 'Limited',
    },
  },
  basic: {
    name: 'Basic',
    price: 99, // In local currency
    features: {
      noteAccess: 'Full standard notes',
      learningMaterials: 'Limited quizzes & practice',
      assessments: true,
      certificates: false,
      progressTracking: 'Basic',
      forumAccess: 'Limited',
      assessmentAttempts: 3,
    },
  },
  pro: {
    name: 'Pro',
    price: 299,
    features: {
      noteAccess: 'Full access',
      learningMaterials: 'All content',
      assessments: true,
      certificates: true,
      progressTracking: 'Advanced analytics',
      forumAccess: 'Full',
      assessmentAttempts: 'Unlimited',
    },
  },
};

// Mock courses with subscription requirements
export const mockCourses = [
  {
    id: '1',
    title: 'ICT Fundamentals',
    description: 'Master ICT basics for O/L',
    instructor: 'Dr. Kamal Silva',
    category: 'ICT',
    level: 'O/L',
    duration: '8 weeks',
    hours: 40,
    students: 1250,
    rating: 4.8,
    image: 'https://via.placeholder.com/300x200?text=ICT',
    status: 'active',
    minPlan: 'free', // free, basic, pro
    modules: [
      {
        id: 'mod1',
        title: 'Introduction to IT',
        topics: [
          { id: 'topic1', title: 'What is IT?', minPlan: 'free' },
          { id: 'topic2', title: 'Hardware Basics', minPlan: 'basic' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Computer Science Essentials',
    description: 'Master A/L Computer Science',
    instructor: 'Dr. Kamal Silva',
    category: 'Computer Science',
    level: 'A/L',
    duration: '12 weeks',
    hours: 60,
    students: 850,
    rating: 4.9,
    image: 'https://via.placeholder.com/300x200?text=CS',
    status: 'active',
    minPlan: 'basic',
    modules: [],
  },
  {
    id: '3',
    title: 'Data Structures & Algorithms',
    description: 'Advanced CS concepts',
    instructor: 'Dr. Kamal Silva',
    category: 'Computer Science',
    level: 'A/L',
    duration: '10 weeks',
    hours: 50,
    students: 2100,
    rating: 4.7,
    image: 'https://via.placeholder.com/300x200?text=DSA',
    status: 'active',
    minPlan: 'pro',
    modules: [],
  },
  {
    id: '4',
    title: 'Web Development Basics',
    description: 'Build web applications',
    instructor: 'Dr. Kamal Silva',
    category: 'Web Development',
    level: 'A/L',
    duration: '8 weeks',
    hours: 35,
    students: 1500,
    rating: 4.6,
    image: 'https://via.placeholder.com/300x200?text=Web',
    status: 'active',
    minPlan: 'basic',
    modules: [],
  },
];

// Mock student enrollments
export const mockEnrollments = [
  {
    id: '1',
    studentId: '1',
    courseId: '1',
    enrolledDate: '2024-01-15',
    progress: 65,
    hoursCompleted: 26,
    status: 'in-progress',
  },
  {
    id: '2',
    studentId: '1',
    courseId: '2',
    enrolledDate: '2024-02-01',
    progress: 40,
    hoursCompleted: 20,
    status: 'in-progress',
  },
  {
    id: '3',
    studentId: '1',
    courseId: '3',
    enrolledDate: '2023-12-20',
    progress: 100,
    hoursCompleted: 60,
    status: 'completed',
  },
];

// Mock certificates
export const mockCertificates = [
  {
    id: '1',
    courseId: '3',
    courseName: 'Python for Data Science',
    studentId: '1',
    issueDate: '2024-01-10',
    certificateNumber: 'CERT-2024-001',
  },
];

// Mock learning materials
export const mockMaterials = [
  {
    id: '1',
    courseId: '1',
    title: 'HTML Basics Tutorial',
    type: 'video',
    url: 'https://via.placeholder.com/video',
    duration: '15 mins',
    order: 1,
  },
  {
    id: '2',
    courseId: '1',
    title: 'CSS Styling Guide',
    type: 'pdf',
    url: 'https://via.placeholder.com/pdf',
    duration: 'N/A',
    order: 2,
  },
  {
    id: '3',
    courseId: '1',
    title: 'JavaScript Fundamentals',
    type: 'video',
    url: 'https://via.placeholder.com/video',
    duration: '22 mins',
    order: 3,
  },
];

// Mock assignments
export const mockAssignments = [
  {
    id: '1',
    courseId: '1',
    title: 'Build Your First Website',
    description: 'Create a simple HTML/CSS website',
    dueDate: '2024-03-15',
    submissions: 850,
  },
];

// Mock quizzes with subscription rules
export const mockQuizzes = [
  {
    id: 'quiz1',
    courseId: '1',
    title: 'ICT Fundamentals Quiz',
    description: 'Test your ICT knowledge',
    totalQuestions: 10,
    duration: 30, // minutes
    minPlan: 'free',
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What does CPU stand for?',
        options: ['Central Processing Unit', 'Central Program Utility', 'Core Processor Unit', 'Central Protocol Unit'],
        correctAnswer: 0,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'What is the primary function of RAM?',
        expectedAnswers: ['temporary storage', 'cache', 'memory'],
      },
    ],
  },
  {
    id: 'quiz2',
    courseId: '2',
    title: 'Computer Science Advanced Quiz',
    description: 'Advanced CS concepts',
    totalQuestions: 20,
    duration: 60,
    minPlan: 'pro',
    passingScore: 70,
    questions: [],
  },
];

// Mock forum discussions
export const mockForumDiscussions = [
  {
    id: 'forum1',
    courseId: '1',
    title: 'How to understand CPU concepts?',
    author: 'Amal Perera',
    authorRole: 'student',
    content: 'I am struggling with CPU concepts. Can someone help?',
    createdDate: '2024-01-15',
    replies: [
      {
        id: 'reply1',
        author: 'Dr. Kamal Silva',
        authorRole: 'instructor',
        content: 'Great question! CPU is the brain of the computer...',
        createdDate: '2024-01-15',
        isApproved: true,
      },
    ],
    isModerated: true,
    minPlanAccess: 'free',
  },
];

// Mock FAQs
export const mockFAQs = [
  {
    id: 'faq1',
    question: 'What is the difference between O/L and A/L courses?',
    answer: 'O/L (Ordinary Level) courses are foundation level, while A/L (Advanced Level) courses are advanced.',
    category: 'Educational Levels',
  },
  {
    id: 'faq2',
    question: 'How do I upgrade my subscription?',
    answer: 'You can upgrade your subscription anytime from the subscription settings page.',
    category: 'Subscription',
  },
  {
    id: 'faq3',
    question: 'Can I download certificates?',
    answer: 'Certificates are available to Pro plan members only.',
    category: 'Certificates',
  },
];

// Mock analytics data
export const mockAnalytics = {
  totalUsers: 5420,
  totalStudents: 4200,
  totalInstructors: 980,
  totalCourses: 156,
  activeCourses: 142,
  totalHours: 125640,
  completionRate: 68,
  certificatesIssued: 3245,
  averageRating: 4.7,
};
