import React from 'react';
import { Button, CircularProgress, colors } from '@mui/material';
import IcButton from "@mui/material/IconButton";
import Colors from '../../assets/styles/colors';

function PrimaryButton({ title, sx, startIcon, isLoading, ...props }) {
  return (
    <Button
      variant={"contained"}
      startIcon={startIcon}
      sx={{
        background: Colors.primary,
        color: Colors.white,
        borderRadius: "6px",
        textTransform: "capitalize"
      }}
      {...props}
    >
      {isLoading ? <CircularProgress size={25} sx={{ color: Colors.primary }} /> : title}
    </Button>
  );
};

function SecondaryButton({ title, sx, startIcon, color, ...props }) {
  return (
    <Button
      variant={"outlined"}
      startIcon={startIcon}
      sx={{
        borderColor: color || Colors.primary,
        color: color || Colors.primary,
        borderRadius: "6px",
        textTransform: "capitalize"
      }}
      {...props}
    >
      {title}
    </Button>
  );
};

function IconButton({ type, onClick, children }) {
  const editBtnStyle = {
    background: "transparent",
    border: `1px solid ${Colors.primary}`,
    "svg": {
      fontSize: "22px",
      fill: Colors.primary
    },
    ":hover": {
      border: `1px solid ${Colors.primary}`,
      background: Colors.primary,
      "svg": {
        fill: "#ffffff"
      }
    }
  };
  const deleteBtnStyle = {
    background: "transparent",
    border: `1px solid ${colors.red.A700}`,
    "svg": {
      fontSize: "22px",
      fill: colors.red.A700
    },
    ":hover": {
      border: `1px solid ${colors.red.A700}`,
      background: colors.red.A700,
      "svg": {
        fill: "#ffffff"
      }
    }
  }
  return (
    <IcButton
      size={"small"}
      sx={type === "edit" ? editBtnStyle : type === "delete" ? deleteBtnStyle : {}}
      onClick={onClick}
    >
      {children}
    </IcButton>
  )
}

export { SecondaryButton, IconButton };
export default PrimaryButton;