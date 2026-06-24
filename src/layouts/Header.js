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
  Badge,
  Grid
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
import Dialog from "../components/Dialog";
import PrimaryButton, { SecondaryButton } from "../components/Button";
import AuthServices from "../api/auth/AuthServices";
import { useForm } from 'react-hook-form';
import Loader from "../components/Loader";
import InputField from "../components/InputField";

const ChangePasswordDialog = ({ open, handleClose }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [oldPasswordValid, setOldPasswordValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const oldPasswordValue = watch("oldPassword");
  const newPasswordValue = watch("newPassword");
  const confirmPasswordValue = watch("confirmPassword");

  // Debounce old password validation
  useEffect(() => {
    if (!oldPasswordValue || oldPasswordValue.length < 6) {
      setOldPasswordError("");
      setOldPasswordValid(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const obj = { oldPassword: oldPasswordValue }
      try {
        const result = await AuthServices.validatePassword(obj);
        if (result.status && result.data.valid) {
          setOldPasswordError("");
          setOldPasswordValid(true);
          clearErrors("oldPassword");
        } else {
          setOldPasswordError("Old password is incorrect");
          setOldPasswordValid(false);
          setError("oldPassword", { type: "manual", message: "Old password is incorrect" });
        }
      } catch (err) {
        setOldPasswordError("Validation failed");
        setOldPasswordValid(false);
      } finally {
        setIsChecking(false);
      }
    }, 500); // debounce delay

    return () => clearTimeout(timer);
  }, [oldPasswordValue, setError, clearErrors]);

  // Confirm password validation (frontend only)
  const validateConfirmPassword = (value) => {
    console.log("🚀 ~ validateConfirmPassword ~ value:", value)
    if (value !== newPasswordValue) {
      return "Passwords do not match";
    }
    return true;
  };

  // New password strength (optional)
  const validateNewPassword = (value) => {
    console.log("🚀 ~ validateNewPassword ~ value:", value)
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    // Optional: add regex for complexity
    // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    //   return "Password must contain uppercase, lowercase and number";
    // }
    return true;
  };

  const onSubmit = async (data) => {
    if (!oldPasswordValid) {
      showToast("Please enter a valid old password", "error");
      return;
    }
    const obj = { oldPassword: data.oldPassword, newPassword: data.newPassword }
    setIsLoading(true);
    try {
      const result = await AuthServices.changePassword(obj);
      if (result.status) {
        showToast(result.message, "success");
        reset();
        handleClose();
      } else {
        showToast(result.message, "error");
        // If backend says old password wrong, reset validation
        if (result.message.toLowerCase().includes("old password")) {
          setOldPasswordError("Old password is incorrect");
          setOldPasswordValid(false);
          setError("oldPassword", { type: "manual", message: "Old password is incorrect" });
        }
      }
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      oldPasswordValid &&
      !errors.oldPassword &&
      !errors.newPassword &&
      !errors.confirmPassword &&
      newPasswordValue &&
      confirmPasswordValue &&
      newPasswordValue === confirmPasswordValue
    );
  };

  return (
    <Dialog
      open={open}
      handleClose={handleClose}
      maxWidth="sm"
      fullWidth
      component={"form"}
      onSubmit={handleSubmit(onSubmit)}
      title={"Change Password"}
    >
      <Grid item xs={12}>
        <InputField
          label="Old Password"
          type="password"
          fullWidth
          value={watch("oldPassword")}
          register={register("oldPassword", {
            required: "Old password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={!!errors.oldPassword || !!oldPasswordError}
          helperText={errors.oldPassword?.message || oldPasswordError || (isChecking ? "Checking..." : "")}
          InputProps={{
            endAdornment: isChecking && <Loader />,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <InputField
          label="New Password"
          type="password"
          fullWidth
          value={watch("newPassword")}
          register={register("newPassword", {
            required: "New password is required",
            validate: validateNewPassword,
          })}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
        />
      </Grid>
      <Grid item xs={12}>
        <InputField
          label="Confirm New Password"
          type="password"
          fullWidth
          value={watch("confirmPassword")}
          register={register("confirmPassword", {
            required: "Confirm password is required",
            validate: validateConfirmPassword,
          })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <SecondaryButton title={"Cancel"} onClick={handleClose} fullWidth />
          </Grid>
          <Grid item xs={6}>
            <PrimaryButton
              type="submit"
              title={isLoading ? <Loader /> : "Update Password"}
              disabled={!isFormValid() || isSubmitting || isLoading}
              fullWidth
            />
          </Grid>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialog] = useState(false);
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

  const handleChangePasswordDialog = () => {
    setIsChangePasswordDialog(prev => !prev);
  }

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
      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        handleClose={handleChangePasswordDialog}
      />
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
        <MenuItem onClick={() => {
          handleClose();
          handleChangePasswordDialog();
        }}>
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
