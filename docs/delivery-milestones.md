# Faysk Lab — Plano de milestones e entregáveis
**Estado:** planejamento proposto; não são funcionalidades já implementadas  
**Data da baseline:** 22/10/2026  
**Projeto:** https://lab.faysk.dev/ · [Repositório](https://github.com/Faysk/faysk-lab)  
**Epic:** [#2](https://github.com/Faysk/faysk-lab/issues/2) · **Referência técnica:** [ResetExplode v0.16](https://github.com/GustavoReset/ResetExplode)  
**Baseline técnica verificada:** faysk-lab v0.4.0, HTML/CSS/JS vanilla, ES Modules, Cloudflare Pages/Functions, Node tests, Playwright/axe, CSP e Permissions-Policy restritivas.

> **Atenção — estado GitHub:** as entradas M00–M08 são **issues rastreadoras** (tracking issues). Não são objetos nativos de *GitHub Milestones*, porque a integração conectada não expõe a criação desses objetos. A matriz abaixo permite convertê-las em milestones nativos e atribuir as issues sem redefinir escopo. Nenhuma issue foi marcada como concluída, e nenhuma data de entrega foi fixada sem capacidade/agenda.

## 1. Visão do produto e limites
O Lab começa com um diagnóstico de **navegador passivo e sem instalação**. As capacidades futuras são aditivas, isoladas e explicitamente autorizadas:

1. **Browser Passive:** mantém os ~35 sinais, nenhuma permissão pedida no carregamento, nenhum fingerprint persistente, nenhum login obrigatório.
2. **Browser Active:** diagnóstico HTTP ampliado, benchmarks WebAssembly/WebGPU, análise da pasta escolhida, USB/Serial somente em fluxos dedicados — sempre por ação explícita e com cancelamento/limites.
3. **Imported Report:** arquivo local validado e sanitizado, marcado como observação histórica, não como monitoramento live.
4. **Windows Agent Read-only:** medições WMI/LibreHardwareMonitor/NVML/S.M.A.R.T./bateria e streaming autenticado, sem privilégios elevados por padrão.
5. **Advanced Local Operations:** benchmarks nativos, FPS/overlay e, eventualmente, helper com ações *allowlisted* e confirmação local.
6. **Remote Multi-PC (opcional):** decisão SaaS separada, condicionada a privacidade, custo e risco; nunca pré-requisito para a Web.

Não converter `navigator.deviceMemory` em RAM exata, `storage.estimate()` em capacidade de disco, `requestAnimationFrame` em Hz físico garantido, nem testes HTTP em ICMP. Diferenciar **fonte**, **medido/estimado**, **unidade**, **timestamp**, **estado** e **qualidade**.

## 2. Regras de planejamento, esforço e marcos
- **Unidade de esforço:** *dia de engenharia* (tempo de trabalho concentrado de 1 pessoa), **intervalos indicativos**, não compromissos de calendário. Rever após M00 e a cada release. Não assumir desenvolvimento assíncrono.
- **Capacidade:** plano-base para um mantenedor; paralelização só após resolver contratos/segurança. Reservar **20–30%** de contingência para compatibilidade, hardware, drivers e retrabalho.
- **Controle de escopo:** novas features precisam de evidência de problema real, acceptance criteria e impacto de segurança; alterações maiores passam por ADR e revisão da epic.
- **Entregáveis versionados:** cada milestone tem versão, artefatos verificáveis, critérios GO/NO-GO, owner a nomear, risks e links PR/CI. Versão só é considerada publicada depois de deploy/testes confirmados.
- **Sem datas inventadas:** definir `due_on` em milestones nativos apenas com disponibilidade real e depois da avaliação M00. M08 pode permanecer em *Icebox*.
- **Cross-cutting:** segurança, acessibilidade, privacidade, documentação e performance são obrigações em cada PR. As issues #31/#32 representam o fechamento de GA, não licença para adiar QA para o fim.

## 3. Quadro executivo de entregas

| Marco | Entrega / versão alvo | Issues responsáveis | Esforço indicativo | Gate principal | Rastreio |
|---|---|---|---|---|---|
| **M00** | Architecture Gate | #3, #4, #5, #6, #7 | 6–12 dias | ADR, threat model, schema e desenho aprovados | [#33](https://github.com/Faysk/faysk-lab/issues/33) |
| **M01** | v0.5.0 — Web Utility | #10, #11, #12, #13 | 8–16 dias | Diagnósticos sem instalação + exports seguros | [#34](https://github.com/Faysk/faysk-lab/issues/34) |
| **M02** | v0.6.0 — Web Labs | #8, #9, #14 | 10–20 dias | Benchmarks e Makers opt-in e canceláveis | [#35](https://github.com/Faysk/faysk-lab/issues/35) |
| **M03** | v0.7.0-alpha — Agent Trust | #15, #16, #20, #21 | 16–30 dias | PoC agente read-only, origem, pairing e revogação | [#36](https://github.com/Faysk/faysk-lab/issues/36) |
| **M04** | v0.8.0-beta — Hardware Monitor | #17, #18, #19, #22, #23, #24 | 24–45 dias | Sensores, dashboards e distribuição beta segura | [#37](https://github.com/Faysk/faysk-lab/issues/37) |
| **M05** | v1.0.0 — Stable | #31, #32 | 10–22 dias | Quality gates, suporte, integridade, rollback | [#38](https://github.com/Faysk/faysk-lab/issues/38) |
| **M06** | v1.1.0 — Performance & Games | #25, #26, #27 | 18–35 dias | Benchmark native seguro, FPS e overlay local | [#39](https://github.com/Faysk/faysk-lab/issues/39) |
| **M07** | v1.2.0 — Local Operations | #28, #30 | 15–35 dias | Alertas opt-in; helper de ações reversíveis | [#40](https://github.com/Faysk/faysk-lab/issues/40) |
| **M08** | v2.0.0-proposal — Remote Multi-PC | #29 | 20–45 dias, **condicional** | ADR SaaS, isolamento, LGPD/RGPD, custos | [#41](https://github.com/Faysk/faysk-lab/issues/41) |

**Esforço agregado estimado até a GA M05:** **74–145 dias de engenharia** antes de contingência; reestimar após spikes e não converter diretamente em data pública. Os marcos M06/M07/M08 são opcionais para a primeira GA, e M08 depende de aprovação de produto independente.

## 4. Entregáveis detalhados por milestone

### M00 · Foundation & Architecture — [rastreador #33](https://github.com/Faysk/faysk-lab/issues/33)
**Questão a responder:** como ampliar o produto sem perder seu modo passivo, privado e leve?  
**Sequência sugerida:** #3 (ADR) → #4 (licenciamento/código), #5 (UX), #6 (contratos), #7 (ameaças/políticas), com revisão integrada.
**Documentos entregues:** `docs/adr/*`, matriz de capacidades e fontes, schema JSON versionado + fixtures, inventário ResetExplode com licença/autoria por arquivo, fluxos UX, threat model, mapa de permissões e baseline de QA/deploy.
**GO:** reuso legal/técnico delimitado; fronteira Browser/Agent/Imported clara; todos os endpoints e operações previstos classificados como read-only, explicit-gesture ou privilegiados; nenhuma alteração silenciosa de CSP.  
**NO-GO:** comunicação remota sem autenticação, agente executado como administrador global sem necessidade demonstrada ou ausência de retenção/privacidade definida.
**Evidências:** links ADR, protótipo, relatório de auditoria, CI pré-existente verde, revisão registrada na #33.

### M01 · v0.5.0 Web Utility — [rastreador #34](https://github.com/Faysk/faysk-lab/issues/34)
**Entrega ao utilizador:** testar rede com transparência metodológica, examinar uma pasta escolhida, importar um relatório e gerar/diferenciar relatórios sanitizados.
**Implementação:** #10 rede HTTP (com mediana/p95/jitter e limites), #11 análise somente da pasta escolhida, #12 importação ResetExplode JSON + versões, #13 export/diff local; seguir contracts do M00.
**Aceite:** nada de upload sem consentimento; arquivos e caminhos não entram no relatório por padrão; import malicioso não gera HTML executável; sem suporte a pasta a UI degrada com honestidade; scan passivo intacto.
**Evidências:** tests/report.test.js e novos unit tests, Playwright import/abort/offline, screenshots/mobile, deployment smoke, changelog v0.5.0.
**Rollback:** Cloudflare Pages para deployment anterior; os relatórios locais continuam exportáveis sem servidor.

### M02 · v0.6.0 Web Labs — [rastreador #35](https://github.com/Faysk/faysk-lab/issues/35)
**Entrega ao utilizador:** testes de CPU e GPU explicitamente iniciados, e laboratório de periféricos em área separada.  
**Implementação:** #8 (benchmark WASM/worker com tempo, cancel e workload versionado), #9 (WebGPU/WebGL, device lost, presets e comparação metodológica), #14 (WebSerial/USB opt-in e escopo de políticas).
**Aceite:** zero testes pesados no boot; cancelamento válido e UI responsiva; nenhum resultado de benchmark browser vendido como medição de CPU/GPU nativa; scripts/workers e permissões liberados apenas quando necessário.
**Política de scope:** se USB/Serial não for compatível com segurança ou navegadores-alvo, separar em experimento não bloqueante e registrar decisão na #35, sem fingir entrega completa.
**Evidências:** métricas de teste por browser, abort e hidden tab, revisão CSP/Permissions-Policy, UI com sem-suporte/cancel.
**Rollback:** feature flags dos labs e retorno ao scan passivo.

### M03 · v0.7.0-alpha Agent Trust — [rastreador #36](https://github.com/Faysk/faysk-lab/issues/36)
**Entrega técnica:** primeiro agente Windows *developer alpha*, sem obrigação de installer público nem estabilidade prometida.
**Implementação:** #15 (Core/Host/Windows providers e mocks), #16 (inventário WMI sanitizado), #20 (spike localhost versus relay), #21 (pairing, revogação, least privilege).
**Aceite:** agente funciona sem admin por padrão; origem e sessão são autenticadas; não escuta interface externa arbitrária; replays/tokens expirados recusados; modo Web funciona sem ele; disconnect fecha acesso.
**Evidências:** Windows CI e testes de protocolo, matriz real dos browsers, threat model atualizado, PoC com dados sintéticos, release alpha restrita aos testes.
**NO-GO:** criação de serviço always-on, driver silencioso, remoto sem auditoria, qualquer forma de command executor genérico.

### M04 · v0.8.0-beta Hardware Monitor — [rastreador #37](https://github.com/Faysk/faysk-lab/issues/37)
**Entrega ao utilizador piloto:** inventário + sensores reais (quando disponíveis), discos e bateria, diagnóstico de rede avançado, gráficos de sessão, relatório conjunto e instalador beta.
**Implementação:** #17 LibreHardwareMonitor/NVML, #18 S.M.A.R.T./bateria, #19 ICMP/gateway, #22 dashboard, #23 pacote/CI e atualização confiável, #24 relatório Agent+Browser+Import.
**Aceite:** falha de NVML/PawnIO não quebra o dashboard; nenhum pedido de UAC automático; estados offline/stale/capability honestos; pacote rastreável a tag/commit, hashes e avisos de licença; modo Web completo quando agente está desligado.
**Evidências:** smoke em Windows 10/11, fixtures com GPU única/múltipla, NVMe/USB, desktop/notebook, testes de reconexão e revogação, SBOM, uninstall/reinstall.
**NO-GO:** release beta com auto-update não autenticado ou canais de controle sem autorização.

### M05 · v1.0.0 Stable — [rastreador #38](https://github.com/Faysk/faysk-lab/issues/38)
**Entrega ao utilizador:** versão estável **Web + agente Windows somente leitura**, sem ser necessário instalar para usar o Lab.
**Implementação:** #31 (E2E, segurança, browser/OS matrix, desempenho/UX), #32 (docs, suporte, dados e rollback), e encerramento das pendências críticas das releases anteriores.
**Aceite:** zero bugs críticos/altos sem mitigação explicitamente aprovada; CI verde; acessibilidade, teclado, mobile e offline verificados; binário com integridade/origem verificável; instalação/desinstalação/revogação testadas; changelog e rollback ensaiados.
**Evidências:** release notes v1.0.0, matriz suporte publicada, PRs com checks, relatório de QA/privacidade, tutorial instalação/revogação e evidência de smoke em produção.
**Escopo fechado:** sem overclock, drivers mutáveis, multi-tenant cloud ou FPS como dependência de GA.

### M06 · v1.1.0 Performance & Games — [rastreador #39](https://github.com/Faysk/faysk-lab/issues/39)
**Entrega:** benchmarks nativos versionados e opcionais, FPS/frametime/1% low, overlay local opcional e análise contextual de gargalo.
**Implementação:** #25 runner com watchdog/cancel, #26 ETW/overlay local sem injeção, #27 gargalos/jogos e limiares explicáveis.
**Aceite:** stress não dispara silenciosamente nem excede limites definidos; cancela/limpa temporários; overlay nativo não promete atuar em full-screen exclusivo; métricas probabilísticas não têm 'gargalo 100% certo'.
**Evidências:** hardware testado, limites térmicos e de disco, resultados comparáveis só por preset/versão e regressões de performance do agente.

### M07 · v1.2.0 Local Operations — [rastreador #40](https://github.com/Faysk/faysk-lab/issues/40)
**Entrega:** alertas locais por sensores e pequeno catálogo de operações reversíveis, sem permitir execução remota de comando genérico.
**Implementação:** #28 helper elevado isolado, IPC autenticado, allowlist, confirmação local, backup/rollback; #30 alertas opt-in com debounce e retenção desligada por padrão.
**Aceite:** operações destrutivas/firmware/OC não habilitadas na versão inicial; nenhuma elevação permanente do principal; confirmação local, preview, verificação e rollback onde aplicável; usuário pode parar alertas/apagar dados.
**Evidências:** testes de IPC/escalação, VM de rollback, auditoria de operações permitidas, logs sanitizados.

### M08 · v2.0.0-proposal Remote Multi-PC — [rastreador #41](https://github.com/Faysk/faysk-lab/issues/41)
**Entrega condicional:** dashboard multi-PC vinculado a contas, relay outbound seguro e política explícita de dados, somente se houver necessidade real.
**Implementação:** #29 conta/pairing tenant-safe, Workers/Durable Objects, autenticação e isolamento, limites de dados/conexões e análise de custo/privacidade.
**GO:** ADR e validação RGPD + segurança, limites mensurados, autenticação e revogação efetivas, benefício demonstrado por uso/feedback.
**NO-GO:** qualquer coleta cloud default, comando remoto genérico, exposição pública de endpoint local, retenção sem política/consentimento.
**Nota:** marco pode permanecer em Icebox indefinidamente. M06 e M07 **não** são dependências técnicas obrigatórias.

## 5. Caminho crítico e paralelismo

```text
M00 architecture + threat model (BLOQUEANTE)
  ├── M01 Web Utility ──> M02 Web Labs ────────┐
  └── M03 Agent Trust ──> M04 Agent Read-only ─┤
                                                └── M05 Stable GA
                                                     ├── M06 Bench/Games
                                                     ├── M07 Ops/Alerts
                                                     └── M08 Remote (somente após novo GO)
```

- **Equipe de uma pessoa:** priorizar M00 → M01 → M02 (ou M03 se o agente passar a ser prioridade demonstrada) → M03/M04 → M05.  
- **Dois fluxos de trabalho:** após M00, M01/M02 podem ser tocados paralelamente a M03/M04, com compatibilidade de contrato e segurança.  
- **Bloqueantes por feature:** #6 contrato para UI/relatórios; #7 ameaças para CSP/agente; #20 transporte antes de #21 pareamento; #21 antes de #22 streaming acessível; #23 antes de distribuir beta; #31/#32 antes da GA.
- **Caminho crítico técnico da GA:** ADR (#3) → ameaças/contrato (#6/#7) → agente (#15) → PoC bridge (#20) → pairing (#21) → dashboard/integridade (#22/#23) → QA & Docs (#31/#32).  
- **Escopo contingente:** #14 (periféricos) pode migrar para experimental; M08 não pode bloquear GA.

## 6. Definition of Ready para iniciar issue
- [ ] Problema e público beneficiado claros
- [ ] Fonte do dado / escopo / limites definidos
- [ ] Dependências e decisão ADR satisfeitas
- [ ] Testes e estados de erro definidos antes da codificação
- [ ] Impacto de segurança, privacidade e CSP revisto
- [ ] Estimativa reavaliada e menor incremento verificável descrito

## 7. Definition of Done para entregar issue
- [ ] Código e testes automatizados revisados, com status no PR e commits verificáveis
- [ ] Regressões Node + Playwright/axe; para agente, testes .NET + Windows CI
- [ ] Estados de erro/unsupported/denied/stale/cancel testados
- [ ] Nenhuma nova coleta passiva sensível, fingerprint ou envio third-party inadvertido
- [ ] Accessibilidade, 320px+ e modo teclado testados onde houver UI
- [ ] Relatórios sanitizados; sem payload sensível em logs
- [ ] Documentação/changelog e notas de limitação correspondem ao código
- [ ] Link de evidências e plano de rollback na issue

## 8. Release gate padrão (GO / NO-GO)
1. **Funcionalidade:** acceptance criteria completos; ações críticas reproduzíveis em teste.
2. **Segurança/privacidade:** sem falhas críticas e sem permissões implícitas; ataques básicos de origem, token, replay e payload rejeitados nos fluxos de agente.
3. **Confiabilidade:** integrações parciais falham isoladamente; browser sem agente preserva 100% do Lab passivo.
4. **Qualidade:** testes e checks de CI verdes, zero regressões de acessibilidade conhecidas sem plano aprovado; comparar Lighthouse/CWV com baseline medido, não com números inventados.
5. **Distribuição:** hash/release/SBOM/proveniência rastreáveis; pacote agente piloto só depois de auditoria.
6. **Operação:** health smoke em produção e rollback validado; aviso de incidentes e canal de contato acessíveis.
7. **Decisão:** manter evidência GO/NO-GO em comentário de fechamento do rastreador, incluindo riscos aceites.

## 9. Gestão de risco
| Risco | Impacto | Prevenção / decisão |
|---|---|---|
| Misturar medições nativas e estimativas web | Resultados enganosos | Schema de origem e unidade + 'unknown' explícito |
| Web falando com localhost de maneira insegura | Acesso de origem não autorizada | Spike multi-browser; tokens; Origin; isolamento; fail-closed |
| Driver e privilégios elevados | Vulnerabilidades / UAC / falhas | Sem admin no core; helper e driver apenas opt-in |
| Benchmarks/stress afetarem hardware | Aquecimento/desgaste/travamento | Tempo, cancel, watchdog e presets conservadores |
| Import/relatórios exporem identificadores | Privacidade e risco RGPD | Allowlist, preview e remoção de dados sensíveis por padrão |
| SDKs e dependências de terceiros | Licenciamento / supply chain | Auditoria M00, SBOM, hash e avisos |
| Custo de WebSocket/relay remoto | Complexidade e gasto recorrente | M08 opcional, simulação de tráfego/custo antes do GO |
| Scope creep / muito UI sem valor | Entrega atrasada e regressões | Releases incrementais; novas features exigem problema demonstrável |

## 10. Workflow Git e governança de backlog
- Branches: `feat/fhl-XX-descricao`, `fix/fhl-XX-...`, `docs/milestones-...`.
- PR deve mencionar a issue (`Closes #N` apenas se realmente satisfizer seus critérios), rodar qualidade, conter resumo e screenshots relevantes.
- Em cada issue filha, registrar `**Milestone planejado: Mxx — #rastreio**`; usar a mesma nomenclatura na epic.
- A issue rastreadora Mxx usa checkbox de cada issue filha, checks de artefatos e GO/NO-GO; fechar apenas quando a versão for validada.
- Manter `main` implantável; preview da Pages por PR e releases de agente por tags; versão nativa web/agente/schema documentada.
- Controle de mudanças: tarefa nova só entra num marco se uma existente sair, o esforço for reestimado ou a nova necessidade for bloqueante de segurança.

## 11. Conversão para GitHub Milestones nativos
Quando houver acesso a criação de milestone pelo UI/GitHub REST autenticado:
1. **Issues → Milestones → New milestone**; criar M00–M08 com os mesmos nomes, títulos/descrições das rastreadoras #33–#41. Sem `due date` até capacidade/agenda aprovadas.
2. Atribuir cada issue #3–#32 ao Mxx listado no quadro (cada uma recebe apenas um milestone nativo).
3. Manter #33–#41 como *release gates* (ou fechá-las como substituídas, depois de links/campos transferidos; nunca duplicar contagem de progresso).
4. Atualizar #2 e este documento com links aos milestones nativos e revisões de escopo.
5. Só então acompanhar barras de progresso nativas e planejamento por data. **Issues rastreadoras não são milestones nativos.**

## 12. Critério de sucesso v1.0
A pessoa acessa `lab.faysk.dev` sem instalar nada, entende os limites das informações mostradas, realiza testes opcionais, exporta relatório seguro e, **se quiser**, instala um agente Windows que fornece dados nativos com origem/horário, sem abrir privilégios amplos, sem obrigar nuvem e com revogação real. Nada disso é apresentado como concluído antes de passar pelos gates.
