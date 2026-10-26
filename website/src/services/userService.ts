import { api } from "./api";
import { User } from "@/types/user";

export const userService = {
  // GET /users - Listar todos os funcionários
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  // GET /users/:id - Buscar funcionário por ID (ou próprio perfil)
  async getUserById(id: number | string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // POST /users - Cadastrar novo funcionário
  async createUser(data: Partial<User> | FormData): Promise<User> {
      const response = await api.post<User>("/users", data, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });
      return response.data;
  },

  // Altera para isto:
  async updateUser(id: number | string, data: Partial<User> | FormData): Promise<User> {
      const response = await api.put<User>(`/users/${id}`, data, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });
      return response.data;
  },

  // DELETE /users/:id - Deletar funcionário
  async deleteUser(id: number | string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};