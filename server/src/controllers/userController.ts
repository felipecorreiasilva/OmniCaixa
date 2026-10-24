import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import bcrypt from 'bcrypt';

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
            const loggedUser = (req as any).user; // Dados de quem está fazendo a requisição
            const { name, email, role, image_url } = req.body;

            const targetUserId = Number(id);

            // Regra de segurança para o Role:
            let finalRole = role;

            // Se o usuário logado NÃO for admin, ele não tem permissão para alterar cargos
            if (loggedUser.role !== 'admin') {
                // Buscamos o usuário no banco para manter o role original dele intocado
                const currentUser = await UserModel.findById(targetUserId);
                if (!currentUser) {
                    return res.status(404).json({ error: 'Usuário não encontrado.' });
                }
                finalRole = currentUser.role; // Mantém o cargo antigo, ignorando o que veio no body
            }

            // Executa a atualização no banco de dados
            const updatedUser = await UserModel.update(targetUserId, {
                name,
                email,
                role: finalRole,
                image_url
            });

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

            // Evitar que o admin delete a si mesmo por acidente (opcional, mas recomendado)
            // (req as any).user contém os dados do usuário logado vindos do token JWT
            const loggedUserId = (req as any).user?.id;
            if (loggedUserId === Number(id)) {
                return res.status(400).json({ error: 'Você não pode excluir sua própria conta de administrador.' });
            }

            const deleted = await UserModel.delete(Number(id));

            if (!deleted) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            return res.json({ message: 'Funcionário excluído com sucesso!' });

        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao deletar usuário: ' + error.message });
        }
    }
};