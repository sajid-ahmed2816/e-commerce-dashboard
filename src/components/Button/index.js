import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import colors from '../../assets/styles/colors';

function PrimaryButton({ title, sx, startIcon, isLoading, ...props }) {
  return (
    <Button
      variant={"contained"}
      startIcon={startIcon}
      sx={{
        background: colors.primary,
        color: colors.white,
        borderRadius: "6px",
        textTransform: "capitalize"
      }}
      {...props}
    >
      {isLoading ? <CircularProgress size={25} sx={{ color: colors.primary }} /> : title}
    </Button>
  );
};

function SecondaryButton({ title, sx, startIcon, ...props }) {
  return (
    <Button
      variant={"outlined"}
      startIcon={startIcon}
      sx={{
        borderColor: colors.primary,
        color: colors.primary,
        borderRadius: "6px",
        textTransform: "capitalize"
      }}
      {...props}
    >
      {title}
    </Button>
  );
};

export { SecondaryButton };
export default PrimaryButton;