# Deploy e verificação

## Antes do deploy

```bash
npm ci
npx playwright install chromium
npm run verify
```

Essa sequência valida sintaxe, imports, assets, headers, invariantes de privacidade, testes nativos e cinco cenários end-to-end. A auditoria axe local exige zero violações; os testes responsivos cobrem desktop e mobile.

## Depois do deploy

```bash
npm run verify:production
```

Para outro ambiente:

```bash
LAB_URL=https://preview.example.com/ npm run verify:production
```

O verificador confirma a versão e disponibilidade dos assets, as diretivas essenciais de CSP e Permissions Policy, `nosniff`, além do status, payload e comportamento sem cache de `/api/client` e `/api/ping`.

## Auditoria visual pós-deploy

Executar Lighthouse e axe contra a URL publicada, não contra o servidor Python, porque headers e Pages Functions só existem na Cloudflare. Metas:

- Accessibility: 100;
- Best Practices: 100;
- SEO: 100;
- Performance: 95 ou mais;
- zero violações críticas ou sérias no axe;
- `/api/client` e `/api/ping` com `Cache-Control: no-store`;
- nenhuma conexão third-party durante o scan passivo.

Se a versão ainda não estiver publicada, `verify:production` deve falhar de forma explícita em vez de produzir um falso positivo.
