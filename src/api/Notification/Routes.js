const Routes = {
  getNotifications: "/notifications/all-notifications",
  getUnreadCound: "/notifications/unread-count",
  markAsRead: (id) => `/notifications/${id}/read`,
  markAllAsRead: "/notifications/read-all"
};

export default Routes;