/**
 * Quizzes API
 * 
 * Functions for quiz-related endpoints
 */

import apiClient from '../apiClient';

export interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lessonId: string;
  passMark: number;
  questions: QuizQuestion[];
}

export interface SubmitQuizRequest {
  quizId: string;
  answers: Record<string, string>; // questionId -> optionId
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface SubmitQuizResponse {
  attempt: QuizAttempt;
  score: number;
  passed: boolean;
}

/**
 * Get quiz by lesson ID (public)
 */
export async function getQuiz(lessonId: string): Promise<Quiz> {
  return apiClient.get<Quiz>(`/api/quizzes/${lessonId}`);
}

/**
 * Submit quiz answers (authenticated)
 */
export async function submitQuiz(data: SubmitQuizRequest): Promise<SubmitQuizResponse> {
  return apiClient.post<SubmitQuizResponse>('/api/quizzes/submit', data);
}

/**
 * Get quiz attempts for a quiz (authenticated)
 */
export async function getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
  return apiClient.get<QuizAttempt[]>(`/api/quizzes/attempts/${quizId}`);
}
