'use client';

import React, { useState, useEffect } from 'react';
import styles from './QuizInterface.module.css';
import { Button } from '@/components/Button';

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: number;
  expectedAnswers?: string[];
}

interface QuizProps {
  quizId: string;
  title: string;
  description: string;
  duration: number;
  questions: Question[];
  onSubmit: (answers: any[]) => void;
}

const QuizInterface: React.FC<QuizProps> = ({
  quizId,
  title,
  description,
  duration,
  questions,
  onSubmit,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
  const [submitted, setSubmitted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: any) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const submittedAnswers = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id],
    }));
    
    onSubmit(submittedAnswers);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.submitted}>
        <div className={styles.icon}>✓</div>
        <h3>Quiz Submitted!</h3>
        <p>Your answers have been submitted. You will see results shortly.</p>
        <Button onClick={() => window.location.href = '/student/dashboard'}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = answers[question.id] !== undefined;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.timer}>
          <span className={styles.label}>Time Remaining</span>
          <span className={`${styles.time} ${timeRemaining < 300 ? styles.warning : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.fill} style={{ width: `${progress}%` }}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.questionNumber}>
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <div className={styles.question}>
          <h3>{question.question}</h3>
        </div>

        <div className={styles.answers}>
          {question.type === 'multiple-choice' && question.options && (
            <div className={styles.options}>
              {question.options.map((option, index) => (
                <label key={index} className={styles.option}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={index}
                    checked={answers[question.id] === index}
                    onChange={() => handleAnswer(index)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'short-answer' && (
            <textarea
              className={styles.textarea}
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            />
          )}
        </div>

        <div className={styles.navigationStatus}>
          <span className={isAnswered ? styles.answered : styles.unanswered}>
            {isAnswered ? '✓ Answered' : '○ Not answered'}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </Button>

        <div className={styles.indicators}>
          {questions.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentQuestion ? styles.active : ''
              } ${answers[questions[index].id] !== undefined ? styles.done : ''}`}
              onClick={() => setCurrentQuestion(index)}
              title={`Question ${index + 1}`}
            />
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isAnswered}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
