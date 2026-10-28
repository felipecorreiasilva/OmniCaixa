USE omnicaixa;

-- Inserção de Usuários de Teste (Senha padrão para todos: '12345678')
-- O hash abaixo corresponde à senha '12345678' gerada com bcrypt (custo 8 ou 10)
INSERT INTO users (name, email, password, role, image_url) VALUES 
('Administrador Master', 'admin@omnicaixa.com', '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 'admin', 'http://localhost:3333/uploads/users/admin.jpg'),
('Gerente Loja', 'manager@omnicaixa.com', '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 'manager', 'http://localhost:3333/uploads/users/manager.jpg'),
('Caixa 01', 'cashier@omnicaixa.com', '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 'cashier', 'http://localhost:3333/uploads/users/cashier.jpg');

-- Inserção de Produtos com suporte a código de barras
INSERT INTO products (barcode, name, price, stock, category, image_url) VALUES 
('7894900011517', 'Coca-Cola 2L', 10.00, 50, 'Bebidas', '/uploads/products/coca-cola.jpg'),
(NULL, 'Pão Francês (kg)', 18.50, 100, 'Padaria', '/uploads/products/pao-frances.jpg'), -- Exemplo sem código de barras (pesado na balança)
('7891000100103', 'Café Pilão 500g', 16.90, 30, 'Mercearia', '/uploads/products/cafe-pilao.jpg'),
('7896004701235', 'Água Mineral 500ml', 3.50, 80, 'Bebidas', '/uploads/products/agua-mineral.jpg'),
('7891024101238', 'Leite Integral 1L', 5.80, 40, 'Laticínios', '/uploads/products/leite-integral.jpg'),
(NULL, 'Queijo Mussarela (kg)', 45.00, 15, 'Laticínios', '/uploads/products/queijo-mussarela.jpg'),
('7891035001232', 'Sabão em Pó 1kg', 12.90, 25, 'Limpeza', '/uploads/products/sabao-po.jpg'),
('7891055001239', 'Chocolate Barra 90g', 6.50, 60, 'Bomboniere', '/uploads/products/chocolate.jpg');