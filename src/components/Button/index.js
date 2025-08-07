import React from 'react';
import { Button } from '@mui/material';
import colors from '../../assets/styles/colors';

function PrimaryButton({ title, sx, startIcon, ...props }) {
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
      {title}
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