"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const certificateRoutes_1 = __importDefault(require("./routes/certificateRoutes"));
const forumRoutes_1 = __importDefault(require("./routes/forumRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'))); // Serve uploaded files
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/subscriptions', subscriptionRoutes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.use('/api/progress', progressRoutes_1.default);
app.use('/api/certificates', certificateRoutes_1.default);
app.use('/api/forum', forumRoutes_1.default);
app.use('/api/support', supportRoutes_1.default);
// Root route
app.get('/', (req, res) => {
    res.send('LEARNIT API Running');
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("DEBUG: Global Error Handler Caught:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: err });
});
// Start server
app.listen(port, () => {
    console.log(`LEARNIT running on port ${port}`);
});
