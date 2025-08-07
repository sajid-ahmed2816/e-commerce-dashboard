import React from 'react';
import { Box, DialogTitle, Grid, Slide } from '@mui/material';
import MuiDialog from '@mui/material/Dialog';
import colors from '../../assets/styles/colors';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


function Dialog({ open, handleClose, title, children }) {
  return (
    <MuiDialog
      open={open}
      onClose={handleClose}
      keepMounted
      slots={{
        transition: Transition,
      }}
    >
      <DialogTitle sx={{ p: 2, background: colors.primary, color: colors.white }}>{title}</DialogTitle>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        <Grid container spacing={2}>
          {children}
        </Grid>
      </Box>
    </MuiDialog>
  );
};

export default Dialog;