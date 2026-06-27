# Configuração de E-mail de Produção no Strapi

Este guia descreve o passo 1 para colocar o envio de e-mail do formulário de contato em produção, usando o Strapi como ponto central.

## Objetivo

Fazer o Strapi:

- receber a mensagem do formulário;
- enviar um e-mail para os destinatários institucionais definidos no `Contato`;
- enviar uma confirmação para o e-mail informado pelo usuário;
- usar um SMTP real, não um servidor local de teste.

## Pré-requisitos

- Strapi rodando com acesso ao painel administrativo;
- content type `Contato` publicado;
- acesso às credenciais de um servidor SMTP real;
- variáveis de ambiente editáveis no ambiente do Strapi.

## 1) Escolha o provedor SMTP

O Strapi do projeto usa o provider `nodemailer`.

Exemplos de SMTP real:

- SMTP da instituição;
- Microsoft 365;
- Google Workspace;
- relay corporativo.

O `smtp4dev` só serve para teste local. Ele não entrega mensagens nas caixas reais.

## 2) Configure as variáveis de ambiente

No `.env` do Strapi, ajuste os valores abaixo:

```env
EMAIL_PROVIDER=nodemailer
EMAIL_DEFAULT_FROM=nao-responder@femictec.com.br
EMAIL_DEFAULT_REPLY_TO=nao-responder@femictec.com.br
EMAIL_SMTP_HOST=mail.suaempresa.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=false
EMAIL_SMTP_IGNORE_TLS=false
EMAIL_SMTP_USER=usuario@suaempresa.com
EMAIL_SMTP_PASS=sua_senha_ou_token
EMAIL_SMTP_REJECT_UNAUTHORIZED=true
```

Observações:

- use `EMAIL_SMTP_SECURE=true` se o provedor exigir TLS direto na porta SSL, como 465;
- use `EMAIL_SMTP_IGNORE_TLS=false` em produção;
- se o SMTP exigir autenticação, preencha `EMAIL_SMTP_USER` e `EMAIL_SMTP_PASS`.

## 3) Confirme o plugin de e-mail

O projeto já usa `nodemailer` em `config/plugins.ts`.

Se precisar revisar, a configuração principal fica em:

- `config/plugins.ts`

## 4) Preencha o single type `Contato`

No admin do Strapi:

- confirme o e-mail institucional principal em `Contato.email`;
- revise `destinatariosEvento` se houver mais de um destino;
- revise os templates de notificação e confirmação.

## 5) Reinicie o Strapi

Depois de alterar o `.env`:

```bash
npm run dev
```

ou o comando equivalente do teu ambiente.

## 6) Teste o fluxo

1. Abra o formulário do Next em `/contato`.
2. Envie uma mensagem de teste.
3. Verifique se o Strapi grava a mensagem.
4. Verifique se o SMTP real entrega:
   - um e-mail para o destinatário institucional;
   - um e-mail de confirmação para o usuário.

## 7) Validação rápida

Se quiser validar só a conexão SMTP:

- confira os logs do Strapi ao enviar o formulário;
- confirme que o SMTP aceita conexão na porta configurada;
- confira se o provedor exige senha de app, OAuth ou autenticação especial.

## Checklist final

- `EMAIL_PROVIDER=nodemailer`
- `EMAIL_SMTP_HOST` correto
- `EMAIL_SMTP_PORT` correto
- `EMAIL_SMTP_SECURE` correto
- `EMAIL_SMTP_USER` configurado, se necessário
- `EMAIL_SMTP_PASS` configurado, se necessário
- `Contato.email` publicado e válido
- formulário do Next enviando para `POST /api/mensagens-contatos/submit`

