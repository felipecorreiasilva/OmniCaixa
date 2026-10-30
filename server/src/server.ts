import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import salesRoutes from './routes/salesRoutes';
import pixRoutes from './routes/pixRoutes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3333;
const HOST = '0.0.0.0'; // Permite conexões externas na rede local

app.use(cors());
app.use(express.json());

// Importa as rotas de autenticação e usuários
app.use(authRoutes);
app.use(userRoutes);
app.use(productRoutes);
app.use(salesRoutes);
app.use('/api/pix', pixRoutes);

app.get('/', (req, res) => {
  return res.json({ message: '🚀 Servidor do PDV rodando com sucesso!' });
});

// Serve a pasta 'uploads' estaticamente na rota '/uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(PORT, HOST, () => {
  console.log(`🔥 Servidor executando na rede em http://${HOST}:${PORT} (ou http://192.168.2.107:${PORT})`);
});