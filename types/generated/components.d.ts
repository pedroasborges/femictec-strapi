import type { Schema, Struct } from '@strapi/strapi';

export interface AtividadeItemAtividades extends Struct.ComponentSchema {
  collectionName: 'components_atividade_item_atividades';
  info: {
    displayName: 'atividades';
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'atividade-item.atividades': AtividadeItemAtividades;
      'feira.atividade-item': FeiraAtividadeItem;
      'feira.cronograma-item': FeiraCronogramaItem;
      'feira.programacao-dia': FeiraProgramacaoDia;
    }
  }
}
