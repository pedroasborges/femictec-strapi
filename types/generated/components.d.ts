import type { Schema, Struct } from '@strapi/strapi';

export interface AtividadeItemAtividades extends Struct.ComponentSchema {
  collectionName: 'components_atividade_item_atividades';
  info: {
    displayName: 'atividades';
  };
  attributes: {};
}

export interface EdicaoCardEdicoesCards extends Struct.ComponentSchema {
  collectionName: 'components_edicao_card_edicoes_cards';
  info: {
    displayName: 'edicoesCards';
  };
  attributes: {};
}

export interface FeiraAtividadeItem extends Struct.ComponentSchema {
  collectionName: 'components_feira_atividade_items';
  info: {
    displayName: 'atividade-item';
  };
  attributes: {
    hotario: Schema.Attribute.String;
    titulo: Schema.Attribute.String;
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

export interface FeiraProgramacaoDia extends Struct.ComponentSchema {
  collectionName: 'components_feira_programacao_dias';
  info: {
    displayName: 'programacao-dia';
  };
  attributes: {
    atividades: Schema.Attribute.Component<'atividade-item.atividades', false>;
    data: Schema.Attribute.String;
    dia: Schema.Attribute.String;
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
      'edicao-card.edicoes-cards': EdicaoCardEdicoesCards;
      'feira.atividade-item': FeiraAtividadeItem;
      'feira.cronograma-item': FeiraCronogramaItem;
      'feira.programacao-dia': FeiraProgramacaoDia;
      'femictec.edicao-card': FemictecEdicaoCard;
      'femictec.historico-linha': FemictecHistoricoLinha;
      'femictec.parceiro-item': FemictecParceiroItem;
      'historico-linha.historico-tabela-linhas': HistoricoLinhaHistoricoTabelaLinhas;
      'parceiro-item.parceiros': ParceiroItemParceiros;
    }
  }
}
