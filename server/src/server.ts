import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Importa as rotas de autenticação e usuários
app.use(authRoutes); // Adiciona as rotas de autenticação
app.use(userRoutes); // Adiciona as rotas de usuários
app.use(productRoutes); // Adiciona as rotas de produtos

app.get('/', (req, res) => {
  return res.json({ message: '🚀 Servidor do PDV rodando com sucesso!' });
});

// Serve a pasta 'uploads' estaticamente na rota '/uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(PORT, () => {
  console.log(`🔥 Servidor executando na porta http://localhost:${PORT}`);
});