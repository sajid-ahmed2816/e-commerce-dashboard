import React, { Fragment } from "react";
import { Box } from "@mui/material";
import SideNav from "./SideNav";
import { Outlet } from "react-router-dom";
import Header from "./Header";

export const Layout = () => {
  return (
    <Fragment>
      <Header />
      <Box component={"main"} sx={{ display: "flex", height: "100vh" }}>
        <SideNav />
        <Box sx={{ flexGrow: 1, mt: "76px", mx: 2, mb: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Fragment>
  );
};
