import React from 'react';
import { Box, DialogTitle, Grid, Slide } from '@mui/material';
import MuiDialog from '@mui/material/Dialog';
import colors from '../../assets/styles/colors';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


function Dialog({ maxWidth, fullWidth, open, handleClose, title, component, onSubmit, children }) {
  return (
    <MuiDialog
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      open={open}
      onClose={handleClose}
      keepMounted
      slots={{
        transition: Transition,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(2px)"
          }
        },
      }}
      sx={{
        "& .MuiPaper-root": {
          background: colors.secondary
        }
      }}
    >
      <DialogTitle sx={{ fontSize: "16px", p: 2, background: colors.primary, color: colors.white }}>{title}</DialogTitle>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          background: colors.white
        }}
      >
        <Grid
          container
          spacing={2}
          component={component}
          onSubmit={onSubmit}
        >
          {children}
        </Grid>
      </Box>
    </MuiDialog>
  );
};

export default Dialog;