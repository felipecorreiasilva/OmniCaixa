import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const authRoutes = Router();

// Rota de login (chama o método login do AuthController)
authRoutes.post('/auth/login', AuthController.login);

// Rota de logout (chama o método logout do AuthController)
authRoutes.post('/auth/logout', AuthController.logout);

export default authRoutes;