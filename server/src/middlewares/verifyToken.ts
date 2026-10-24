import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';

// Interface para estender o Request do Express e aceitar a propriedade 'user'
interface TokenPayload {
    id: number;
    email: string;
    role: 'admin' | 'cashier' | 'manager';
    iat: number;
    exp: number;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // 1. Pega o cabeçalho de autorização da requisição
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    // O formato esperado do header é: "Bearer SEU_TOKEN_AQUI"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no formato do token.' });
    }

    const [scheme, token] = parts;

    // Valida se a palavra "Bearer" está presente
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado.' });
    }

    // 2. Valida e decodifica o token JWT
    try {
        const secret = String(authConfig.jwt.secret);
        const decoded = jwt.verify(token, secret) as TokenPayload;

        // Injeta os dados do usuário na requisição para serem usados nos controllers
        (req as any).user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        return next(); // Token válido! Prossegue para a rota/controller

    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};