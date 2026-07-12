# Revisão de produto e técnica

Revisão realizada em julho de 2026.

## Diagnóstico

O projeto tinha uma boa identidade visual e um princípio de privacidade correto, mas a experiência tratava 47 módulos com o mesmo peso. Em desktop a página passava de 9.400 px, o hero ocupava quase toda a primeira viewport e cartões reais, duplicados e placeholders eram visualmente equivalentes.

Também havia três problemas de confiança:

1. APIs suportadas eram rotuladas como “permission-required” mesmo sem consultar uma permissão.
2. O ambiente local enviava o IP do visitante a um serviço externo como fallback.
3. A documentação descrevia workers, benchmarks, IA e módulos que não estavam implementados.

## Mudanças aplicadas

- hero mais curto e mensagem orientada ao benefício;
- snapshot como foco e catálogo técnico como segundo nível;
- cartões mais densos, navegação móvel mais simples e log recolhível;
- remoção do overlay redundante;
- status apresentados como ready, gated, unavailable e unsupported;
- catálogo consolidado de 47 para 35 sinais;
- consolidação de câmera/microfone em Media Capture e dos storages em Web Storage;
- remoção de wrappers duplicados, shims, workers vazios e módulos-placeholder;
- remoção do fallback externo de IP;
- consulta passiva dos estados de permissão, sem requests de acesso;
- duração e estado visível do scan;
- relatório sanitizado copiável, com diálogo manual quando o clipboard é bloqueado;
- seção metodológica explicando estimativas, origem first-party e APIs gated;
- testes nativos para análise de refresh e privacidade do relatório;
- CSP e headers de isolamento aplicados em produção, com fallback meta;
- latência first-party com mediana, p95, jitter e fallback estático;
- orientação e referência oficial em todos os 35 sinais;
- WebGPU consolidado no cartão de Graphics, sem solicitar adapter;
- pipeline de qualidade no GitHub Actions;
- smoke tests reais para scan, catálogo e filtros, sem conexões third-party;
- testes responsivos em desktop e mobile e auditoria axe com zero violações;
- traces e screenshots de falhas preservados como artefatos do CI;
- remoção de partículas invisíveis, inicializadores vazios e nós DOM sem consumidor;
- documentação reescrita conforme a arquitetura real.

O estado inicial passou de mais de 9.400 px para aproximadamente 2.350 px no desktop com o catálogo recolhido. Em 390 px, a interface mantém uma coluna e não apresenta overflow horizontal.

## O que foi mantido

- HTML/CSS/JS vanilla e deploy estático;
- Cloudflare Pages Function first-party;
- filtros e busca;
- radar como elemento de identidade;
- medições passivas e isolamento de falhas por coletor.

## Referências usadas

- [MDN: Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API) — separar consulta de estado e solicitação de permissão.
- [MDN: Navigator.deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory) — valor aproximado, limitado e de suporte restrito.
- [MDN: Navigator.hardwareConcurrency](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency) — não deve ser tratado como contagem absoluta de CPU.
- [MDN: Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) — suporte limitado e valores de conexão estimados.
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — frequência geralmente acompanha o display, mas callbacks pausam em abas ocultas.
- [AmIUnique FAQ](https://amiunique.org/faq) — referência de transparência sobre atributos usados em fingerprinting e valor de uma visão sintética antes dos detalhes.
- [Web Check](https://github.com/Lissy93/web-check) — referência de amplitude para ferramentas de diagnóstico; usada também como limite para evitar transformar este lab em ferramenta OSINT.

## Recomendação de produto

O melhor posicionamento é “o que este navegador revela agora”, não “telemetry operating system”. A vantagem competitiva está em explicar origem, precisão e privacidade de cada sinal com uma experiência rápida. Novas features devem aumentar confiança ou capacidade de suporte; efeitos, infraestrutura e scores sem metodologia devem ficar fora.
