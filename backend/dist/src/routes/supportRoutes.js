"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supportController_1 = require("../controllers/supportController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes
router.post('/', auth_1.authenticate, supportController_1.createMessage);
router.get('/my', auth_1.authenticate, supportController_1.getUserMessages);
router.get('/:id', auth_1.authenticate, supportController_1.getMessage);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), supportController_1.getAllMessages);
router.post('/:id/response', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), supportController_1.addResponse);
router.put('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), supportController_1.updateMessageStatus);
exports.default = router;
