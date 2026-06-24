import { get, put } from "../index";
import Routes from "./Routes";

const NotificationServices = {
  getNotifications: async () => {
    const result = await get(Routes.getNotifications);
    return result;
  },

  getUnreadCount: async () => {
    const result = await get(Routes.getUnreadCound);
    return result;
  },

  markAsRead: async (id) => {
    const result = await put(Routes.markAsRead(id));
    return result;
  },

  markAllAsRead: async () => {
    const result = await put(Routes.markAllAsRead);
    return result;
  },
};

export default NotificationServices;