# Guia de Usabilidade do Strapi FEMICTEC

Este documento explica como navegar e editar o CMS com foco em rapidez, consistencia e menor chance de erro.

## Objetivo da plataforma

O Strapi neste projeto serve como painel de administracao para:

- paginas institucionais;
- blocos de conteudo reutilizaveis;
- listas de itens publicados;
- rotas publicas consumidas pelo frontend;
- conteudos importados da plataforma externa.

O modelo foi desenhado para dividir o conteudo em partes pequenas e previsiveis, facilitando a edicao por quem nao mexe no codigo.

## Como pensar o CMS

Na pratica, a plataforma e organizada em quatro padroes:

- `single types`: paginas unicas, como `Feira`, `Home` e `Contato`, e blocos globais como `Navbar` e `Footer`;
- `collection types`: listas, como noticias, eventos, galerias e projetos;
- `components`: blocos de formulario agrupados por tema;
- `public APIs`: rotas de leitura que o frontend consome diretamente.

Isso significa que o editor nao precisa decidir estrutura tecnica. Ele apenas escolhe o conteudo, preenche os campos e publica.

## Fluxo recomendado de edicao

### 1. Conferir o tipo certo

Antes de editar, confirme se o conteudo esta em:

- uma pagina unica;
- uma lista de itens;
- um componente dentro de outra pagina;
- um item importado da plataforma externa.

Isso evita editar o lugar errado e publicar um conteudo incompleto.

### 2. Preencher em blocos

Sempre que houver componentes repetiveis, preencha um bloco por vez.

Exemplos:

- `Feira` tem `visaoGeral`, `cronograma` e `programacao`;
- `Pagina - FEMICTEC` tem `menuInterno`, `apresentacao`, `quemRealiza` e `historico`;
- `FAQ` tem uma lista de `perguntas`;
- `Contato` tem varios `destinatariosEvento`.

### 3. Salvar e revisar

Antes de publicar:

- revise titulos;
- revise textos longos;
- confira imagens e seus textos alternativos;
- valide se os campos obrigatorios estao preenchidos.

### 4. Publicar

Se `draftAndPublish` estiver ativo, o conteudo precisa ser publicado para aparecer no frontend.

## Areas principais do painel

### Home

Conteudo principal:

- `Home - Datas`

Como editar:

- preencha `tituloSecao`;
- preencha as tres etapas com `titulo` e `data`;
- mantenha as datas no mesmo padrao de escrita usado no frontend.

Sugestao de uso:

- use nomes curtos para as etapas;
- evite colocar texto demais em `data`;
- mantenha a ordem cronologica.

### Feira

Conteudo principal:

- `Feira`

Componentes:

- `visaoGeral`
- `cronograma`
- `programacao`

Como editar:

- use `visaoGeral` para contexto geral da edicao;
- use `cronograma` para datas, marcos e imagem de apoio;
- use `programacao` para detalhar o que acontece por dia.

Boa pratica:

- preencha o titulo do bloco antes dos itens internos;
- mantenha a mesma estrutura de datas em todos os blocos;
- use imagens com texto alternativo claro.

### FEMICTEC

Conteudo principal:

- `Pagina - FEMICTEC`

Componentes:

- `menuInterno`
- `apresentacao`
- `quemRealiza`
- `historico`

Como editar:

- `menuInterno` define navegacao interna da pagina;
- `apresentacao` concentra a introducao e os blocos de destaque;
- `quemRealiza` agrega organizacao e parceiros;
- `historico` guarda a memoria institucional, edicoes e tabela de referencias.

Boa pratica:

- se a pagina ficou pesada de editar, foque em um componente por vez;
- revise os textos longos com mais cuidado do que os campos curtos;
- em blocos com imagem, sempre confira o `alt`.

### FAQ

Conteudo principal:

- `Perguntas Frequentes`

Como editar:

- preencha `titulo` e `subtitulo`;
- adicione perguntas na lista repetivel;
- cada item da lista deve ter pergunta e resposta claras.

Boa pratica:

- escreva perguntas como um usuario faria;
- responda sem repetir demais o titulo da pagina;
- evite perguntas muito genericas.

### Contato

Conteudo principal:

- `Contato`

Componentes:

- `destinatariosEvento`

Campos importantes:

- titulo, subtitulo e descricao;
- e-mail e telefone;
- destinatarios para notificacoes;
- templates de confirmacao e notificacao.

Boa pratica:

- antes de publicar, confira se os destinatarios estao corretos;
- se os templates forem usados pelo frontend, mantenha placeholders consistentes;
- qualquer mudanca no e-mail de destino precisa ser validada com atencao.

### Mensagens de Contato

Conteudo principal:

- `Mensagens Contato`

Como funciona:

- o formulario publico do site cria um registro nesta collection;
- o Strapi envia um e-mail para a equipe configurada no `Contato`;
- o Strapi envia uma confirmacao para o e-mail informado pelo usuario;
- o reply-to do e-mail da equipe aponta para o e-mail do usuario, facilitando a resposta.

Endpoint publico usado pelo site:

- `POST /api/mensagens-contatos/submit`

Campos esperados:

- `nome`
- `email`
- `assunto`
- `mensagem`

Boa pratica:

- confira o e-mail principal do `Contato` antes de publicar;
- mantenha os templates de confirmacao e notificacao consistentes;
- se o envio de e-mail falhar, valide primeiro a configuracao do provider no `config/plugins.ts` e as variaveis `EMAIL_*`.

### Conteudos institucionais

Conteudos comuns:

- `Home - Banner`
- `Global - Footer`
- `Global - Navbar`
- `Localizacao`
- `Home - Dado Institucional`
- `Termo de Uso`
- `Regulamento`
- `Politica de Privacidade`

Boa pratica:

- mantenha o tom institucional uniforme;
- evite duplicar informacoes entre paginas;
- imagens de marca devem ter nomes e `alt` consistentes.

### Integracao externa

Conteudos importados da Plataforma Conecta:

- `Projeto`
- `Resultado`

Como funciona:

- os registros entram por sincronizacao manual;
- a importacao nao publica automaticamente;
- a liberacao final continua sendo editorial no Strapi.

Campos editoriais locais:

- `descricao`
- `imagem`
- `arquivo` no `Resultado`
- `categoria` no `Resultado`

## Regras de preenchimento

### Titulo e subtitulo

- use frases curtas quando o campo for exibido em cards;
- use texto mais explicativo em paginas internas;
- mantenha a mesma grafia para nomes institucionais.

### Datas

- use um padrao unico no projeto inteiro;
- se o texto for exibido ao usuario, confirme a leitura no frontend;
- nao misture formatos diferentes na mesma secao.

### Imagens

- use imagens otimizadas;
- preencha o campo alternativo sempre que houver;
- confirme se a midia foi carregada no item certo.

### Blocos repetiveis

- crie um item por vez;
- evite blocos vazios;
- revise a ordem final antes de publicar.

## Checklist rapido antes de publicar

- conferir se o conteudo esta no tipo certo;
- conferir obrigatoriedade dos campos;
- revisar ortografia;
- revisar datas;
- revisar imagens e `alt`;
- validar ordem dos blocos;
- publicar e testar no frontend.

## Erros comuns

- salvar o conteudo mas esquecer de publicar;
- editar um componente repetivel fora de ordem;
- preencher uma data em formato inconsistente;
- deixar imagem sem contexto;
- alterar um texto e nao revisar o efeito no frontend.

## Testes operacionais desta analise

Veja o registro executado em [docs/OPERACOES-STRAPI.md](./OPERACOES-STRAPI.md).
