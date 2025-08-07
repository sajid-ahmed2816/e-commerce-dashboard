import React from "react";
import { emphasize, styled } from "@mui/material/styles";
import { Breadcrumbs, Chip } from "@mui/material";
import { Home } from "@mui/icons-material";
import colors from "../../assets/styles/colors";

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


function BreadCrumb({ currentPage }) {
  const handleClick = (event) => {
    event.preventDefault();
    console.info("You clicked a breadcrumb.");
  }

  return (
    <div role="presentation" onClick={handleClick} style={{ margin: "15px" }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: colors.primary }}>
        <StyledBreadcrumb
          component="a"
          href="/"
          label={"Home" + " " + "/" + " " + currentPage}
          icon={<Home sx={{ fontSize: "18px" }} />}
        />
      </Breadcrumbs>
    </div>
  );
}

export default BreadCrumb;
