import { post } from "../index";
import AuthRoutes from "./auth.routes"

const AuthServices = {
  login: async (obj) => {
    const result = await post(AuthRoutes.login, obj);
    return result;
  },

  validatePassword: async (obj) => {
    const result = await post(AuthRoutes.validatePassword, obj);
    return result
  },

  changePassword: async (obj) => {
    const result = await post(AuthRoutes.changePassword, obj);
    return result
  }
}

export default AuthServices;