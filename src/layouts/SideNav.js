import * as React from "react";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import Navigation from "../Navigation";
import { useNavigate, useLocation } from "react-router-dom";
const drawerWidth = 240;

export default function SideNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleItemClick = (item) => {
    navigate(item.path);
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          {Navigation.map((item, index) => (
            <ListItem key={index}>
              <ListItemButton
                onClick={() => {
                  handleItemClick(item);
                }}
                selected={pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
