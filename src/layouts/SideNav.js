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
const drawerWidth = 300;

export default function SideNav() {
  const [expand, setExpand] = useState({});
  console.log("🚀 ~ SideNav ~ expand:", expand)
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleToggleExpand = (item) => {
    const name = item.label;
    setExpand((prevExpand) => ({
      [name]: !prevExpand[name]
    }));
  }

  const handleItemClick = (item) => {
    navigate(item.path);
  };
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 290,
          boxSizing: "border-box",
          background: colors.primary,
          top: 76,
          left: 10,
          height: "87.2%",
          boxShadow: "2px 2px 4px -1px rgba(0, 0, 0, 0.2), 4px 4px 5px 0px rgba(0, 0, 0, 0.14), 4px 1px 10px 2px rgba(0, 0, 0, 0.12)",
          border: "none",
          borderRadius: "6px"
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <List
        sx={{
          color: colors.white,
          "svg": {
            "path": {
              fill: colors.white
            },
            "circle": {
              color: colors.white
            }
          }
        }}>
        {Navigation.map((item, index) => item.subMenu ? (
          <Fragment key={index}>
            <ListItem
              onClick={() => handleToggleExpand(item)}
            >
              <ListItemButton>
                <ListItemIcon
                  sx={{
                    minWidth: "40px"
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
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
          <ListItem key={index}>
            <ListItemButton
              onClick={() => {
                handleItemClick(item);
              }}
              sx={{
                background: pathname == item.path ? colors.white : colors.primary,
                color: pathname == item.path ? colors.primary : colors.white,
                borderRadius: "4px",
                "svg": {
                  "path": {
                    fill: pathname == item.path ? colors.primary : colors.white,
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
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
