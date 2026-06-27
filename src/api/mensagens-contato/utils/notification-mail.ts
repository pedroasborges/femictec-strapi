const CONTATO_UID = 'api::contato.contato';

const REQUIRED_FIELDS = ['nome', 'email', 'assunto', 'mensagem'] as const;

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeEmail = (value: unknown): string | null => {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(text) ? text : null;
};

const normalizeEmailList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const emails = value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as { email?: unknown };
      return normalizeEmail(record.email);
    })
    .filter((item): item is string => Boolean(item));

  return Array.from(new Set(emails.map((item) => item.toLowerCase())));
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatTemplate = (template: string, context: Record<string, string>) =>
  template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}|\{([a-zA-Z0-9_]+)\}/g, (_match, doubleKey: string, singleKey: string) => {
    const key = doubleKey || singleKey;
    return context[key] ?? '';
  });

const toHtml = (text: string) =>
  `<div style="font-family: Arial, sans-serif; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(text)}</div>`;

const normalizeRequiredMessageBody = (body: Record<string, unknown>) => {
  const normalized = {
    nome: normalizeText(body.nome),
    email: normalizeEmail(body.email),
    assunto: normalizeText(body.assunto),
    mensagem: normalizeText(body.mensagem),
  };

  const missing = REQUIRED_FIELDS.filter((field) => !normalized[field]);
  if (missing.length > 0) {
    return {
      error: `Campos obrigatorios ausentes ou invalidos: ${missing.join(', ')}.`,
      value: null,
    };
  }

  return {
    error: null,
    value: normalized as {
      nome: string;
      email: string;
      assunto: string;
      mensagem: string;
    },
  };
};

const getContatoSettings = async (strapi: any) => {
  const contato = await strapi.entityService.findMany(CONTATO_UID, {
    publicationState: 'live',
    limit: 1,
    populate: {
      destinatariosEvento: true,
    },
  });

  return Array.isArray(contato) ? contato[0] ?? null : contato ?? null;
};

const buildRecipientList = (contato: Record<string, unknown> | null) => {
  if (!contato) {
    return [];
  }

  const recipients = new Set<string>();

  const mainEmail = normalizeEmail(contato.email);
  if (mainEmail) {
    recipients.add(mainEmail.toLowerCase());
  }

  for (const email of normalizeEmailList(contato.destinatariosEvento)) {
    recipients.add(email.toLowerCase());
  }

  return Array.from(recipients);
};

const resolveSenderEmail = (contato: Record<string, unknown> | null) => {
  return (
    normalizeEmail(contato?.email) ??
    normalizeEmail(process.env.EMAIL_FROM) ??
    normalizeEmail(process.env.EMAIL_DEFAULT_FROM) ??
    'nao-responder@femictec.com.br'
  );
};

const buildAdminTemplates = (
  contato: Record<string, unknown> | null,
  payload: { nome: string; email: string; assunto: string; mensagem: string }
) => {
  const context = {
    nome: payload.nome,
    email: payload.email,
    assunto: payload.assunto,
    mensagem: payload.mensagem,
  };

  const subjectTemplate = normalizeText(contato?.notificacaoAssuntoTemplate);
  const messageTemplate = normalizeText(contato?.notificacaoMensagemTemplate);

  return {
    subject: subjectTemplate
      ? formatTemplate(subjectTemplate, context)
      : `Nova mensagem de contato - ${payload.assunto}`,
    text: messageTemplate
      ? formatTemplate(messageTemplate, context)
      : [
          'Uma nova mensagem foi enviada pelo formulario de contato.',
          '',
          `Nome: ${payload.nome}`,
          `E-mail: ${payload.email}`,
          `Assunto: ${payload.assunto}`,
          '',
          'Mensagem:',
          payload.mensagem,
        ].join('\n'),
  };
};

const buildConfirmationTemplates = (
  contato: Record<string, unknown> | null,
  payload: { nome: string; email: string; assunto: string; mensagem: string }
) => {
  const context = {
    nome: payload.nome,
    email: payload.email,
    assunto: payload.assunto,
    mensagem: payload.mensagem,
  };

  const subjectTemplate = normalizeText(contato?.confirmacaoAssuntoTemplate);
  const messageTemplate = normalizeText(contato?.confirmacaoMensagemTemplate);

  return {
    subject: subjectTemplate
      ? formatTemplate(subjectTemplate, context)
      : `Recebemos sua mensagem - ${payload.assunto}`,
    text: messageTemplate
      ? formatTemplate(messageTemplate, context)
      : [
          `Ola, ${payload.nome}.`,
          '',
          'Recebemos sua mensagem e vamos responder em breve.',
          '',
          `Assunto: ${payload.assunto}`,
          '',
          'Mensagem recebida:',
          payload.mensagem,
        ].join('\n'),
  };
};

const getEmailService = (strapi: any) => {
  const emailPlugin = strapi.plugin?.('email');
  const emailService = emailPlugin?.service?.('email');

  if (!emailService || typeof emailService.send !== 'function') {
    throw new Error('Plugin de e-mail nao configurado no Strapi.');
  }

  return emailService;
};

export const submitContactMessage = async (
  strapi: any,
  body: Record<string, unknown>
) => {
  const normalized = normalizeRequiredMessageBody(body);
  if (normalized.error || !normalized.value) {
    return {
      error: normalized.error ?? 'Dados invalidos.',
      status: 400,
      data: null,
    };
  }

  const contato = (await getContatoSettings(strapi)) as Record<string, unknown> | null;
  const recipients = buildRecipientList(contato);
  if (recipients.length === 0) {
    return {
      error: 'Nenhum destinatario de contato esta configurado no Strapi.',
      status: 500,
      data: null,
    };
  }

  const created = await strapi.entityService.create('api::mensagens-contato.mensagens-contato', {
    data: {
      nome: normalized.value.nome,
      email: normalized.value.email,
      assunto: normalized.value.assunto,
      mensagem: normalized.value.mensagem,
    },
  });

  const emailService = getEmailService(strapi);
  const fromEmail = resolveSenderEmail(contato);
  const adminTemplates = buildAdminTemplates(contato, normalized.value);
  const confirmationTemplates = buildConfirmationTemplates(contato, normalized.value);

  await emailService.send({
    to: recipients,
    from: fromEmail,
    replyTo: normalized.value.email,
    subject: adminTemplates.subject,
    text: adminTemplates.text,
    html: toHtml(adminTemplates.text),
  });

  await emailService.send({
    to: normalized.value.email,
    from: fromEmail,
    subject: confirmationTemplates.subject,
    text: confirmationTemplates.text,
    html: toHtml(confirmationTemplates.text),
  });

  return {
    error: null,
    status: 201,
    data: created,
  };
};
