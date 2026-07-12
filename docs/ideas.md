# Ideias avaliadas

Este arquivo registra decisões, não promessas.

## Implementar quando houver tempo

### Relatório local e sanitizado

Um botão pode gerar JSON ou texto no próprio navegador. O usuário escolhe o que copiar; IP e valores potencialmente identificáveis devem vir desmarcados.

### Explicações contextuais

Cada sinal pode ganhar “o que significa”, “limitação” e link de referência. Isso aumenta a utilidade sem ampliar a coleta.

### Permissions API read-only

Consultar estados de permissões compatíveis é útil desde que nenhuma solicitação seja disparada e estados não suportados sejam tratados sem erro.

### Testes opcionais

Câmera, microfone, Gamepad e sensores só fazem sentido em fluxos separados, com ação explícita, explicação prévia e encerramento visível do recurso.

## Manter apenas como referência

- comparação entre sessões feita localmente;
- gráfico curto de jitter/latência;
- capability check de WebGPU;
- detecção de mudanças de conexão e viewport.

## Descartar da visão principal

- fingerprint ativo, entropy score e “Browser DNA”;
- mouse/teclado/touch heatmaps;
- mapa de visitantes e sessões centralizadas;
- fake hacking logs e interface de sistema operacional;
- assistente de IA, threat detection e clustering;
- temas Matrix/CRT, áudio ambiente e visualizações 3D.

Essas ideias ou conflitam com o posicionamento de privacidade, ou criam espetáculo sem melhorar o diagnóstico, ou exigem infraestrutura e metodologia desproporcionais ao produto.
