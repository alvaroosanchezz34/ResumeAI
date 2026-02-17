const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middlewares/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const authMiddleware = require('./middlewares/auth.middleware');
const documentRoutes = require('./modules/documents/document.routes');
const usageRoutes = require('./modules/usage/usage.routes');
const generationRoutes = require('./modules/generation/generation.routes');
const stripeRoutes = require('./modules/stripe/stripe.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// ── Stripe webhook ANTES del express.json (necesita body raw) ─────────────────
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

// ── Body parser global ────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ResumeAI API' });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/auth',       authRoutes);
app.use('/ai',         authMiddleware, aiRoutes);
app.use('/documents',  authMiddleware, documentRoutes);
app.use('/usage',      usageRoutes);
app.use('/generation', generationRoutes);
app.use('/stripe',     stripeRoutes);
app.use('/admin',      adminRoutes);

// ── Error handler (SIEMPRE al final) ─────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;