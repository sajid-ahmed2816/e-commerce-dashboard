import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const ProductVariantServices = {
  createProductVariant: async (obj) => {
    const result = await post(Routes.createProductVariant, obj);
    return result;
  },

  getAllVaraints: async (params) => {
    const result = await get(Routes.getAllVariants, params);
    return result;
  },

  getProductVariantById: async (id) => {
    const result = await get(Routes.getProductVariantById + `/${id}`);
    return result;
  },

  updateProductVariant: async (id, obj) => {
    const result = await patch(Routes.updateProductVariant + `/${id}`, obj);
    return result;
  },

  deleteProductVariant: async (id, obj) => {
    console.log("🚀 ~ obj:", obj)
    const result = await deleted(Routes.deleteProductVariant + `/${id}`, obj);
    return result;
  },
};

export default ProductVariantServices;