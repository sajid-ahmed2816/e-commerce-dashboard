import React, { useState, useEffect, Fragment, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Badge
} from "@mui/material";
import { LockReset, Logout, Notifications, Person } from "@mui/icons-material";
import { io } from "socket.io-client";
import useToast from "../hooks/useToast";
import BreadCrumb from "../components/BreadCrumb";
import Navigation from "../Navigation";
import { Images } from "../assets/images/Images";
import NotificationServices from "../api/Notification/NotificationServices";
import colors from "../assets/styles/colors";
import useAuth from "../hooks/useAuth";
import moment from "moment";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showToast } = useToast();
  const { userLogout } = useAuth();
  const Logo = Images.headerLogo;

  const currentPageObj = Navigation.find((nav) =>
    nav?.routes?.some((route) => {
      if (route.includes(":id")) {
        const baseRoute = route.replace("/:id", "");
        return pathname.startsWith(baseRoute);
      }
      return route === pathname;
    })
  );

  let currentPage = null;

  if (currentPageObj) {
    const index = currentPageObj.routes?.findIndex((route) => {
      if (route.includes(":id")) {
        const baseRoute = route.replace("/:id", "");
        return pathname.startsWith(baseRoute);
      }
      return route === pathname;
    });

    if (
      typeof index === "number" &&
      index >= 0 &&
      currentPageObj.routesLabel &&
      currentPageObj.routesLabel[index]
    ) {
      currentPage = currentPageObj.routesLabel[index];
    } else {
      currentPage = currentPageObj.label;
    }
  };

  const open = Boolean(anchorEl);
  const notiOpen = Boolean(notificationEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuClose = () => {
    setNotificationEl(null);
  };

  const getNotificationsAndCount = async () => {
    try {
      const [result, { count }] = await Promise.all([NotificationServices.getNotifications(), NotificationServices.getUnreadCount()]);
      setNotifications(result);
      setUnreadCount(count);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await NotificationServices.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      showToast(error.message, "error");
    };
  };

  const handleNotificationItemClick = async (data) => {
    try {
      await NotificationServices.markAsRead(data?._id);
      setNotifications(prev =>
        prev.map(n => n._id === data?._id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
    handleNotificationMenuClose();
    navigate(`/orders/order-detail/${data?.orderId}`);
  };

  const handleNotificationClick = (event) => {
    setNotificationEl(event.currentTarget);
    if (unreadCount > 0) {
      markAllAsRead()
    };
  };

  useEffect(() => {
    // Initialize socket
    socketRef.current = io("http://localhost:3030", {
      transports: ["websocket"],
    });
    const socket = socketRef.current;

    // Fetch initial data
    getNotificationsAndCount();

    // Socket event listeners
    socket.on('new-notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      showToast(newNotif.message, 'info');
    });

    socket.on("new-order", (data) => {
      showToast(data.message, "success");
    });

    // Cleanup on unmount
    return () => {
      socket.off("new-order");
      socket.off('new-notification');
      socket.disconnect();
    };
  }, []);

  return (
    <Fragment>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 0.75,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <LockReset />
            <Typography>
              Change Password
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          onClick={() => {
            showToast("Logout Successfully", "success");
            userLogout();
            navigate("/login");
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <Logout />
            <Typography>
              Logout
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={notificationEl}
        open={notiOpen}
        onClose={handleNotificationMenuClose}
        slotProps={{
          paper: {
            sx: {
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 0.75,
              maxHeight: 700,
              width: 400,
              p: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif._id}
              onClick={() => handleNotificationItemClick(notif)}
              sx={{
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                backgroundColor: notif.read ? 'transparent' : 'rgba(0,0,0,0.04)',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={notif.read ? 'normal' : 'bold'}>
                  {notif.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {moment(notif.createdAt).format("DD/MM/YYYY hh:mm A")}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        {/* <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            // Optionally navigate to a "All Notifications" page
          }}
          sx={{ justifyContent: 'center' }}
        >
          <Typography variant="body2" color="primary">View all</Typography>
        </MenuItem> */}
      </Menu>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          boxShadow: "none"
        }}
      >
        <Toolbar>
          <Toolbar sx={{ width: "228px" }} />
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <BreadCrumb currentPage={currentPage} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  background: colors.white,
                  border: `1px solid ${colors.white}`,
                  ":hover": {
                    background: "transparent",
                    border: `1px solid ${colors.white}`,
                    "svg": { fill: colors.white }
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications sx={{ fontSize: "18px" }} />
                </Badge>
              </IconButton>
              <IconButton
                onClick={handleClick}
                sx={{
                  background: colors.white,
                  border: `1px solid ${colors.white}`,
                  ":hover": {
                    background: "transparent",
                    border: `1px solid ${colors.white},`,
                    "svg": {
                      fill: colors.white
                    }
                  }
                }}
              >
                <Person sx={{ fontSize: "18px" }} />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Fragment>
  );
}
