// import React from "react";
// import { emphasize, styled } from "@mui/material/styles";
// import { Breadcrumbs, Chip } from "@mui/material";
// import { Home } from "@mui/icons-material";
// import colors from "../../assets/styles/colors";

// const StyledBreadcrumb = styled(Chip)(({ theme }) => {
//   const backgroundColor =
//     theme.palette.mode === "light"
//       ? theme.palette.grey[100]
//       : theme.palette.grey[800];
//   return {
//     backgroundColor,
//     height: theme.spacing(3),
//     color: theme.palette.text.primary,
//     fontWeight: theme.typography.fontWeightRegular,
//     "&:hover, &:focus": {
//       backgroundColor: emphasize(backgroundColor, 0.06),
//     },
//     "&:active": {
//       boxShadow: theme.shadows[1],
//       backgroundColor: emphasize(backgroundColor, 0.12),
//     },
//   };
// });


// function BreadCrumb({ currentPage }) {
//   const handleClick = (event) => {
//     event.preventDefault();
//     console.info("You clicked a breadcrumb.");
//   }

//   return (
//     <div role="presentation" onClick={handleClick} style={{ margin: "15px" }}>
//       <Breadcrumbs aria-label="breadcrumb" sx={{ color: colors.primary }}>
//         <StyledBreadcrumb
//           component="a"
//           href="/"
//           label={"Home" + " " + "/" + " " + currentPage}
//           icon={<Home sx={{ fontSize: "18px" }} />}
//         />
//       </Breadcrumbs>
//     </div>
//   );
// }

// export default BreadCrumb;

import React from "react";
import { useLocation } from "react-router-dom";
import { emphasize, styled } from "@mui/material/styles";
import { Chip } from "@mui/material";
import { Home } from "@mui/icons-material";
import colors from "../../assets/styles/colors";
import Navigation from "../../Navigation";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

// Helper: check if path matches route pattern (handles :id)
const matchesRoute = (path, routePattern) => {
  if (routePattern === path) return true;
  if (routePattern.includes(":id")) {
    const base = routePattern.replace("/:id", "");
    // path should start with base and have extra segment after it
    return path.startsWith(base) && path !== base;
  }
  return false;
};

function BreadCrumb() {
  const { pathname } = useLocation();

  // Build crumbs only for matched prefixes
  const getCrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", path: "/" }];
    let currentPath = "";

    // Build all prefixes
    const prefixes = segments.map((seg, index) => {
      currentPath += "/" + seg;
      return { path: currentPath, segment: seg };
    });

    // For each prefix, find matching nav item
    prefixes.forEach(({ path, segment }) => {
      const navItem = Navigation.find((item) =>
        item.routes.some((route) => matchesRoute(path, route))
      );

      if (navItem) {
        // Find the specific route index
        const idx = navItem.routes.findIndex((route) =>
          matchesRoute(path, route)
        );
        let label = navItem.label;
        if (idx !== -1 && navItem.routesLabel && navItem.routesLabel[idx]) {
          label = navItem.routesLabel[idx];
        }
        crumbs.push({ label, path });
      }
      // If no match, do NOT add a crumb (skip intermediate segments)
    });

    return crumbs;
  };

  const crumbs = getCrumbs();
  const fullLabel = crumbs.map(c => c.label).join(' / ');

  return (
    <div style={{ margin: "15px" }}>
      <StyledBreadcrumb
        component="a"
        href="/"
        label={fullLabel}
        icon={<Home sx={{ fontSize: "18px" }} />}
      />
    </div>
  );
}

export default BreadCrumb;