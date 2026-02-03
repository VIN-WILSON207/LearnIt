'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getQuiz, submitQuiz, Quiz, SubmitQuizResponse } from '@/lib/api/quizzes';
import styles from './page.module.css';
import { FiCheckCircle, FiXCircle, FiArrowRight, FiFileText } from 'react-icons/fi';

export default function QuizPage() {
     const { lessonId } = useParams();
     const router = useRouter();
     const [quiz, setQuiz] = useState<Quiz | null>(null);
     const [answers, setAnswers] = useState<Record<string, string>>({});
     const [result, setResult] = useState<SubmitQuizResponse | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          const fetchQuiz = async () => {
               if (!lessonId) return;
               setIsLoading(true);
               try {
                    const data = await getQuiz(lessonId as string);
                    setQuiz(data);
               } catch (err: any) {
                    setError(err.message || 'Failed to load quiz');
               } finally {
                    setIsLoading(false);
               }
          };
          fetchQuiz();
     }, [lessonId]);

     const handleOptionSelect = (questionId: string, optionId: string) => {
          if (result) return;
          setAnswers(prev => ({ ...prev, [questionId]: optionId }));
     };

     const handleSubmit = async () => {
          if (!quiz || isSubmitting) return;
          setIsSubmitting(true);
          try {
               const response = await submitQuiz({
                    quizId: quiz.id,
                    answers
               });
               setResult(response);
          } catch (err: any) {
               alert(err.message || 'Failed to submit quiz');
          } finally {
               setIsSubmitting(false);
          }
     };

     if (isLoading) return <div className={styles.center}><p>Loading quiz...</p></div>;
     if (error) return <div className={styles.center}><p className={styles.error}>{error}</p></div>;
     if (!quiz) return <div className={styles.center}><p>No quiz found for this lesson.</p></div>;

     if (result) {
          return (
               <ProtectedRoute requiredRole="student">
                    <Navbar />
                    <div className={styles.container}>
                         <Card className={styles.resultCard}>
                              {result.passed ? (
                                   <div className={styles.success}>
                                        <FiCheckCircle size={64} />
                                        <h1>Congratulations!</h1>
                                        <p>You passed the quiz with a score of {result.score}%</p>
                                   </div>
                              ) : (
                                   <div className={styles.fail}>
                                        <FiXCircle size={64} />
                                        <h1>Keep Trying!</h1>
                                        <p>You scored {result.score}%, but you need {quiz.passMark}% to pass.</p>
                                   </div>
                              )}
                              <div className={styles.resultActions}>
                                   <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
                                   <Button variant="primary" onClick={() => router.back()}>Back to Lesson</Button>
                              </div>
                         </Card>
                    </div>
               </ProtectedRoute>
          );
     }

     const isComplete = quiz.questions.every(q => answers[q.id]);

     return (
          <ProtectedRoute requiredRole="student">
               <Navbar />
               <div className={styles.container}>
                    <div className={styles.header}>
                         <FiFileText size={48} color="var(--primary)" />
                         <h1>Lesson Quiz</h1>
                         <p>Answer all questions to complete the lesson.</p>
                    </div>

                    <div className={styles.questionsList}>
                         {quiz.questions.map((question, index) => (
                              <Card key={question.id} className={styles.questionCard}>
                                   <div className={styles.questionHeader}>
                                        <span className={styles.qNumber}>Question {index + 1}</span>
                                        <h3>{question.text}</h3>
                                   </div>
                                   <div className={styles.options}>
                                        {question.options.map((option) => (
                                             <label
                                                  key={option.id}
                                                  className={`${styles.option} ${answers[question.id] === option.id ? styles.selected : ''}`}
                                                  onClick={() => handleOptionSelect(question.id, option.id)}
                                             >
                                                  <input
                                                       type="radio"
                                                       name={question.id}
                                                       checked={answers[question.id] === option.id}
                                                       onChange={() => { }} // Controlled by label click
                                                       hidden
                                                  />
                                                  <span>{option.text}</span>
                                             </label>
                                        ))}
                                   </div>
                              </Card>
                         ))}
                    </div>

                    <div className={styles.actions}>
                         <Button
                              variant="primary"
                              size="large"
                              disabled={!isComplete || isSubmitting}
                              onClick={handleSubmit}
                         >
                              {isSubmitting ? 'Submitting...' : 'Submit Quiz'} <FiArrowRight />
                         </Button>
                    </div>
               </div>
          </ProtectedRoute>
     );
}
