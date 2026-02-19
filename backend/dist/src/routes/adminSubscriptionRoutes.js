"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const subscriptionController_1 = require("../controllers/subscriptionController");
const router = (0, express_1.Router)();
const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only admins can access subscription plans management'
        });
    }
    next();
};
router.use(auth_1.authenticate);
router.use(adminOnly);
router.get('/', subscriptionController_1.getAllPlans);
router.post('/', subscriptionController_1.createPlan);
router.put('/:id', subscriptionController_1.updatePlan);
router.delete('/:id', subscriptionController_1.deletePlan);
exports.default = router;
