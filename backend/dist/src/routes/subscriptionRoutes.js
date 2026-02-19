"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public
router.get('/plans', subscriptionController_1.getPlans);
// Student
router.post('/subscribe', auth_1.authenticate, subscriptionController_1.subscribe);
router.get('/my', auth_1.authenticate, subscriptionController_1.getUserSubscriptions);
router.get('/access', auth_1.authenticate, subscriptionController_1.checkAccess);
// Admin Routes
router.get('/admin/plans', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), subscriptionController_1.getAllPlans);
router.post('/admin/plans', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), subscriptionController_1.createPlan);
router.put('/admin/plans/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), subscriptionController_1.updatePlan);
router.delete('/admin/plans/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), subscriptionController_1.deletePlan);
router.get('/admin/all', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), subscriptionController_1.getAllSubscriptions);
exports.default = router;
