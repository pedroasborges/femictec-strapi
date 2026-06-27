import type { Schema, Struct } from '@strapi/strapi';

export interface AtividadeItemAtividades extends Struct.ComponentSchema {
  collectionName: 'components_atividade_item_atividades';
  info: {
    displayName: 'atividades';
  };
  attributes: {};
}

export interface ContatoDestinatarioEmail extends Struct.ComponentSchema {
  collectionName: 'components_contato_destinatario_emails';
  info: {
    displayName: 'destinatario-email';
  };
  attributes: {
    email: Schema.Attribute.Email;
    nome: Schema.Attribute.String;
  };
}

export interface EdicaoCardEdicoesCards extends Struct.ComponentSchema {
  collectionName: 'components_edicao_card_edicoes_cards';
  info: {
    displayName: 'edicoesCards';
  };
  attributes: {};
}

export interface FaqPerguntaFaq extends Struct.ComponentSchema {
  collectionName: 'components_faq_perguntas';
  info: {
    displayName: 'Pergunta FAQ';
  };
  attributes: {
    pergunta: Schema.Attribute.String;
    resposta: Schema.Attribute.Text;
  };
}

export interface FeiraAtividadeItem extends Struct.ComponentSchema {
  collectionName: 'components_feira_atividade_items';
  info: {
    displayName: 'atividade-item';
  };
  attributes: {
    horario: Schema.Attribute.String;
    titulo: Schema.Attribute.String;
  };
}

export interface FeiraCronograma extends Struct.ComponentSchema {
  collectionName: 'components_feira_cronogramas';
  info: {
    displayName: 'cronograma';
  };
  attributes: {
    cronogramaItens: Schema.Attribute.Component<'feira.cronograma-item', true>;
    cronogramaTitulo: Schema.Attribute.String;
    dataRealizacao: Schema.Attribute.String;
    mapaImagem: Schema.Attribute.Media<'images'>;
    mapaImagemAlt: Schema.Attribute.String;
  };
}

export interface FeiraCronogramaItem extends Struct.ComponentSchema {
  collectionName: 'components_feira_cronograma_items';
  info: {
    displayName: 'cronograma-item';
  };
  attributes: {
    atividade: Schema.Attribute.String;
    data: Schema.Attribute.String;
  };
}

export interface FeiraProgramacao extends Struct.ComponentSchema {
  collectionName: 'components_feira_programacaos';
  info: {
    displayName: 'programacao';
  };
  attributes: {
    programacaoDias: Schema.Attribute.Component<'feira.programacao-dia', true>;
    programacaoTitulo: Schema.Attribute.String;
  };
}

export interface FeiraProgramacaoDia extends Struct.ComponentSchema {
  collectionName: 'components_feira_programacao_dias';
  info: {
    displayName: 'programacao-dia';
  };
  attributes: {
    atividades: Schema.Attribute.Component<'feira.atividade-item', true>;
    data: Schema.Attribute.String;
    dia: Schema.Attribute.String;
  };
}

export interface FeiraVisaoGeral extends Struct.ComponentSchema {
  collectionName: 'components_feira_visao_gerals';
  info: {
    displayName: 'visao-geral';
  };
  attributes: {
    edicaoDescricao: Schema.Attribute.Text;
    edicaoTitulo: Schema.Attribute.String;
    objetivosDescricao: Schema.Attribute.Text;
    objetivosTitulo: Schema.Attribute.String;
    regulamentoLabel: Schema.Attribute.String;
    regulamentoTitulo: Schema.Attribute.String;
    regulamentoUrl: Schema.Attribute.String;
    tematicaImagem: Schema.Attribute.Media<'images'>;
    tematicaImagemAlt: Schema.Attribute.String;
  };
}

export interface FemictecApresentacao extends Struct.ComponentSchema {
  collectionName: 'components_femictec_apresentacaos';
  info: {
    displayName: 'apresentacao';
  };
  attributes: {
    bannerDestaque: Schema.Attribute.String;
    bannerImagem: Schema.Attribute.Media<'images'>;
    bannerTitulo: Schema.Attribute.String;
    estandesImagem: Schema.Attribute.Media<'images'>;
    estandesImagemAlt: Schema.Attribute.String;
    estandesSubtitulo: Schema.Attribute.String;
    estandesTitulo: Schema.Attribute.String;
    impactoDescricao: Schema.Attribute.Text;
    impactoTitulo: Schema.Attribute.String;
    missaoDescricao: Schema.Attribute.Text;
    missaoDestaque: Schema.Attribute.String;
    missaoTitulo: Schema.Attribute.String;
    oQueDescricao: Schema.Attribute.Text;
    oQueTitulo: Schema.Attribute.String;
    subtituloPrincipal: Schema.Attribute.String;
    tituloPrincipal: Schema.Attribute.String;
  };
}

export interface FemictecEdicaoCard extends Struct.ComponentSchema {
  collectionName: 'components_femictec_edicao_cards';
  info: {
    displayName: 'edicao-card';
  };
  attributes: {
    imagem: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    subtitulo: Schema.Attribute.String;
    titulo: Schema.Attribute.String;
  };
}

export interface FemictecHistorico extends Struct.ComponentSchema {
  collectionName: 'components_femictec_historicos';
  info: {
    displayName: 'historico';
  };
  attributes: {
    edicoesCards: Schema.Attribute.Component<'femictec.edicao-card', true>;
    galeriaLabel: Schema.Attribute.String;
    galeriaUrl: Schema.Attribute.String;
    historicoDescricao: Schema.Attribute.Text;
    historicoTabelaLinhas: Schema.Attribute.Component<
      'femictec.historico-linha',
      true
    >;
    historicoTabelaTitulo: Schema.Attribute.String;
    historicoTitulo: Schema.Attribute.String;
    trajetoriaImagem: Schema.Attribute.Media<'images'>;
    trajetoriaImagemAlt: Schema.Attribute.String;
    trajetoriaSubtitulo: Schema.Attribute.String;
    trajetoriaTitulo: Schema.Attribute.String;
  };
}

export interface FemictecHistoricoLinha extends Struct.ComponentSchema {
  collectionName: 'components_femictec_historico_linhas';
  info: {
    displayName: 'historico-linha';
  };
  attributes: {
    label: Schema.Attribute.String;
    valor: Schema.Attribute.String;
  };
}

export interface FemictecMenuInterno extends Struct.ComponentSchema {
  collectionName: 'components_femictec_menu_internos';
  info: {
    displayName: 'menu-interno';
  };
  attributes: {
    menuItemHistoricoLabel: Schema.Attribute.String;
    menuItemInicioLabel: Schema.Attribute.String;
    menuItemQuemRealizaLabel: Schema.Attribute.String;
  };
}

export interface FemictecParceiroItem extends Struct.ComponentSchema {
  collectionName: 'components_femictec_parceiro_items';
  info: {
    displayName: 'parceiro-item';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    nome: Schema.Attribute.String;
    siteUrl: Schema.Attribute.String;
  };
}

export interface FemictecQuemRealiza extends Struct.ComponentSchema {
  collectionName: 'components_femictec_quem_realizas';
  info: {
    displayName: 'quem-realiza';
  };
  attributes: {
    comissaoDescricao: Schema.Attribute.Text;
    comissaoTitulo: Schema.Attribute.String;
    imagemEntrada: Schema.Attribute.Media<'images'>;
    imagemEntradaAlt: Schema.Attribute.String;
    imagemEntradaLabel: Schema.Attribute.String;
    organizacaoDescricao: Schema.Attribute.Text;
    organizacaoTitulo: Schema.Attribute.String;
    parceiros: Schema.Attribute.Component<'femictec.parceiro-item', true>;
    parceirosTitulo: Schema.Attribute.String;
    quemRealizaTitulo: Schema.Attribute.String;
  };
}

export interface HistoricoLinhaHistoricoTabelaLinhas
  extends Struct.ComponentSchema {
  collectionName: 'components_historico_linha_historico_tabela_linhas';
  info: {
    displayName: 'historicoTabelaLinhas';
  };
  attributes: {};
}

export interface ParceiroItemParceiros extends Struct.ComponentSchema {
  collectionName: 'components_parceiro_item_parceiros';
  info: {
    displayName: 'parceiros';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'atividade-item.atividades': AtividadeItemAtividades;
      'contato.destinatario-email': ContatoDestinatarioEmail;
      'edicao-card.edicoes-cards': EdicaoCardEdicoesCards;
      'faq.pergunta-faq': FaqPerguntaFaq;
      'feira.atividade-item': FeiraAtividadeItem;
      'feira.cronograma': FeiraCronograma;
      'feira.cronograma-item': FeiraCronogramaItem;
      'feira.programacao': FeiraProgramacao;
      'feira.programacao-dia': FeiraProgramacaoDia;
      'feira.visao-geral': FeiraVisaoGeral;
      'femictec.apresentacao': FemictecApresentacao;
      'femictec.edicao-card': FemictecEdicaoCard;
      'femictec.historico': FemictecHistorico;
      'femictec.historico-linha': FemictecHistoricoLinha;
      'femictec.menu-interno': FemictecMenuInterno;
      'femictec.parceiro-item': FemictecParceiroItem;
      'femictec.quem-realiza': FemictecQuemRealiza;
      'historico-linha.historico-tabela-linhas': HistoricoLinhaHistoricoTabelaLinhas;
      'parceiro-item.parceiros': ParceiroItemParceiros;
    }
  }
}
