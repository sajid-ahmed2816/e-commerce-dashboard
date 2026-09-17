import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const AttributeServices = {
  createAttribute: async (obj) => {
    const result = await post(Routes.createAttribute, obj);
    return result;
  },

  getAttributes: async (params) => {
    const result = await get(Routes.getAttributes, params);
    return result;
  },

  updateAttribute: async (id, obj) => {
    const result = await patch(Routes.updateAttribute + `/${id}`, obj);
    return result;
  },

  updateStatus: async (id, obj) => {
    const result = await patch(Routes.updateStatus + `/${id}`, obj);
    return result;
  },

  deleteAttribute: async (id) => {
    const result = await deleted(Routes.deleteAttribute + `/${id}`);
    return result;
  },
};

export default AttributeServices;