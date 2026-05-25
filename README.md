# lab.faysk.dev

Browser diagnostics lab do ecossistema Faysk.

Site em producao:

```txt
https://lab.faysk.dev
```

Repositorio:

```txt
https://github.com/Faysk/faysk-lab
```

## Visao

O `lab.faysk.dev` e um laboratorio visual para entender o que um browser consegue reportar sobre o ambiente em que esta rodando.

Ele e propositalmente:

- privacy-aware;
- passivo por padrao;
- sem prompts invasivos automaticos;
- focado em browser APIs reais;
- estatico sempre que possivel;
- serverless apenas quando melhora a fidelidade dos dados.

O objetivo nao e rastrear pessoas. O objetivo e estudar sinais do browser, limites de privacidade, telemetria visual e interfaces tecnicas bonitas.

## Estado Atual

O lab hoje renderiza:

- hero com visual de radar;
- painel "Live overview" com informacoes principais;
- overlay de refresh, latencia e RAM estimada;
- sidebar de categorias;
- grid avancado de modulos;
- busca por sinais;
- terminal visual com logs de boot e scan;
- Cloudflare Pages Function para IP e metadados de borda;
- fallback externo para IP quando roda localmente.

## Stack

- HTML5
- CSS3 modular
- JavaScript vanilla
- ES Modules
- Cloudflare Pages
- Cloudflare Pages Functions
- Sem framework
- Sem build step
- Sem dependencias de runtime

## Arquitetura

```txt
faysk-lab/
├── index.html
├── README.md
├── _headers
├── site.webmanifest
├── functions/
│   └── api/
│       └── client.js
├── assets/
│   ├── css/
│   │   ├── variables.css
│   │   ├── animations.css
│   │   ├── style.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── responsive.css
│   │   └── terminal.css
│   ├── js/
│   │   ├── app.js
│   │   ├── config.js
│   │   ├── constants.js
│   │   ├── state.js
│   │   ├── core/
│   │   ├── ui/
│   │   ├── modules/
│   │   │   ├── browser/
│   │   │   ├── experimental/
│   │   │   ├── fingerprint/
│   │   │   ├── geolocation/
│   │   │   ├── gpu/
│   │   │   ├── live/
│   │   │   ├── media/
│   │   │   ├── network/
│   │   │   ├── security/
│   │   │   ├── sensors/
│   │   │   ├── system/
│   │   │   └── telemetry/
│   │   └── workers/
│   ├── icons/
│   └── img/
└── docs/
```

## Como a Aplicacao Inicializa

O `index.html` contem apenas metadados, links de CSS e o ponto de montagem:

```html
<div id="app"></div>
<script type="module" src="./assets/js/app.js"></script>
```

O fluxo principal e:

```txt
assets/js/app.js
  -> inicializa estado/config
  -> chama ui/initUI
  -> renderiza shell completa
  -> coleta modulos passivos
  -> inicia live diagnostics
```

Os coletores avancados sao agregados em:

```txt
assets/js/modules/index.js
```

A camada de dados ao vivo fica em:

```txt
assets/js/modules/live/diagnostics.js
```

## Principio de Privacidade

O lab nao deve disparar automaticamente APIs que abrem prompt de permissao.

Nao pedir automaticamente:

- camera;
- microfone;
- geolocation;
- Bluetooth;
- USB;
- Serial;
- MIDI;
- arquivos locais.

Esses modulos devem reportar apenas disponibilidade/suporte ate existir uma acao explicita do usuario.

## Live Overview

O painel principal prioriza sinais que sao interessantes de cara:

- refresh rate do display;
- IP publico e localizacao aproximada;
- latencia;
- CPU threads;
- RAM estimada pelo browser;
- GPU/WebGL renderer;
- storage quota do browser;
- tela, viewport, DPR e color depth;
- idioma e timezone;
- bateria quando suportado.

## Como Cada Informacao E Capturada

### Display Refresh / Hz

Arquivo:

```txt
assets/js/modules/live/diagnostics.js
```

Metodo atual:

- cria um iframe minimo e visivel quase transparente como probe;
- pausa efeitos pesados da interface durante a amostragem;
- usa `requestAnimationFrame` dentro desse probe;
- mede os intervalos com `performance.now()`;
- analisa as amostras por histograma de frame time;
- escolhe a maior taxa comum com suporte suficiente;
- tambem exibe render cadence, suporte, frame time e jitter.

Por que isso funciona:

- em abas visiveis, `requestAnimationFrame` normalmente acompanha a taxa de atualizacao do display;
- e o mesmo principio usado por testes visuais como TestUFO.

Limitacoes:

- se a aba estiver oculta, o browser pode pausar rAF;
- em headless, iframe oculto, economia de energia ou aba em segundo plano, rAF pode nao disparar corretamente;
- em setups multi-monitor, o resultado depende do monitor onde a janela esta;
- se o browser estiver limitado a 60Hz, o lab tambem medira 60Hz;
- se a pagina estiver pesada, a render cadence pode cair abaixo do teto real do monitor.

Melhor forma possivel no browser:

- manter a medicao via rAF com amostras suficientes;
- rodar somente com a aba visivel;
- usar uma superficie de medicao leve;
- mostrar confianca, amostras, frame time, suporte, render cadence e jitter;
- opcionalmente adicionar um teste visual estilo motion track para o usuario comparar.

Melhor forma fora do browser:

- app nativo usando APIs do sistema operacional ou driver de video;
- isso permitiria ler refresh rate do monitor diretamente, mas sairia do escopo web.

### IP Publico e Localizacao Aproximada

Arquivos:

```txt
functions/api/client.js
assets/js/modules/live/diagnostics.js
assets/js/modules/network/ip.js
```

Metodo atual em producao:

- o browser chama `/api/client`;
- a Cloudflare Pages Function le `cf-connecting-ip`;
- tambem usa `request.cf` para cidade, regiao, pais, colo, timezone, ASN e organizacao quando disponivel.

Metodo atual local:

- como `python -m http.server` nao executa Pages Functions, o lab usa fallback externo via `https://ipapi.co/json/`.

Limitacoes:

- localizacao por IP e aproximada;
- VPN, proxy, CGNAT e redes corporativas podem alterar o resultado;
- latitude/longitude de IP nao e localizacao fisica precisa;
- em ambiente local, depender de servico externo pode falhar por rede, CORS ou rate limit.

Melhor forma:

- em producao, usar a propria Cloudflare como fonte primaria;
- manter fallback externo apenas para desenvolvimento;
- nunca usar Geolocation API automaticamente;
- se um dia houver botao explicito, separar "Approximate by IP" de "Precise location permission".

### Latencia

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/network/latency.js
```

Metodo atual:

- faz algumas requisicoes `fetch` para um asset same-origin;
- mede `performance.now()` antes e depois;
- calcula melhor amostra e mediana;
- exibe o melhor valor no painel principal.

O que isso mede:

- latencia percebida ate o endpoint/CDN que serviu o asset;
- custo real de uma requisicao HTTP no navegador.

O que isso nao mede:

- ping ICMP real;
- latencia ate qualquer servidor arbitrario;
- jitter de rede de baixo nivel.

Melhor forma:

- medir multiplos endpoints Cloudflare;
- adicionar mediana, p95 e jitter;
- testar uma Pages Function leve para comparar static asset vs function;
- opcionalmente usar WebSocket ping se existir backend persistente no futuro.

### CPU

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/system/cpu.js
assets/js/modules/system/hardware.js
```

Metodo atual:

- usa `navigator.hardwareConcurrency`;
- mostra quantidade de logical threads exposta pelo browser.

Limitacoes:

- nao revela modelo real do processador;
- pode ser reduzido pelo browser por privacidade;
- logical threads nao sao equivalentes a performance real.

Melhor forma no browser:

- manter `hardwareConcurrency`;
- adicionar benchmark controlado em Web Worker;
- separar "reported threads" de "measured compute score".

Melhor forma fora do browser:

- app nativo ou agente local com permissao do usuario.

### RAM

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/system/memory.js
```

Metodo atual:

- usa `navigator.deviceMemory` quando disponivel;
- mostra como "browser estimate".

Limitacoes:

- o valor e aproximado;
- browsers podem arredondar e limitar para reduzir fingerprinting;
- nao representa uso real total do sistema.

Melhor forma no browser:

- usar `navigator.deviceMemory` como hint;
- quando disponivel, usar `performance.memory` apenas para JS heap, nao RAM total;
- documentar claramente a diferenca.

Melhor forma fora do browser:

- app nativo ou agente local.

### Storage / Disco

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/system/storage.js
```

Metodo atual:

- usa `navigator.storage.estimate()`;
- mostra quota e uso do armazenamento permitido ao browser.

O que isso mede:

- quota do navegador/origem;
- espaco usado por storage web.

O que isso nao mede:

- tamanho real do SSD/HD;
- espaco livre total do sistema;
- particoes ou discos fisicos.

Melhor forma no browser:

- continuar usando StorageManager;
- nomear como "browser storage quota";
- se houver PWA/IndexedDB no futuro, mostrar uso por categoria.

Melhor forma fora do browser:

- app nativo ou backend local com permissao explicita.

### GPU / WebGL

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/gpu/webgl.js
assets/js/modules/gpu/gpu.js
```

Metodo atual:

- cria contexto WebGL;
- tenta ler `WEBGL_debug_renderer_info`;
- captura vendor e renderer quando o browser permite.

Limitacoes:

- browsers podem mascarar o renderer;
- extensao pode estar indisponivel;
- nao mede VRAM;
- nao garante GPU fisica exata em notebooks hibridos.

Melhor forma no browser:

- usar WebGL como fallback amplo;
- adicionar WebGPU quando fizer sentido;
- criar benchmark grafico leve separado do identificador.

Melhor forma fora do browser:

- app nativo ou agente local.

### Tela, Viewport e DPR

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/system/screen.js
```

Metodo atual:

- `screen.width` e `screen.height`;
- `window.innerWidth` e `window.innerHeight`;
- `window.devicePixelRatio`;
- `screen.colorDepth`.

Limitacoes:

- zoom do browser altera viewport e DPR percebido;
- multi-monitor pode variar conforme a janela;
- algumas APIs podem ser arredondadas por privacidade.

Melhor forma:

- mostrar resolucao, viewport e DPR juntos;
- atualizar em resize;
- adicionar historico de mudancas no futuro.

### Bateria

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/system/battery.js
assets/js/modules/sensors/battery.js
```

Metodo atual:

- usa `navigator.getBattery` quando suportado;
- mostra nivel e status de carregamento.

Limitacoes:

- nao e suportado em todos os browsers;
- alguns browsers removeram ou limitaram por privacidade.

Melhor forma:

- manter opcional;
- tratar como unsupported sem erro;
- nunca depender disso para UX critica.

### Network Connection Hint

Arquivo:

```txt
assets/js/modules/live/diagnostics.js
```

Metodo atual:

- usa `navigator.connection` quando disponivel;
- exibe `effectiveType`, `downlink` e `rtt`.

Limitacoes:

- suporte limitado;
- valores sao estimativas;
- alguns browsers nao implementam.

Melhor forma:

- usar apenas como hint;
- combinar com medicao real de fetch latency.

### Browser, Idioma e Timezone

Arquivos:

```txt
assets/js/modules/live/diagnostics.js
assets/js/modules/browser/
assets/js/modules/geolocation/
```

Metodo atual:

- `navigator.userAgentData` quando disponivel;
- `navigator.platform`;
- `navigator.language`;
- `Intl.DateTimeFormat().resolvedOptions().timeZone`;

Limitacoes:

- user agent pode ser reduzido;
- timezone e locale podem ser alterados pelo usuario ou extensoes;
- nao devem ser tratados como identidade unica.

Melhor forma:

- exibir como ambiente do browser;
- evitar transformar em fingerprint unico por padrao;
- explicar quando um sinal e aproximado.

### Media Devices

Arquivos:

```txt
assets/js/modules/media/
```

Metodo atual:

- checa suporte das APIs;
- nao chama `getUserMedia` automaticamente.

Limitacoes:

- sem permissao, nomes e detalhes de devices podem ficar ocultos;
- pedir permissao automaticamente seria invasivo.

Melhor forma:

- manter como availability check;
- no futuro, adicionar um botao explicito "Test camera/microphone";
- explicar exatamente o que sera pedido antes do prompt.

### Experimental APIs

Arquivos:

```txt
assets/js/modules/experimental/
```

Metodo atual:

- checa disponibilidade de Bluetooth, USB, Serial, Gamepad e VR/XR;
- nao solicita permissao automaticamente.

Melhor forma:

- manter em modo seguro por padrao;
- criar playgrounds isolados com acoes explicitas;
- nunca rodar scans invasivos no boot.

## Status dos Dados

Os modulos usam status:

```txt
available
unsupported
permission-required
```

Interpretacao:

- `available`: o browser conseguiu ler ou verificar o sinal;
- `unsupported`: API inexistente ou indisponivel nesse browser;
- `permission-required`: o sinal exigiria permissao ou uma acao explicita.

## O Que E Real vs Aproximado

### Real / Medido Diretamente

- viewport;
- DPR;
- color depth;
- timezone reportado;
- idioma reportado;
- latency via fetch;
- refresh estimado por frame timing;
- storage quota do browser;
- WebGL renderer quando exposto.

### Aproximado / Protegido Pelo Browser

- RAM;
- CPU;
- localizacao por IP;
- tipo de conexao;
- GPU fisica real;
- bateria em alguns browsers.

### Nao Disponivel de Forma Confiavel na Web

- modelo exato do CPU;
- tamanho real de disco/SSD;
- RAM total exata;
- VRAM;
- temperatura;
- processos do sistema;
- numero serial de hardware;
- geolocalizacao precisa sem permissao.

## Desenvolvimento Local

Servidor estatico simples:

```powershell
cd E:\Project\faysk-lab
python -m http.server 4202
```

Acesse:

```txt
http://127.0.0.1:4202/
```

Observacao: `python -m http.server` nao executa Cloudflare Pages Functions. Por isso `/api/client` so funciona em producao ou com ambiente Cloudflare local adequado.

## Desenvolvimento Com Pages Functions

Para testar `/api/client` localmente com comportamento mais parecido com producao, o ideal e usar Wrangler/Cloudflare Pages local dev no futuro.

Direcao recomendada:

```txt
wrangler pages dev .
```

Isso pode exigir configuracao adicional, login Cloudflare e dependencias locais. Por enquanto, o projeto segue sem build step e sem depender disso para abrir a UI.

## Deploy

Configuracao recomendada no Cloudflare Pages:

```txt
Framework preset: None
Build command:    vazio
Build output:     /
Root directory:   /
Production branch: main
```

Dominio:

```txt
lab.faysk.dev
```

Ao publicar no Cloudflare Pages, o diretorio `functions/` ativa a rota:

```txt
/api/client
```

## Validacao

Checks uteis:

```powershell
cd E:\Project\faysk-lab

# sintaxe JS
$failed = @()
Get-ChildItem assets\js -Recurse -Filter *.js | ForEach-Object {
  node --check $_.FullName | Out-Null
  if ($LASTEXITCODE -ne 0) { $failed += $_.FullName }
}
$failed

# Pages Function
node --check functions\api\client.js
```

Validar no browser:

- abrir a home;
- confirmar que nao ha 404 para CSS/JS;
- confirmar que o painel "Live overview" preenche;
- manter a aba visivel para medir refresh rate;
- testar busca;
- testar layout mobile;
- confirmar que camera/microfone/geolocation/USB/Bluetooth nao pedem permissao automaticamente.

## Roadmap

### Curto Prazo

- Atualizar live cards em resize/orientation change.
- Mostrar timestamp da ultima coleta.
- Melhorar confianca do refresh rate com mais estados: measured, timeout, tab-hidden, unstable.
- Adicionar p50/p95 para latencia.
- Separar claramente "basic overview" e "advanced modules".
- Adicionar modo "copy report" sem dados sensiveis.
- Melhorar terminal com eventos reais por modulo.

### Medio Prazo

- Criar teste visual de motion/refresh inspirado em UFO tests, sem copiar assets externos.
- Adicionar benchmark CPU em Web Worker.
- Adicionar benchmark Canvas/WebGL leve.
- Adicionar WebGPU detection e benchmark opcional.
- Criar score de privacidade com explicacao, nao score opaco.
- Adicionar historico local usando IndexedDB.
- Adicionar export JSON do diagnostico.
- Criar pagina de docs interna ou modal "What does this mean?".

### Longo Prazo

- Usar Cloudflare Workers/Pages Functions para endpoints de diagnostico de rede.
- Criar multiplos probes regionais para latencia.
- Criar modo comparativo entre browsers.
- Criar sistema de snapshots anonimos opt-in.
- Criar visualizacoes 3D ou canvas para telemetria.
- Criar playgrounds explicitos para APIs sensiveis.
- Transformar o lab em uma referencia tecnica do ecossistema Faysk.

## Decisoes de Produto

O lab deve continuar sendo uma brincadeira tecnica bonita, mas util.

Vale levar para frente:

- refresh/Hz real;
- IP e rota aproximada;
- latencia;
- GPU/WebGL;
- storage quota;
- privacidade e permissoes;
- benchmark opcional;
- comparacao entre browsers.

Pode ser "too much" se virar:

- fingerprint agressivo;
- coleta silenciosa;
- backend pesado sem necessidade;
- dashboard cheio de numeros sem contexto;
- ferramenta que promete ler hardware que a web nao consegue ler.

## Referencias Tecnicas

- `requestAnimationFrame`: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- `navigator.deviceMemory`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
- `navigator.hardwareConcurrency`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency
- `StorageManager.estimate`: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
- `WEBGL_debug_renderer_info`: https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info
- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/functions/
- Cloudflare Request `cf`: https://developers.cloudflare.com/workers/runtime-apis/request/

## Licenca

MIT License.
