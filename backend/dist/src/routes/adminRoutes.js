"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Course Moderation
router.post('/courses/:id/action', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), adminController_1.handleCourseAction);
router.get('/courses/review-requests', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), adminController_1.getCourseReviewRequests);
router.post('/courses/review-requests/:id/action', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), adminController_1.handleCourseReviewRequestAction);
// Forum Moderation
router.post('/forum/:id/action', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), adminController_1.handleForumAction);
exports.default = router;
