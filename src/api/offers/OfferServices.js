import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const OfferServices = {
createOffer: async (obj) => {
    const result = await post(Routes.createOffer, obj);
    return result;
  },

  getOffers: async (params) => {
    const result = await get(Routes.getOffers, params);
    return result;
  },

  updateOffer: async (id, obj) => {
    const result = await patch(Routes.updateOffer + `/${id}`, obj);
    return result;
  },

  updateStatus: async (id, obj) => {
    const result = await patch(Routes.updateStatus + `/${id}`, obj);
    return result;
  },

  deleteOffer: async (id) => {
    const result = await deleted(Routes.deleteOffer + `/${id}`);
    return result;
  },
};

export default OfferServices;