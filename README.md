# Kodon Amazon Taiko

Site do grupo de taiko Kodon Amazon Taiko (Belém, PA): páginas institucionais em
português e japonês, loja e base para a área de alunos e instrutores.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) com React 19 e TypeScript estrito
- Tailwind CSS 3 e framer-motion
- [next-intl](https://next-intl.dev) para os idiomas (pt padrão, ja em `/ja`)
- Postgres com [Drizzle ORM](https://orm.drizzle.team)
- Vitest (unidade) e Playwright com axe (fluxos e acessibilidade)
- Biome (lint e formatação)

## Requisitos

- Node.js 24 (`.nvmrc`; o mínimo aceito é 22.12)
- npm
- Docker, para o Postgres local

## Como rodar

```bash
npm install
cp .env.example .env.local
npm run db:up        # sobe o Postgres local (docker compose)
npm run db:migrate   # aplica as migrations
npm run dev          # http://localhost:3000
```

O banco local não tem senha e só aceita conexões da própria máquina. Se a porta
5432 já estiver em uso, suba com outra (`POSTGRES_PORT=5433 npm run db:up`) e
ajuste `DATABASE_URL` no `.env.local`.

## Scripts

| Script                | O que faz                                                   |
| --------------------- | ----------------------------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento                                 |
| `npm run build`       | Build de produção                                           |
| `npm run start`       | Serve o build de produção                                   |
| `npm run lint`        | Biome: lint, formatação e ordem dos imports                 |
| `npm run format`      | Aplica as correções automáticas do Biome                    |
| `npm run typecheck`   | Gera os tipos de rota do Next e roda o `tsc`                |
| `npm test`            | Testes de unidade (Vitest)                                  |
| `npm run test:e2e`    | Fluxos no navegador (Playwright) contra o build de produção |
| `npm run db:up`       | Sobe o Postgres local                                       |
| `npm run db:down`     | Para o Postgres local                                       |
| `npm run db:generate` | Gera uma migration a partir das mudanças no schema          |
| `npm run db:migrate`  | Aplica as migrations pendentes                              |
| `npm run db:studio`   | Abre o Drizzle Studio                                       |

## Variáveis de ambiente

Declaradas e validadas com zod em `src/env.ts`. Valor ausente ou inválido derruba
o build e a inicialização com uma mensagem dizendo qual variável falhou.

| Variável               | Onde     | Descrição                                                                                                                                  |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | cliente  | URL pública do site, sem barra final. Base de canonical, sitemap e Open Graph. Entra no bundle no build: mudar o domínio exige novo build. |
| `DATABASE_URL`         | servidor | String de conexão do Postgres.                                                                                                             |

Para acrescentar uma variável: declare em `src/env.ts`, documente em
`.env.example` e leia sempre de `env`, nunca de `process.env`.

## Estrutura

```
src/
  app/
    [locale]/            layout raiz (html, fontes, provedores), 404 e erro
      (site)/            páginas públicas, com cabeçalho e rodapé
        page.tsx         página inicial
        loja/page.tsx    loja
    api/health/          verificação de saúde (aplicação + banco)
    robots.ts, sitemap.ts
  components/            componentes de interface (ui/ tem as peças genéricas)
  db/                    conexão, schema e banco de teste
  i18n/                  rotas, navegação e textos (locales/pt.json, ja.json)
  lib/                   utilitários (seo, security/csp)
    notacao/             motor das fichas de taiko (ver docs/notacao.md)
  env.ts                 variáveis de ambiente validadas
  proxy.ts               idioma da requisição e Content-Security-Policy
drizzle/                 migrations geradas
e2e/                     testes Playwright
```

Convenções que o restante do projeto precisa seguir:

- **Páginas ficam em `src/app/[locale]/`.** O proxy reescreve toda rota de página
  para o idioma certo. Rotas de API ficam em `src/app/api/` e não passam por ele.
- **Links internos usam `Link` de `@/i18n/navigation`**, que mantém o idioma.
- **Todo texto visível vai nos dois arquivos de `src/i18n/locales/`**, com as
  mesmas chaves. Um teste falha se os dois divergirem.
- **Nenhuma página é pré-renderizada no build.** A CSP usa um nonce por
  requisição, o que exige renderização no servidor a cada acesso.
- **Rota pública nova entra em `src/app/sitemap.ts`** e usa `pageMetadata` de
  `src/lib/seo.ts` para canonical, hreflang e Open Graph.

## Banco de dados

- As tabelas de cada domínio ficam em um arquivo próprio (por exemplo
  `src/db/schema/auth.ts`) e são reexportadas em `src/db/schema.ts`.
- Depois de mudar o schema: `npm run db:generate` cria a migration em `drizzle/`
  e `npm run db:migrate` aplica. As migrations são versionadas.
- Se duas branches gerarem migrations em paralelo, o `drizzle/meta` entra em
  conflito. Ao integrar, descarte a sua migration, traga a da outra branch e
  gere a sua de novo.
- Testes que precisam de banco usam `createTestDatabase()` de
  `src/db/testing.ts`: um Postgres em memória (PGlite) com todas as migrations
  aplicadas, sem container. Funções que recebem o tipo `Database` de `@/db`
  aceitam tanto esse banco quanto o real.

## Testes

```bash
npm test             # unidade, não precisa de banco nem de navegador
npx playwright install chromium   # uma vez por máquina
npm run test:e2e     # precisa do Postgres no ar e migrado
```

Os testes de fluxo fazem o build de produção, sobem o servidor na porta 3210
(`E2E_PORT` muda) e cobrem: página inicial em pt e ja, troca de idioma, loja e
carrinho, 404, cabeçalhos de segurança, CSP, sitemap, verificação de saúde e
acessibilidade (axe, WCAG 2.1 AA).

## Segurança

- Cabeçalhos fixos (HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, COOP) em `next.config.ts`.
- Content-Security-Policy com nonce por requisição em `src/proxy.ts`. Para liberar
  uma origem nova (CDN de imagens, API externa), edite `src/lib/security/csp.ts`.
  Imagens remotas servidas por `next/image` também precisam do host em
  `images.remotePatterns` no `next.config.ts`.
- O HSTS usa `includeSubDomains`: todo subdomínio do domínio de produção precisa
  atender em HTTPS.

## Deploy

A aplicação é um servidor Next.js comum e precisa de duas coisas: um Postgres e
as variáveis de ambiente acima.

### Vercel

1. Importe o repositório na Vercel. O framework é detectado sozinho.
2. Crie um Postgres (Neon pelo Marketplace da Vercel, Supabase ou outro) e copie
   a string de conexão.
3. Em Settings > Environment Variables, defina `NEXT_PUBLIC_SITE_URL` (domínio
   final, com `https://`) e `DATABASE_URL`.
4. Em Settings > Build and Deployment, use como Build Command
   `npm run db:migrate && npm run build`, para aplicar as migrations a cada deploy.
5. Aponte o domínio e confira `https://seu-dominio/api/health`.

Deploys de Preview rodam o mesmo comando de build. Dê a eles um banco próprio
(uma branch do Neon, por exemplo) definindo `DATABASE_URL` só para o ambiente
Preview, senão uma branch em teste migra o banco de produção.

### Outro host

Em qualquer ambiente com Node.js, atrás de um proxy com HTTPS:

```bash
npm ci
npm run build
npm run db:migrate
npm run start        # porta 3000; mude com PORT=8080
```

`/api/health` responde 200 quando a aplicação e o banco estão no ar, e 503 caso
contrário.

## CI

O GitHub Actions (`.github/workflows/ci.yml`) roda em todo pull request e na
`main`: lint, typecheck, testes de unidade e build em um job; migrations e
testes de fluxo, com um Postgres de serviço, em outro.
