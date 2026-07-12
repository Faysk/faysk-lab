# lab.faysk.dev

Laboratório de diagnóstico do navegador, com coleta passiva e transparência sobre os limites de cada sinal.

- Produção: https://lab.faysk.dev
- Repositório: https://github.com/Faysk/faysk-lab

## O que o projeto faz

O lab mostra o que uma página pode inferir ou consultar a partir do navegador atual:

- tela, viewport, densidade e refresh estimado;
- navegador, idioma, timezone e plataforma;
- CPU lógica e memória aproximada expostas pelo browser;
- WebGL/GPU, storage e bateria quando disponíveis;
- conectividade e latência HTTP;
- IP e região aproximada via endpoint first-party da Cloudflare;
- estados de permissões consultados sem abrir prompts;
- relatório sanitizado para suporte, com fallback de cópia manual.
- referências oficiais e limitações em cada sinal técnico;
- latência HTTP com mediana, p95 e jitter, preferindo uma Pages Function first-party.

O objetivo não é identificar pessoas nem prometer um diagnóstico de hardware. Os valores representam o que o navegador decide expor e podem ser aproximados, reduzidos ou indisponíveis.

## Princípios

- Passivo por padrão: câmera, microfone, geolocalização precisa, Bluetooth, USB, Serial e XR não são acionados.
- Sem fingerprint persistente: não é criado hash, identificador ou perfil salvo.
- Sem fallback de terceiros para IP: em desenvolvimento local, o IP fica indisponível porque a Pages Function não é executada.
- Exportação segura: o relatório omite IP, localização, user agent e renderer exato da GPU.
- Progressive disclosure: o snapshot principal vem primeiro; sinais técnicos ficam no catálogo filtrável.
- Sem framework, dependências de runtime ou build step.

## Stack

- HTML, CSS e JavaScript vanilla
- ES Modules
- Cloudflare Pages e Pages Functions
- Node.js para verificações estáticas e testes; Playwright/axe apenas como dependências de desenvolvimento
- CSP restritiva e headers de isolamento/security hardening

## Estrutura

```text
faysk-lab/
├── index.html
├── _headers
├── site.webmanifest
├── functions/
│   └── api/client.js
├── assets/
│   ├── css/
│   ├── icons/
│   ├── img/
│   └── js/
│       ├── app.js
│       ├── config.js
│       ├── constants.js
│       ├── state.js
│       ├── core/
│       ├── modules/
│       └── ui/
├── docs/
├── tests/
└── package.json
```

O bootstrap está em `assets/js/app.js`. Os coletores são agregados por `assets/js/modules/index.js`; o snapshot assíncrono está em `assets/js/modules/live/diagnostics.js`; a composição visual está em `assets/js/ui/ui.js`.

## Executar localmente

```bash
npm install
npm run serve
```

Acesse `http://127.0.0.1:4173/`.

O servidor local implementa o ping sem cache usado pela medição de latência, mas não simula metadados Cloudflare. Por isso, IP, ASN e região aparecem como indisponíveis. Para testar `functions/api/client.js` integrado à plataforma, use o ambiente de desenvolvimento da Cloudflare Pages.

## Testes

```bash
npm test
npm run check
npm run test:e2e
npm run verify
```

`npm test` executa os testes nativos. `npm run check` também valida sintaxe, imports, assets, headers e invariantes de privacidade. `npm run test:e2e` cobre scan, catálogo, filtros, responsividade e acessibilidade com axe. `npm run verify` executa toda a suíte usada no GitHub Actions.

O preview social usa `assets/img/og-card.svg` como fonte editável. Depois de alterá-lo, regenere o PNG publicado com `npm run build:og`.

## Estados da interface

- `ready`: o sinal foi coletado ou a API está utilizável no contexto atual;
- `gated`: a API existe, mas permanece bloqueada por design e exigiria ação explícita;
- `unavailable`: a fonte existe no produto, mas não respondeu neste ambiente;
- `unsupported`: o navegador ou contexto não oferece a API.

## Limitações importantes

- `navigator.deviceMemory` é uma estimativa arredondada e limitada pelo navegador.
- `navigator.hardwareConcurrency` pode reportar menos processadores lógicos que o sistema possui.
- Network Information API tem suporte limitado e seus números são estimativas.
- O refresh é inferido com `requestAnimationFrame`; abas ocultas e carga da página afetam a leitura.
- Storage quota não representa a capacidade física do disco.
- IP geolocation é aproximada e pode refletir VPN, proxy ou saída corporativa.

## Documentação

- [Revisão de produto](docs/review.md)
- [Arquitetura e módulos](docs/modules.md)
- [Roadmap](docs/roadmap.md)
- [Ideias avaliadas](docs/ideas.md)
- [Deploy e verificação](docs/deployment.md)

## Licença

MIT. Consulte [LICENSE](LICENSE).
