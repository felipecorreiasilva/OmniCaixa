import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Cria um pool de conexões com o MySQL usando variáveis de ambiente
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'omnicaixa',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa a conexão ao iniciar o servidor
pool.getConnection()
  .then((connection) => {
    console.log('📦 Conexão com o banco de dados MySQL estabelecida com sucesso!');
    connection.release(); // Libera a conexão de volta para o pool
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar com o banco de dados MySQL:', err.message);
  });

export default pool;