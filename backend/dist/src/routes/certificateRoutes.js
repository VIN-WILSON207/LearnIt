"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificateController_1 = require("../controllers/certificateController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.authenticate, certificateController_1.generateCertificate);
router.get('/', auth_1.authenticate, certificateController_1.getCertificates);
exports.default = router;
