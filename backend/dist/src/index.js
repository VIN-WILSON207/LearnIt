"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const certificateRoutes_1 = __importDefault(require("./routes/certificateRoutes"));
const forumRoutes_1 = __importDefault(require("./routes/forumRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const enrollmentRoutes_1 = __importDefault(require("./routes/enrollmentRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const configRoutes_1 = __importDefault(require("./routes/configRoutes"));
const quizStatsRoutes_1 = __importDefault(require("./routes/quizStatsRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const adminSubscriptionRoutes_1 = __importDefault(require("./routes/adminSubscriptionRoutes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/subscriptions', subscriptionRoutes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.use('/api/progress', progressRoutes_1.default);
app.use('/api/certificates', certificateRoutes_1.default);
app.use('/api/forum', forumRoutes_1.default);
app.use('/api/support', supportRoutes_1.default);
app.use('/api/enrollments', enrollmentRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/users', usersRoutes_1.default);
app.use('/api/config', configRoutes_1.default);
app.use('/api/quiz-stats', quizStatsRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes_1.default);
// Root route
app.get('/', (req, res) => {
    res.send('LEARNIT API Running');
});
// Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: err });
});
// Start server
app.listen(port, () => {
    console.log(`LEARNIT running on port ${port}`);
});
