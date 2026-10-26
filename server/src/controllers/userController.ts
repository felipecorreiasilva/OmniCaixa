import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

export const UserController = {
    
    // Listar todos os usuários (sem expor a senha)
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserModel.findAll();
            return res.json(users);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar usuários: ' + error.message });
        }
    },

    // Buscar um usuário específico pelo ID
    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Chama o model passando o ID convertido para número
            const user = await UserModel.findById(Number(id));

            if (!user) {
                return res.status(404).json({ error: 'Funcionário/Usuário não encontrado.' });
            }

            return res.json(user); // Retorna os dados (já sem a senha, pois o model omitiu)

        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar usuário: ' + error.message });
        }
    },
    
    // Criar / Registrar um novo funcionário
    async createUser(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password || !role) {
                return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
            }

            // 1. Verifica se já existe um usuário com esse e-mail
            const userExists = await UserModel.findByEmail(email);
            if (userExists) {
                return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
            }

            // 2. Criptografa a senha antes de salvar no banco
            const hashedPassword = await bcrypt.hash(password, 8);

            // 3. Pega o caminho da foto de perfil se foi enviada via Multer
            const image_url = req.file ? req.file.filename : undefined;

            // 4. Salva no banco através do Model
            const newUser = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                role,
                image_url
            });

            return res.status(201).json({
                message: 'Usuário cadastrado com sucesso!',
                user: newUser
            });

        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao cadastrar usuário: ' + error.message });
        }
    },

    // Atualizar os dados de um usuário existente
    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const loggedUser = (req as any).user; 
            const targetUserId = Number(id);

            // 🔒 SEGURANÇA: Se o usuário NÃO for admin nem gerente, 
            // ele só pode atualizar a sua própria conta!
            if (loggedUser.role !== 'admin' && loggedUser.role !== 'manager') {
                if (loggedUser.id !== targetUserId) {
                    return res.status(403).json({ 
                        error: 'Acesso negado. Você só pode atualizar o seu próprio perfil.' 
                    });
                }
            }

            const { name, email, role, password } = req.body;
            const avatarFile = req.file;

            let finalRole = role;

            // Regra para impedir que não-admins mudem cargos
            if (loggedUser.role !== 'admin') {
                const currentUser = await UserModel.findById(targetUserId);
                if (!currentUser) {
                    return res.status(404).json({ error: 'Usuário não encontrado.' });
                }
                finalRole = currentUser.role; 
            }

            const updateData: any = {
                name,
                email,
                role: finalRole,
            };

            if (password && password.trim() !== '') {
                const saltRounds = 10;
                updateData.password = await bcrypt.hash(password, saltRounds);
            }

            if (avatarFile) {
                updateData.image_url = `/uploads/users/${avatarFile.filename}`; 
            }

            const updatedUser = await UserModel.update(targetUserId, updateData);

            if (!updatedUser) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            return res.json({
                message: 'Perfil atualizado com sucesso!',
                user: updatedUser
            });

        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
        }
    },

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Evitar que o admin delete a si mesmo por acidente
            const loggedUserId = (req as any).user?.id;
            if (loggedUserId === Number(id)) {
                return res.status(400).json({ error: 'Você não pode excluir sua própria conta de administrador.' });
            }

            // 1. Buscar o usuário antes de apagar para obter o caminho do avatar antigo
            const user = await UserModel.findById(Number(id));

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // 2. Apagar o registo da base de dados
            const deleted = await UserModel.delete(Number(id));

            if (!deleted) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // 3. Apagar o ficheiro físico do avatar do disco (se existir)
            if (user.image_url) {
                try {
                    let relativePath = user.image_url;
                    
                    // Se for uma URL completa, extraímos apenas o pathname (/uploads/users/...)
                    if (user.image_url.startsWith('http')) {
                        const parsedUrl = new URL(user.image_url);
                        relativePath = parsedUrl.pathname;
                    }

                    // Combina com o diretório raiz do backend a partir da pasta controllers
                    const filePath = path.join(__dirname, '..', '..', relativePath);

                    if (fs.existsSync(filePath)) {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error('Erro ao apagar o avatar do disco:', err);
                        });
                    }
                } catch (fileErr) {
                    console.error('Erro ao processar o caminho do avatar para exclusão:', fileErr);
                }
            }

            return res.json({ message: 'Funcionário excluído com sucesso!' });

        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao deletar usuário: ' + error.message });
        }
    }
};