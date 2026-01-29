'use client';

import React, { useState } from 'react';
import styles from './FAQPage.module.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'faq1',
      question: 'What is the difference between O/L and A/L courses?',
      answer:
        'O/L (Ordinary Level) courses are foundation-level ICT & Computer Science courses designed for students preparing for their Ordinary Level examinations. A/L (Advanced Level) courses are advanced-level courses designed for students preparing for their Advanced Level examinations. A/L courses build upon the knowledge gained in O/L courses.',
      category: 'Educational Levels',
    },
    {
      id: 'faq2',
      question: 'How do I upgrade my subscription?',
      answer:
        'You can upgrade your subscription anytime from your account settings or the subscription page. Simply select your desired plan (Basic or Pro), enter your payment details, and the upgrade will be processed immediately. Your current plan will be extended with the new plan features.',
      category: 'Subscription',
    },
    {
      id: 'faq3',
      question: 'Can I download certificates?',
      answer:
        'Certificates are available to Pro plan members only. When you complete a course successfully, a certificate will be automatically generated and made available for download in PDF format. Free and Basic plan members cannot download certificates.',
      category: 'Certificates',
    },
    {
      id: 'faq4',
      question: 'How many quiz attempts do I get?',
      answer:
        'Free plan members cannot attempt quizzes. Basic plan members get 3 quiz attempts per month. Pro plan members get unlimited quiz attempts. Each quiz reset monthly.',
      category: 'Quizzes & Assessments',
    },
    {
      id: 'faq5',
      question: 'What happens if my subscription expires?',
      answer:
        'If your subscription expires, you will automatically be downgraded to the Free plan. You will lose access to premium features like quizzes, certificate downloads, and advanced analytics. You can renew your subscription anytime to regain access to these features.',
      category: 'Subscription',
    },
    {
      id: 'faq6',
      question: 'Can I access all courses for free?',
      answer:
        'Most introductory courses are available to Free plan members. However, advanced courses and specialized tracks require Basic or Pro subscriptions. Check each course page to see the minimum subscription level required.',
      category: 'Courses',
    },
    {
      id: 'faq7',
      question: 'How long do I have access to courses after enrollment?',
      answer:
        'Once you enroll in a course, you have lifetime access to all course materials, including lectures, notes, and resources. Your access will not be affected by subscription changes, except for premium features that require specific subscription levels.',
      category: 'Courses',
    },
    {
      id: 'faq8',
      question: 'Is there a money-back guarantee?',
      answer:
        'We offer a 7-day money-back guarantee for new subscriptions. If you are not satisfied with your subscription within the first 7 days, contact our support team for a full refund.',
      category: 'Billing',
    },
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about LearnIt</p>
      </div>

      <div className={styles.content}>
        {categories.map(category => (
          <div key={category} className={styles.category}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            <div className={styles.faqList}>
              {faqs
                .filter(faq => faq.category === category)
                .map(faq => (
                  <div
                    key={faq.id}
                    className={`${styles.faqItem} ${expandedId === faq.id ? styles.expanded : ''
                      }`}
                  >
                    <button
                      className={styles.question}
                      onClick={() => toggleExpanded(faq.id)}
                    >
                      <span className={styles.questionText}>{faq.question}</span>
                      <span className={styles.icon}>
                        {expandedId === faq.id ? '−' : '+'}
                      </span>
                    </button>
                    {expandedId === faq.id && (
                      <div className={styles.answer}>{faq.answer}</div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.supportSection}>
        <h3>Still have questions?</h3>
        <p>Contact our support team for assistance</p>
        <a href="mailto:support@LearnIt.lk" className={styles.supportLink}>
          support@LearnIt.lk
        </a>
      </div>
    </div>
  );
};

export default FAQPage;
