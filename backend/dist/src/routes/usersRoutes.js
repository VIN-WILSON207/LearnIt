"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), usersController_1.createUser);
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), usersController_1.getAllUsers);
router.get('/role/:role', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), usersController_1.getUsersByRole);
router.get('/:userId', auth_1.authenticate, usersController_1.getUserById);
router.put('/:userId', auth_1.authenticate, usersController_1.updateUser);
router.delete('/:userId', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), usersController_1.deleteUser);
router.post('/:userId/change-password', auth_1.authenticate, usersController_1.changePassword);
// Admin endpoints
router.post('/:userId/suspend', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), usersController_1.suspendUser);
router.post('/:userId/restore', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), usersController_1.restoreUser);
router.post('/:userId/delete', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), usersController_1.adminDeleteUser);
exports.default = router;
