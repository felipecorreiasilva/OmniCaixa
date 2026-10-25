export interface User {
  id: number;                          // Compatível com MySQL Auto Increment
  name: string;                        // Nome completo do funcionário/usuário
  email: string;                       // E-mail usado para login
  role: 'admin' | 'cashier' | 'manager'; // Nível de acesso essencial para o PDV
  image_url?: string | null;           // Foto de perfil (salva em uploads/users/)
  created_at?: string;                 // Data de criação do registro
  updated_at?: string;                 // Data da última atualização
}