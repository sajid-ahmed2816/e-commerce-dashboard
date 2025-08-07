import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const CategoryServices = {
  createCategory: async (obj) => {
    const result = await post(Routes.createCategory, obj);
    return result;
  },

  getCategories: async (params) => {
    const result = await get(Routes.getCategories, params);
    return result;
  },

  updateCategory: async (id, obj) => {
    const result = await patch(Routes.updateCategory + `/${id}`, obj);
    return result;
  },

  deleteCategory: async (id) => {
    const result = await deleted(Routes.deleteCategory + `/${id}`);
    return result;
  },
};

export default CategoryServices;