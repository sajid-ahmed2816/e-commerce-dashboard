import React, { useEffect, useState } from "react";
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import colors from "../../assets/styles/colors";
import { useLocation } from "react-router-dom";

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
}); // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

function handleClick(event) {
  event.preventDefault();
  console.info("You clicked a breadcrumb.");
}

export default function AppbarBreadCrumb() {
  const location = useLocation();
  const [currentPathName, setCurrentPathName] = useState(location.pathname);
  useEffect(() => {
    setCurrentPathName(location.pathname);
  }, [location.pathname])
  return (
    <div role="presentation" onClick={handleClick} style={{ margin: "15px" }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: colors.primary }}>
        <StyledBreadcrumb
          component="a"
          href="#"
          // label="Home"
          label={currentPathName}
          icon={<HomeIcon fontSize="small" />}
        />
      </Breadcrumbs>
    </div>
  );
}
