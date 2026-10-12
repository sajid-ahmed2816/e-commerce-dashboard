import React from 'react';
import { Box, Typography } from '@mui/material';

function NoPreview() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "40px",
        background: "#A0A0A0",
        color: "#FFFFFF",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Typography variant={"caption"}>No Preview Available</Typography>
    </Box>
  );
};

export default NoPreview;