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
  const { pathname } = useLocation();

  // const currentPageObj = Navigation.find((nav) =>
  //   nav?.routes?.some((route) => {
  //     if (route.includes(":id")) {
  //       // match dynamic id
  //       const baseRoute = route.replace("/:id", "");
  //       return pathname.startsWith(baseRoute);
  //     }
  //     return route === pathname;
  //   })
  // );

  // // Find index
  // const index = currentPageObj?.routes?.findIndex((route) => {
  //   if (route.includes(":id")) {
  //     const baseRoute = route.replace("/:id", "");
  //     return pathname.startsWith(baseRoute);
  //   }
  //   return route === pathname;
  // });

  // const currentPage =
  //   typeof index === "number"
  //     ? currentPageObj?.routesLabel[index]
  //     : currentPageObj?.label;

  const currentPageObj = Navigation.find((nav) =>
    nav?.routes?.some((route) => {
      if (route.includes(":id")) {
        const baseRoute = route.replace("/:id", "");
        return pathname.startsWith(baseRoute);
      }
      return route === pathname;
    })
  );

  // Default: null
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
  }

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
