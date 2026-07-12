# Arquitetura e módulos

## Fluxo

```text
index.html
  -> assets/js/app.js
    -> ui/ui.js monta a interface
    -> modules/index.js coleta sinais síncronos
    -> modules/live/diagnostics.js atualiza sinais assíncronos
    -> core/report.js gera exportação sanitizada local
    -> state.js aciona filtros, busca e re-renderização
```

## Camadas

### Core

- `dom.js`: criação e consulta de elementos;
- `logger.js`: eventos exibidos no log recolhível;
- `report.js`: relatório seguro, serialização e cópia resiliente;
- `utils.js`: formatação e leitura segura.

### UI

- `ui.js`: shell, snapshot, catálogo e sincronização;
- `cards.js`: cartão técnico e estados;
- `sidebar.js` e `search.js`: descoberta dos sinais;
- `terminal.js`: log local recolhível;
- `modules/guidance.js`: referências oficiais e limitações por sinal.

### Coletores

- `browser`: runtime, idiomas e estados read-only da Permissions API;
- `system`: tela, hardware exposto, heap, bateria, storage e toque;
- `gpu`: WebGL e Canvas;
- `fingerprint`: superfície de privacidade, áudio e fontes, sem gerar identificador;
- `network`: conexão, IP first-party, WebRTC e latência;
- `geolocation`: suporte, timezone e locale;
- `media`: suporte consolidado a captura;
- `telemetry`: performance, refresh, timing e sensores;
- `security`: cookies, Web Storage, HTTPS e CSP;
- `experimental`: Bluetooth, USB, Serial, Gamepad e XR.

`functions/api/ping.js` oferece um alvo first-party sem cache para latência. Em desenvolvimento estático, o coletor detecta a ausência da Function e usa um asset local como fallback.

## Contrato de um coletor

Cada coletor retorna um objeto sem alterar o DOM:

```js
{
  id: "group-signal",
  group: "group",
  groupLabel: "Group",
  title: "Signal",
  status: "available",
  description: "What this value means.",
  items: [{ label: "Value", value: "example" }]
}
```

Coletores sensíveis devem verificar apenas suporte. Nenhum deles pode abrir prompt no boot ou no scan passivo.

## Relatório seguro

O relatório é montado a partir de um allowlist. Ele inclui plataforma, idioma, timezone, medidas aproximadas e estados de capacidade, mas nunca inclui IP, localização, user agent ou renderer exato da GPU. Quando o clipboard é bloqueado, o conteúdo abre em um diálogo selecionável.

Os testes em `tests/report.test.js` verificam que valores identificáveis não atravessam essa fronteira.

## Qualidade e segurança

`npm run check` valida sintaxe, imports relativos, assets do HTML, headers mínimos e padrões proibidos de coleta sensível antes de executar os testes nativos. `npm run test:e2e` valida o fluxo real em Chromium, incluindo scan, filtros, ausência de requests third-party, desktop, mobile e axe. `npm run verify` executa as duas camadas; `.github/workflows/quality.yml` aplica a mesma verificação em pushes e pull requests e guarda traces/screenshots quando há falha.

A política CSP usa same-origin como padrão e bloqueia plugins, forms, workers e media. A Cloudflare aplica a versão por header; o HTML mantém uma política meta restritiva como fallback.

## Regras de manutenção

1. Não criar um arquivo para uma funcionalidade ainda inexistente.
2. Não duplicar um mesmo sinal em módulos diferentes sem uma razão de UX.
3. Diferenciar suporte, coleta concluída e ação bloqueada.
4. Explicar quando o dado é estimado, first-party ou dependente de backend.
5. Preferir um coletor consolidado a vários cartões que repetem a mesma API.
