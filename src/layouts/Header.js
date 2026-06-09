import React, { useState, useEffect, Fragment } from "react";
import { useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  IconButton
} from "@mui/material";
import { io } from "socket.io-client";
import useToast from "../hooks/useToast";
import BreadCrumb from "../components/BreadCrumb";
import Navigation from "../Navigation";
import { Images } from "../assets/images/Images"
import { LockReset, Logout, Notifications, Person } from "@mui/icons-material";
import colors from "../assets/styles/colors";

export default function Header() {
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { pathname } = useLocation();
  const { showToast } = useToast();
  const Logo = Images.headerLogo;

  const socket = io("http://localhost:3030", {
    transports: ["websocket"],
  });

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
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    socket.on("new-order", (data) => {
      showToast(data.message, "success");
    });

    return () => socket.off("new-order");
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
        <MenuItem onClick={handleClose}>
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
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          boxShadow: "none"
        }}
      >
        <Toolbar>
          <Toolbar sx={{ width: "228px" }} />
          {auth && (
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
                  sx={{
                    background: colors.white,
                    border: `1px solid ${colors.white}`,
                    ":hover": {
                      background: "transparent",
                      border: `1px solid ${colors.white}`,
                      "svg": {
                        fill: colors.white
                      }
                    }
                  }}
                >
                  <Notifications sx={{ fontSize: "18px" }} />
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
          )}
        </Toolbar>
      </AppBar>
    </Fragment>
  );
}
