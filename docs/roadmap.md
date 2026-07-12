# Roadmap

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
