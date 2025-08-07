import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const BannerServices = {
  createBanner: async (obj) => {
    const result = await post(Routes.createBanner, obj);
    return result;
  },

  getBanners: async (params) => {
    const result = await get(Routes.createBanner, params);
    return result;
  },

  updateBanner: async (id, obj) => {
    const result = await patch(Routes.updateBanner + `/${id}`, obj);
    return result;
  },

  deleteBanner: async (id) => {
    const result = await deleted(Routes.deleteBanner + `/${id}`);
    return result;
  },
};

export default BannerServices;