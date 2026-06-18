import { get, deleted } from "../index";
import Routes from "./Routes";

const ProductServices = {
  getOrders: async (params) => {
    const result = await get(Routes.getOrders, params);
    return result;
  },

  getOrderDetailById: async (id) => {
    const result = await get(`${Routes.getOrderDetailById}/${id}`);
    return result;
  },

  deleteOrder: async (id) => {
    const result = await deleted(Routes.deleteOrder + `/${id}`);
    return result;
  },
};

export default ProductServices;