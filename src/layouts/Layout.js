import React, { Fragment } from "react";
import { Box } from "@mui/material";
import SideNav from "./SideNav";
import { Outlet } from "react-router-dom";

export const Layout = ({ children }) => {
  return (
    <Fragment>
      <Box sx={{ display: "flex" }}>
        <Box>
          <SideNav />
        </Box>
        <Box sx={{ mt: "100px", mx: 2, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Fragment>
  );
};
