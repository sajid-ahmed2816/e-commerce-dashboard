import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import colors from '../../assets/styles/colors';

function Loader() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <CircularProgress sx={{ color: colors.primary }} />
    </Box>
  )
}

export default Loader;