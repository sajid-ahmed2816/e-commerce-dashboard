import React from 'react';
import { Box, Grid, Paper, Table, TableBody, TableContainer, TableHead } from '@mui/material';
import PrimaryButton from '../../components/Button';
import TableRow from '../../components/TableRow';
import TableCell from '../../components/TableCell';

const tableHead = ["S.No", "Image", "Tagline", "Category", "Created At", "Actions"];

function Banners() {
  return (
    <Box
      component={Paper}
      elevation={4}
      sx={{
        height: "100%",
        width: "100%",
        borderRadius: "6px",
        p: 2
      }}
    >
      <Grid container spacing={2}>
        <Grid item md={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <PrimaryButton title={"Create Banner"} />
          </Box>
        </Grid>
        <Grid item md={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {tableHead.map((ind) => (
                    <TableCell key={ind}>{ind}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>

                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Banners;