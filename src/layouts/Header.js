import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box
} from "@mui/material";
import BreadCrumb from "../components/BreadCrumb";
import Navigation from "../Navigation";

export default function Header() {
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { pathname } = useLocation();

  const currentPage = Navigation.find((nav) => nav.path == pathname)?.label;

  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1300
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1, px: 7 }}>
          Fashion Store
        </Typography>
        {auth && (
          <Box sx={{ flex: 1, display: "grid", justifyContent: "flex-end" }}>
            <BreadCrumb currentPage={currentPage} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
