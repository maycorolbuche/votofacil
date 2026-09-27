# Projeção para TV ou telão

Na sala administrativa, abra **Projetar**, gere o link e abra-o em outra aba do mesmo navegador. Mova essa janela para a TV/telão ou compartilhe apenas essa janela. O botão **Tela cheia** amplia a projeção.

## Fluxo

- Preparação: candidatos em cards grandes, em ordem de cadastro; eleitores em cards menores. Nenhum total ou classificação é exibido.
- Votação aberta: progresso individual `votos_count / num_candidates`; card verde e confirmação textual quando todas as escolhas terminam. Eleitores de um aparelho compartilhado têm progresso independente. Participantes pendentes são identificados; rejeitados não aparecem.
- Encerramento: totais consolidados da API (online + administrativos), ordenação decrescente e posições com empates.
- Reabertura: totais e classificação voltam a ficar ocultos. Limpar votos prepara uma nova votação.
- Listas extensas: páginas automáticas a cada 10 segundos, com navegação e pausa. A quantidade de cards se adapta à largura da tela.
- Falha de conexão: o conteúdo fica oculto até confirmar novamente o estado da sala, para não manter uma apuração antiga visível. Revalidação a cada consulta, ao trocar de sessão e ao retornar à aba.

## Contrato e limites da API existente

Esta implementação altera somente o app. Usa `GET /admin/sync`, autenticado com o token administrativo já armazenado no navegador, e compara `view.hash` com o hash da rota. Não envia tokens no link nem cria uma forma de compartilhá-los.

O link **não é público**: a API atual gera/revoga o hash, mas não oferece endpoint que consulte uma projeção por ele. Abrir o link em outro aparelho/navegador sem a sessão administrativa exibe uma orientação, sem dados. Para acesso público será necessário um endpoint na API que valide o hash e selecione apenas os campos da projeção. Esse endpoint deverá omitir totais e posições enquanto a votação estiver aberta. O endpoint administrativo atual devolve esses dados, portanto a ocultação deste PR é visual, não uma nova fronteira de autorização. A projeção não deve ser usada para conceder acesso ao navegador administrativo a terceiros.

A API usa `closed` tanto para sala nova quanto para votação encerrada. O app acompanha abertura/encerramento no armazenamento local, por sala; a tela administrativa registra transições mesmo se a projeção estiver fechada. Totais online consolidados também identificam uma votação já apurada. Valores iniciais/manuais sozinhos não indicam encerramento. Se o armazenamento local for apagado, uma apuração exclusivamente manual e sem votos online precisa passar por abrir/fechar novamente para ter seu encerramento reconhecido. Um estado persistente na API eliminaria essa limitação.

A atualização depende do polling (3 segundos após cada resposta) e da invalidação do cache já existente na API. A projeção não corrige problemas preexistentes de registro de votos, exclusão em cascata ou apuração no servidor.

## Validação

- `npm ci`
- `npm test`: regras de apresentação, ciclo de vida, progresso, empates, isolamento entre salas e snapshots inválidos.
- `npm run build`
- Conferir no navegador: preparação, progresso parcial/completo, encerramento, recarga, reabertura, falha de conexão, paginação, revogação e acesso sem sessão.
