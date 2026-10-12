import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const AttributeValueServices = {
  createAttributeValue: async (obj) => {
    const result = await post(Routes.createAttributeValue, obj);
    return result;
  },

  getAttributeValues: async (params) => {
    const result = await get(Routes.getAttributeValues, params);
    return result;
  },

  updateAttributeValue: async (id, obj) => {
    const result = await patch(Routes.updateAttributeValue + `/${id}`, obj);
    return result;
  },

  updateStatus: async (id, obj) => {
    const result = await patch(Routes.updateStatus + `/${id}`, obj);
    return result;
  },

  deleteAttributeValue: async (id) => {
    const result = await deleted(Routes.deleteAttributeValue + `/${id}`);
    return result;
  },
};

export default AttributeValueServices;