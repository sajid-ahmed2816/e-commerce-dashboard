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
  Collapse
} from "@mui/material";
import { ExpandLess, ExpandMore, Adjust } from "@mui/icons-material";
import Navigation from "../Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import colors from "../assets/styles/colors";
import "@fontsource/comfortaa";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

const drawerWidth = 290;

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
      PaperProps={{
        elevation: 4
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 278,
          boxSizing: "border-box",
          background: colors.primary,
          top: 76,
          height: "calc(100vh - 86px)",
          border: "none",
          borderRadius: "6px",
          ml: "12px"
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {/* <Toolbar /> */}
      <List
        sx={{
          p: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1
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
                <ListItemText primary={item.label} sx={{ "& .MuiTypography-root": { fontFamily: "Comfortaa" } }} />
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
                background: pathname == item.routes[index] ? colors.white : colors.primary,
                color: pathname == item.routes[index] ? colors.primary : colors.white,
                borderRadius: "4px",
                gap: 1,
                "svg": {
                  "path": {
                    fill: pathname == item.routes[index] ? colors.primary : colors.white,
                  },
                  "circle": {
                    fill: pathname == item.routes[index] ? colors.primary : colors.white,
                  }
                },
                ":hover": {
                  background: colors.white,
                  color: colors.primary,
                  "svg": {
                    "path": {
                      fill: colors.primary
                    },
                    "circle": {
                      fill: colors.primary
                    }
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: "25px" }}>{item.icon}</ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
