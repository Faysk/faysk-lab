# Roadmap

## Proposta de evolução opt-in — Hardware Diagnostics (22/10/2026)

A expansão para **Web Active + import de relatórios + agente Windows read-only opcional** está detalhada em [Plano de entregas e milestones](delivery-milestones.md) e acompanhada pela [epic #2](https://github.com/Faysk/faysk-lab/issues/2). As fases M00–M08 têm issues rastreadoras e critérios GO/NO-GO; **não são GitHub Milestones nativos** neste momento.

**Importante:** esta proposta ainda depende do *Architecture Gate* M00 / ADR da issue #3. Ela **não revoga** as prioridades anteriores de privacidade, ausência de fingerprint persistente, scan passivo, não instalar agentes por padrão e não executar testes intensivos sem consentimento. Contas/remoto continuam opcionais, fora do MVP e sem data prometida.

## Agora: confiabilidade e clareza

- [x] Adicionar testes unitários para análise de refresh e sanitização.
- [x] Automatizar o smoke test do catálogo, filtros e scan passivo.
- [x] Consultar estados suportados via Permissions API sem solicitar permissão.
- [x] Expor horário local, duração e conclusão do último scan.
- [x] Adicionar pipeline de qualidade com testes, imports, assets, headers e invariantes de privacidade.
- [x] Exigir zero violações axe no teste local de Chromium.
- [ ] Validar o deploy real com Lighthouse e repetir axe contra a URL publicada.
- [x] Adicionar endpoint first-party leve com fallback estático para latência.

## Depois: utilidade prática

- [x] Gerar um relatório JSON local, mediante clique explícito.
- [x] Permitir copiar um resumo sanitizado para suporte técnico, com fallback manual.
- [x] Explicar origem, precisão e gates no fluxo principal.
- [x] Adicionar referências e limitações específicas dentro de cada sinal.
- [x] Adicionar WebGPU apenas como capability check consolidado em Graphics.
- [ ] Oferecer testes opcionais e isolados de câmera/microfone somente quando houver um caso de diagnóstico claro.

## Não priorizar

- autenticação, banco de sessões e histórico de fingerprints;
- mapas de visitantes e dashboards de terceiros;
- IA para explicar dados que podem ser explicados deterministicamente;
- tracking comportamental, canvas/audio fingerprint ativo ou score de unicidade sem dataset e metodologia;
- 3D, áudio ambiente, janelas arrastáveis, CRT e partículas pesadas;
- benchmarks agressivos de CPU/GPU sem objetivo, limites e consentimento explícito.

O critério para entrar no roadmap é simples: a funcionalidade precisa tornar o diagnóstico mais correto, compreensível ou acionável sem enfraquecer a privacidade.
