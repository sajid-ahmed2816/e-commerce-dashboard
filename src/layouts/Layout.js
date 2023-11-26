import React, { Fragment } from "react";
import { Box } from "@mui/material";
import SideNav from "./SideNav";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import AppbarBreadcrumb from "../components/BreadCrumb/AppbarBreadCrumb";

export const Layout = ({ children }) => {
  return (
    <Fragment>
      <Box sx={{ display: "flex" }}>
        <Box>
          <SideNav />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Outlet />
        </Box>
      </Box>
    </Fragment>
  );
};
