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
import { Images } from "../assets/images/Images"

export default function Header() {
  const [auth, setAuth] = useState(true);
  const { pathname } = useLocation();
  const Logo = Images.headerLogo;

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <Logo />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Fashion Store
          </Typography>
        </Box>
        {auth && (
          <Box sx={{ flex: 1, display: "grid", justifyContent: "flex-end" }}>
            <BreadCrumb currentPage={currentPage} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
