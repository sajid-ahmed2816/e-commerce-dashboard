import React, { Fragment, useState } from "react";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography
} from "@mui/material";
import { ExpandLess, ExpandMore, Adjust } from "@mui/icons-material";
import Navigation from "../Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import colors from "../assets/styles/colors";
import "@fontsource/comfortaa";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

const drawerWidth = 250;

export default function SideNav() {
  const [expand, setExpand] = useState({});
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userLogout } = useAuth();
  const { showToast } = useToast();

  const handleToggleExpand = (item) => {
    const name = item.label;
    setExpand((prevExpand) => ({
      [name]: !prevExpand[name]
    }));
  }

  const handleItemClick = (item) => {
    console.log("🚀 ~ handleItemClick ~ item:", item)
    if (!item.includes("/logout")) {
      navigate(item);
    } else {
      userLogout();
      navigate("/login");
      showToast("Logged out successfully", "error");
    }
  };

  return (
    <Drawer
      sx={{
        zIndex: 1300,
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
          background: colors.primary,
          border: "none",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <Typography variant="h6" sx={{ flex: 1, color: colors.white }}>
            Fashion Store
          </Typography>
        </Box>
      </Toolbar>
      <List
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 0
        }}
      >
        {Navigation.map((item, index) => item.subMenu ? (
          <Fragment key={index}>
            <ListItem disablePadding={true} onClick={() => handleToggleExpand(item)}>
              <ListItemButton>
                <ListItemIcon
                  sx={{
                    minWidth: "40px"
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiTypography-root": {
                      fontFamily: "Comfortaa",
                    },
                  }}
                />
                {expand[item.label] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={expand[item.label]}>
              {item.subMenu.map((subItem, subInd) => (
                <ListItem key={subInd}>
                  <ListItemButton
                    onClick={() => navigate(subItem.path)}
                    sx={{
                      px: "42px",
                      background: pathname == subItem.path ? colors.white : colors.primary,
                      color: pathname == subItem.path ? colors.primary : colors.white,
                      borderRadius: "4px",
                      "svg": {
                        "path": {
                          fill: pathname == subItem.path ? colors.primary : colors.white,
                        }
                      },
                      ":hover": {
                        background: colors.white,
                        color: colors.primary,
                        "svg": {
                          "path": {
                            fill: colors.primary
                          }
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: "40px",
                      justifyContent: "center"
                    }}>
                      <Adjust sx={{ fontSize: "16px" }} />
                    </ListItemIcon>
                    <ListItemText primary={subItem.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </Collapse>
          </Fragment>
        ) : (
          <ListItem disablePadding={true} key={index}>
            <ListItemButton
              onClick={() => handleItemClick(item.routes[0])}
              sx={{
                background: item.routes.includes(pathname) ? colors.white : colors.primary,
                color: item.routes.includes(pathname) ? colors.primary : colors.white,
                gap: 1,
                "svg": {
                  "path": {
                    fill: item.routes.includes(pathname) ? colors.primary : colors.white,
                  },
                  "circle": {
                    fill: item.routes.includes(pathname) ? colors.primary : colors.white,
                  }
                },
                "::before": {
                  content: "''",
                  width: item.routes.includes(pathname) ? "15px" : "0px",
                  height: "3px",
                  background: colors.primary,
                  transition: "all .3s ease-in-out",
                  borderRadius: "4px"
                },
                borderTop: item.routes.includes(pathname) ? `1px solid ${colors.white}` : `1px solid ${colors.primary}`,
                borderBottom: item.routes.includes(pathname) ? `1px solid ${colors.white}` : `1px solid ${colors.primary}`,
                ":hover": {
                  background: item.routes.includes(pathname) ? colors.white : "transparent",
                  borderTop: `1px solid ${colors.white}`,
                  borderBottom: `1px solid ${colors.white}`,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: "25px" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  "& .MuiTypography-root": {
                    fontFamily: "Comfortaa",
                    fontSize: "14px"
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
