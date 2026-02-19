"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Student Routes
router.get('/:lessonId', quizController_1.getQuiz);
router.post('/submit', auth_1.authenticate, quizController_1.submitQuiz);
router.get('/attempts/:quizId', auth_1.authenticate, quizController_1.getQuizAttempts);
// Instructor/Admin Routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('INSTRUCTOR', 'ADMIN'), quizController_1.createQuiz);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('INSTRUCTOR', 'ADMIN'), quizController_1.updateQuiz);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('INSTRUCTOR', 'ADMIN'), quizController_1.deleteQuiz);
exports.default = router;
