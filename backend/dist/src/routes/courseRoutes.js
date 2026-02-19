"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const upload_1 = __importDefault(require("../middleware/upload"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, courseController_1.getAllCourses);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('INSTRUCTOR', 'ADMIN'), courseController_1.createCourse);
router.post('/lesson', auth_1.authenticate, (0, auth_1.authorize)('INSTRUCTOR', 'ADMIN'), upload_1.default.fields([
    { name: 'video', maxCount: 1 },
    { name: 'attachment', maxCount: 1 }
]), courseController_1.uploadLesson);
router.get('/instructor/:instructorId', auth_1.authenticate, courseController_1.getInstructorCourses);
router.get('/:id', auth_1.authenticate, courseController_1.getCourseById);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('INSTRUCTOR', 'ADMIN'), courseController_1.submitCourseUpdates);
router.post('/:id/unpublish-request', auth_1.authenticate, (0, auth_1.authorize)('INSTRUCTOR', 'ADMIN'), courseController_1.requestCourseUnpublish);
exports.default = router;
