# Investindo com Leilao

Sistema web para controlar investimentos em imoveis adquiridos em leilao, substituindo planilhas com abas por imovel. O MVP cobre cadastro de imoveis, custos, documentacao de compra e venda, investidores, vendas e calculos automaticos de lucro real e retorno.

## Funcionalidades

- Autenticacao com cadastro, login, JWT e senha com bcrypt.
- Dashboard com totais financeiros, imoveis vendidos, imoveis em andamento, top 5 por lucro e vendas pendentes.
- CRUD de imoveis.
- CRUD de investidores.
- Custos ilimitados por imovel, incluindo Documentacao Compra e Documentacao Venda por categoria.
- Multiplos investidores por imovel via `PropertyInvestor`.
- Calculos financeiros centralizados no backend.
- Exportacao CSV autenticada para levar os dados consolidados de volta para planilha.
- Docker Compose com PostgreSQL, backend e frontend.

## Stack

Backend: Node.js, TypeScript, Fastify, Prisma, PostgreSQL, Zod, JWT, bcrypt e CORS.
Frontend: React, Vite, TypeScript, TailwindCSS, componentes estilo Shadcn UI, Axios, React Router e Lucide React.
Banco: PostgreSQL.

## Estrutura

```txt
D:\ProjetoInvestir\investindo-com-leilao
  backend
  frontend
  docs
  docker-compose.yml
  README.md
  .gitignore
```

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3333
- Health: http://localhost:3333/health

## Usuario de teste

- Email: `pietro@teste.com`
- Senha: `123456`

## Rodar com Docker

```bash
cd D:\ProjetoInvestir\investindo-com-leilao
docker compose up --build
```

O compose sobe:

- PostgreSQL na porta `5432`
- Backend na porta `3333`
- Frontend na porta `5173`

O backend executa `prisma migrate deploy`, `prisma db seed` e inicia a API.

## Rodar sem Docker

Crie um PostgreSQL local com:

- Banco: `investindo_com_leilao`
- Usuario: `postgres`
- Senha: `postgres`
- Porta: `5432`

Configure os arquivos `.env` com base nos exemplos:

```bash
cd D:\ProjetoInvestir\investindo-com-leilao
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Instale dependencias e prepare o banco:

```bash
cd D:\ProjetoInvestir\investindo-com-leilao\backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Em outro terminal:

```bash
cd D:\ProjetoInvestir\investindo-com-leilao\frontend
npm install
npm run dev
```

## Scripts

Raiz:

```bash
npm run dev
npm run docker:up
npm run docker:down
```

Backend:

```bash
npm run dev
npm run build
npm run start
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Endpoints principais

Autenticacao:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Dashboard:

- `GET /dashboard/summary`

Imoveis:

- `GET /properties`
- `POST /properties`
- `GET /properties/:id`
- `PATCH /properties/:id`
- `DELETE /properties/:id`

Custos:

- `GET /properties/:propertyId/expenses`
- `POST /properties/:propertyId/expenses`
- `PATCH /expenses/:id`
- `DELETE /expenses/:id`

Investidores:

- `GET /investors`
- `POST /investors`
- `GET /investors/:id`
- `PATCH /investors/:id`
- `DELETE /investors/:id`

Investidores por imovel:

- `GET /properties/:propertyId/investors`
- `POST /properties/:propertyId/investors`
- `PATCH /property-investors/:id`
- `DELETE /property-investors/:id`

Exportacao:

- `GET /export/spreadsheet.csv`

## Git

```bash
cd D:\ProjetoInvestir\investindo-com-leilao
git init
git add .
git commit -m "feat: create investindo com leilao MVP"
```

## Criar repositorio no GitHub

Se a GitHub CLI estiver instalada e autenticada:

```bash
gh repo create investindo-com-leilao --private --source=. --remote=origin --push
```

Se a GitHub CLI nao estiver instalada ou autenticada, use manualmente:

```bash
git remote add origin https://github.com/Pietrocv/investindo-com-leilao.git
git branch -M main
git push -u origin main
```

## Observacoes de verificacao

Apos subir o projeto, acesse `/health`, faca login com o usuario de teste, confira o dashboard e teste cadastro de imovel, cadastro de investidor, vinculo de dois investidores ao mesmo imovel, lancamento de custo e calculos na pagina detalhada.
