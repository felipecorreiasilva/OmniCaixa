export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'default_fallback_secret',
    expiresIn: '8h' as const, // O 'as const' diz ao TypeScript que é uma string literal exata
  },
};