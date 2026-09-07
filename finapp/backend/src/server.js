import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { categoryRoutes } from './routes/categoryRoutes.js';
import { transactionRoutes } from './routes/transactionRoutes.js';
import { recurrenceRoutes } from './routes/recurrenceRoutes.js';
import { dashboardRoutes } from './routes/dashboardRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recurrences', recurrenceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
