import { post } from "../index";
import AuthRoutes from "./auth.routes"

const AuthServices = {
  login: async (obj) => {
    const result = await post(AuthRoutes.login, obj);
    return result;
  }
}

export default AuthServices;