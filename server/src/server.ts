import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ message: '🚀 Servidor do PDV rodando com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`🔥 Servidor executando na porta http://localhost:${PORT}`);
});