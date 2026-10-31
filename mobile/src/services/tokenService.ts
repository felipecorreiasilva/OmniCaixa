export interface DecodedUser {
  id: number;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  iat: number;
  exp: number;
}

export const tokenService = {
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

  // Método para verificar se o token é válido e não expirou
  isTokenValid(token: string | null): boolean {
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const currentTime = Date.now() / 1000;
    if (currentTime > decoded.exp) {
      return false; // Expirou
    }

    return true;
  },

  getUserIdFromToken(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.id : null;
  }
};