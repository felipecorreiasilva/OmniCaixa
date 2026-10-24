import { Request, Response, NextFunction } from 'express';

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    // O middleware anterior de JWT (verifyToken) deve ter injetado o usuário em req.user
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem executar esta ação.' });
    }

    return next(); // Se for admin, deixa passar para o controller!
};