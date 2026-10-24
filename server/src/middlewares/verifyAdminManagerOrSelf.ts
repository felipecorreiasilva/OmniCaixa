import { Request, Response, NextFunction } from 'express';

export const verifyAdminManagerOrSelf = (req: Request, res: Response, next: NextFunction) => {
    const loggedUser = (req as any).user;
    const targetUserId = Number(req.params.id);

    if (!loggedUser) {
        return res.status(401).json({ error: 'Não autorizado.' });
    }

    // Se for admin ou manager, pode ver qualquer perfil
    if (loggedUser.role === 'admin' || loggedUser.role === 'manager') {
        return next();
    }

    // Se for um usuário comum, ele só pode ver o próprio perfil
    if (loggedUser.id === targetUserId) {
        return next();
    }

    return res.status(403).json({ 
        error: 'Acesso negado. Você só pode visualizar as informações da sua própria conta.' 
    });
};