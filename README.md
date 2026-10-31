# 🛒 OmniCaixa

Sistema completo de Frente de Caixa (PDV) e Gestão de Estoque, desenvolvido em arquitetura multi-plataforma (Web, Mobile, Desktop e Servidor Backend).

## 📂 Estrutura do Projeto

O repositório está organizado nas seguintes pastas principais:
* **`server/`**: Servidor backend desenvolvido com **Node.js** e **Express**, responsável pelas APIs, autenticação, regras de negócio e integração com a base de dados.
* **`website/`**: Aplicação web desenvolvida com **Next.js**, destinada à gestão administrativa e painel web.
* **`mobile/`**: Aplicação mobile desenvolvida com **Expo** e **React Native**, garantindo paridade funcional para operações em dispositivos móveis.
* **`desktop/`**: Aplicação para ambiente desktop construída com **Electron.js**.

## 🚀 Tecnologias Utilizadas

* **Backend**: Node.js, Express, MySQL / MySQL2
* **Web**: Next.js, React, Tailwind CSS
* **Mobile**: Expo, React Native, NativeWind, TypeScript
* **Desktop**: Electron.js
* **Ferramentas**: Expo Image Picker, Lucide Icons

## ✨ Funcionalidades Principais

* **Frente de Caixa (PDV)**: Carrinho de compras, suporte a produtos por unidade ou peso (kg) e múltiplas formas de pagamento (Dinheiro com cálculo de troco, Cartão e Pix).
* **Gestão de Estoque e Produtos**: Listagem, pesquisa em tempo real, cadastro, edição e exclusão de itens com suporte a upload de imagens.
* **Controle de Acessos (RBAC)**: Proteção de rotas e permissões baseadas em cargos (`admin`, `manager`, `cashier`).

## ⚙️ Pré-requisitos

Certifica-te de que tens instalado no teu computador:
* **Node.js** (versão LTS recomendada)
* **npm** ou **yarn**

## 📥 Instalação e Execução

1. Clona o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd <nome-da-pasta>