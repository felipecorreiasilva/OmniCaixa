import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
    id: number;                          // Compatível com MySQL Auto Increment
    name: string;                        // Nome completo do funcionário/usuário
    email: string;                       // E-mail usado para login
    password: string;                    // Senha (armazenada com hash criptografado)
    role: 'admin' | 'cashier' | 'manager'; // Nível de acesso essencial para o PDV
    image_url?: string | null;           // Foto de perfil (salva em uploads/users/ ou null)
    created_at?: string;                 // Data de criação do registro
    updated_at?: string;                 // Data da última atualização (opcional)
}

export const UserModel = {
    // Listar todos os usuários (sem expor a senha)
    async findAll(): Promise<Omit<User, 'password'>[]> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id, name, email, role, image_url, created_at, updated_at FROM users'
        );
        return rows as Omit<User, 'password'>[];
    },

    // Buscar usuário por ID (omitiendo a senha por segurança)
    async findById(id: number): Promise<Omit<User, 'password'> | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id, name, email, role, image_url, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );
        return rows.length > 0 ? (rows[0] as Omit<User, 'password'>) : null;
    },

    // Buscar por e-mail (ESSENCIAL PARA O LOGIN: aqui precisamos da senha para comparar o hash)
    async findByEmail(email: string): Promise<User | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows.length > 0 ? (rows[0] as User) : null;
    },

    // Criar um novo usuário / funcionário
    async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<Omit<User, 'password'>> {
        const { name, email, password, role, image_url } = userData;
        
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO users (name, email, password, role, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, role, image_url || null]
        );

        const newUserId = result.insertId;
        const createdUser = await this.findById(newUserId);
        
        if (!createdUser) {
            throw new Error('Erro ao criar usuário.');
        }

        return createdUser;
    },

    // Atualizar usuário existente (com suporte opcional a alteração de senha)
    async update(id: number, userData: { name?: string; email?: string; password?: string; role?: string; image_url?: string | null }) {
        const { name, email, password, role, image_url } = userData;

        // Se a senha foi enviada (já com hash), atualizamos também. Senão, mantemos a senha existente.
        if (password) {
            const [result] = await db.query<ResultSetHeader>(
                'UPDATE users SET name = ?, email = ?, password = ?, role = ?, image_url = ? WHERE id = ?',
                [name, email, password, role, image_url || null, id]
            );
            if (result.affectedRows === 0) return null;
        } else {
            const [result] = await db.query<ResultSetHeader>(
                'UPDATE users SET name = ?, email = ?, role = ?, image_url = ? WHERE id = ?',
                [name, email, role, image_url || null, id]
            );
            if (result.affectedRows === 0) return null;
        }

        return await this.findById(id);
    },

    // Deletar usuário
    async delete(id: number): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};