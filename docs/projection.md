# Projeção compartilhável

Na aba **Projetar**, gere ou copie o link existente `/view/<hash>`. Ele pode ser aberto em qualquer navegador, TV ou aparelho, sem login, token administrativo ou armazenamento local. Os links já gerados continuam com o mesmo formato e hash; renovar/revogar usa as ações existentes.

## Apresentação

- Preparação: candidatos em ordem de cadastro, sem totais ou classificação; eleitores em cards menores.
- Votação aberta: cada eleitor tem barra individual e contagem de escolhas; card verde ao completar. Aparelhos compartilhados mantêm o progresso separado por pessoa.
- Encerramento: a API libera a soma dos votos online e administrativos; a tela ordena os resultados e respeita empates.
- Reabertura: o servidor omite novamente totais e a tela os oculta. Limpar votos retorna à preparação quando a sala está fechada.
- Listas extensas: alternância de páginas a cada 10 segundos, navegação e pausa. Tela cheia e layout responsivo.
- Erro de rede: oculta dados anteriores até confirmar novamente o estado; retenta automaticamente. Link inválido, revogado ou sala inativa recebe mensagem de indisponibilidade.

## Integração

Depende de `GET /view/{hash}` na API. A requisição não envia Authorization nem cookies. A API valida o hash existente em `view.hash`, consulta apenas a sala vinculada e retorna campos explícitos: identificação da sala, candidatos, nomes/progresso dos eleitores e limite de escolhas. Nunca retorna escolhas individuais ou credenciais. Totais por candidato só são retornados na fase `results` com sala fechada. Respostas não podem ser armazenadas em cache compartilhado.

A fase vem do servidor, inclusive ao abrir o link depois do encerramento. A API registra `view.phase` na tabela de configurações existente, sem migration e sem mudar os estados da sala ou as regras de votação. Salas antigas fechadas com votos online são reconhecidas; encerramentos exclusivamente manuais anteriores à instalação, sem registro de fase, precisam passar por abrir/fechar para serem distinguidos de uma sala nova com votos iniciais.

Publicar a API antes do app. A geração e revogação de links não mudam. Os ajustes não corrigem outros problemas preexistentes de registro/exclusão de votos.

## Validação

`npm test` valida as regras de apresentação. `npm run build` valida a compilação. Testar o link em navegador sem sessão, acompanhar progresso, encerrar, recarregar, reabrir, renovar e revogar. O fechamento nunca deve revelar escolhas de um eleitor.
