import { get, patch, deleted } from "../index";
import Routes from "./Routes";

const UserServices = {
  getUsers: async (params) => {
    const result = await get(Routes.getUsers, params);
    return result;
  },

  updateUser: async (id, obj) => {
    const result = await patch(Routes.updateUser + `/${id}`, obj);
    return result;
  },

  deleteUser: async (id) => {
    const result = await deleted(Routes.deleteUser + `/${id}`);
    return result;
  },
};

export default UserServices;