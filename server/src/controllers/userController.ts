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
            const avatarFile = req.file;

            // 🔒 SEGURANÇA: Se o usuário NÃO for admin nem gerente, 
            // ele só pode atualizar a sua própria conta!
            if (loggedUser.role !== 'admin' && loggedUser.role !== 'manager') {
                if (loggedUser.id !== targetUserId) {
                    if (avatarFile) {
                        fs.unlink(avatarFile.path, () => {});
                    }
                    return res.status(403).json({ 
                        error: 'Acesso negado. Você só pode atualizar o seu próprio perfil.' 
                    });
                }
            }

            // 1. Buscar o utilizador atual na base de dados para obter o avatar antigo e validar a existência
            const existingUser = await UserModel.findById(targetUserId);
            if (!existingUser) {
                if (avatarFile) {
                    fs.unlink(avatarFile.path, () => {});
                }
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const { name, email, role, password } = req.body;
            let finalRole = role;

            // Regra para impedir que não-admins mudem cargos
            if (loggedUser.role !== 'admin') {
                finalRole = existingUser.role; 
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

            // 2. Se um novo ficheiro foi enviado, define o caminho relativo limpo
            if (avatarFile) {
                updateData.image_url = `/uploads/users/${avatarFile.filename}`; 
            }

            // 3. Atualiza na base de dados
            const updatedUser = await UserModel.update(targetUserId, updateData);
            
            if (!updatedUser) {
                if (avatarFile) {
                    fs.unlink(avatarFile.path, () => {});
                }
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // 4. Se o utilizador atualizou com um NOVO avatar e já tinha um avatar antigo, apaga o ficheiro do disco
            if (avatarFile && existingUser.image_url) {
                try {
                    // Como já guardamos em caminho relativo, combinamos diretamente com o diretório raiz
                    const oldAvatarPath = path.join(__dirname, '..', '..', existingUser.image_url);

                    if (fs.existsSync(oldAvatarPath)) {
                        fs.unlink(oldAvatarPath, (err) => {
                            if (err) console.error('Erro ao apagar o avatar antigo do disco:', err);
                            else console.log('Avatar antigo apagado com sucesso:', oldAvatarPath);
                        });
                    }
                } catch (unlinkError) {
                    console.error('Erro ao processar o caminho do avatar antigo para exclusão:', unlinkError);
                }
            }

            return res.json({
                message: 'Perfil atualizado com sucesso!',
                user: updatedUser
            });

        } catch (error: any) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
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

            // 1. Buscar o usuário antes de apagar para obter o caminho relativo do avatar
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
                    // Como já guardamos em caminho relativo, combinamos diretamente com o diretório raiz
                    const filePath = path.join(__dirname, '..', '..', user.image_url);

                    if (fs.existsSync(filePath)) {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error('Erro ao apagar o avatar do disco:', err);
                            else console.log('Avatar físico apagado com sucesso:', filePath);
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