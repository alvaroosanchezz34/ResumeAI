const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middlewares/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const authMiddleware = require('./middlewares/auth.middleware');
const documentRoutes = require('./modules/documents/document.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ResumeAI API' });
});

// Rutas
app.use('/auth', authRoutes);
app.use('/ai', authMiddleware, aiRoutes);
app.use('/documents', authMiddleware, documentRoutes);

// Errores (SIEMPRE al final)
app.use(errorMiddleware);

module.exports = app;
