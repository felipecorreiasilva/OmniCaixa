export interface DecodedUser {
  id: number;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  iat: number;
  exp: number;
}

export const tokenService = {
  // Decodifica e retorna todo o payload guardado no token JWT
  decodeToken(token: string): DecodedUser | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as DecodedUser;
    } catch (err) {
      console.error("Erro ao decodificar o token JWT:", err);
      return null;
    }
  },

  // Atalho se precisares apenas do ID
  getUserIdFromToken(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.id : null;
  }
};