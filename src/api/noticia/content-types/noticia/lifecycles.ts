import { syncPublicationDates } from '../../utils/publication';

export default {
  async beforeCreate(event) {
    await syncPublicationDates((globalThis as typeof globalThis & { strapi?: any }).strapi, event);
  },
  async beforeUpdate(event) {
    await syncPublicationDates((globalThis as typeof globalThis & { strapi?: any }).strapi, event);
  },
};

