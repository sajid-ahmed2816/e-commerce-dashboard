import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const ProductServices = {
  createProduct: async (obj) => {
    const result = await post(Routes.createProduct, obj);
    return result;
  },

  getProducts: async (params) => {
    const result = await get(Routes.getProducts, params);
    return result;
  },

  updateProduct: async (id, obj) => {
    const result = await patch(Routes.updateProduct + `/${id}`, obj);
    return result;
  },

  deleteProduct: async (id) => {
    const result = await deleted(Routes.deleteProduct + `/${id}`);
    return result;
  },
};

export default ProductServices;