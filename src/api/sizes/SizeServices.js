import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const SizeServices = {
  createSize: async (obj) => {
    const result = await post(Routes.createSize, obj);
    return result;
  },

  getSizes: async (params) => {
    const result = await get(Routes.getSizes, params);
    return result;
  },

  updateSize: async (id, obj) => {
    const result = await patch(Routes.updateSize + `/${id}`, obj);
    return result;
  },

  updateStatus: async (id, obj) => {
    const result = await patch(Routes.updateStatus + `/${id}`, obj);
    return result;
  },

  deleteSize: async (id) => {
    const result = await deleted(Routes.deleteSize + `/${id}`);
    return result;
  },
};

export default SizeServices;