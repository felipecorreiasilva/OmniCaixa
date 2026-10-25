USE omnicaixa;

-- Inserção de Usuários de Teste (Senha padrão para todos: '123456')
-- O hash abaixo corresponde à senha '123456' gerada com bcrypt (custo 8 ou 10)
INSERT INTO users (name, email, password, role, image_url) VALUES 
('Administrador Master', 'admin@omnicaixa.com', '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 'admin', 'http://localhost:3333/uploads/users/admin.jpg'),
('Gerente Loja', 'manager@omnicaixa.com', '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 'manager', 'http://localhost:3333/uploads/users/manager.jpg'),
('Caixa 01', 'cashier@omnicaixa.com', '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 'cashier', 'http://localhost:3333/uploads/users/cashier.jpg');

-- Inserção de Produtos
INSERT INTO products (name, price, stock, category, image_url) VALUES 
('Coca-Cola 2L', 10.00, 50, 'Bebidas', 'http://localhost:3333/uploads/products/coca-cola.jpg'),
('Pão Francês (kg)', 18.50, 100, 'Padaria', 'http://localhost:3333/uploads/products/pao-frances.jpg'),
('Café Pilão 500g', 16.90, 30, 'Mercearia', 'http://localhost:3333/uploads/products/cafe-pilao.jpg'),
('Água Mineral 500ml', 3.50, 80, 'Bebidas', 'http://localhost:3333/uploads/products/agua-mineral.jpg'),
('Leite Integral 1L', 5.80, 40, 'Laticínios', 'http://localhost:3333/uploads/products/leite-integral.jpg'),
('Queijo Mussarela (kg)', 45.00, 15, 'Laticínios', 'http://localhost:3333/uploads/products/queijo-mussarela.jpg'),
('Sabão em Pó 1kg', 12.90, 25, 'Limpeza', 'http://localhost:3333/uploads/products/sabao-po.jpg'),
('Chocolate Barra 90g', 6.50, 60, 'Bomboniere', 'http://localhost:3333/uploads/products/chocolate.jpg');