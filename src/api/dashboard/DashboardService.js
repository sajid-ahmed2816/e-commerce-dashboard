import { get } from "../index";
import Routes from "./Routes";

const DashboardServices = {
  getStats: async (params) => {
    const result = await get(Routes.getStats, params);
    return result;
  },
};

export default DashboardServices;