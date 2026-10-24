import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';

export const AuthController = {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
            }

            // 1. O Model busca o usuário (incluindo a senha hashada)
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
            }

            // 2. A validação real da senha acontece AQUI (usando bcrypt)
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
            }

            // 3. Gerar o Token JWT utilizando a configuração centralizada
            const { secret, expiresIn } = authConfig.jwt;
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                secret,
                { expiresIn }
            );

            // 4. Retorna o token e os dados públicos do usuário (sem a senha!)
            return res.json({
                message: 'Login bem-sucedido!',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image_url: user.image_url
                }
            });

        } catch (error: any) {
            return res.status(500).json({ error: 'Erro no servidor ao realizar login: ' + error.message });
        }
    },

    async logout(req: Request, res: Response) {
        try {
            // Se estiver a usar Cookies HttpOnly para guardar o token:
            // res.clearCookie('token');

            return res.json({ 
                message: 'Logout realizado com sucesso pelo servidor.' 
            });
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao realizar logout: ' + error.message });
        }
    }
};