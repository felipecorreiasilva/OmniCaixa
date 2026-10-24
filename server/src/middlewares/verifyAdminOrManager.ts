import { Request, Response, NextFunction } from 'express';

export const verifyAdminOrManager = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return res.status(403).json({ 
            error: 'Acesso negado. Apenas administradores e gerentes podem visualizar esta lista.' 
        });
    }

    return next();
};