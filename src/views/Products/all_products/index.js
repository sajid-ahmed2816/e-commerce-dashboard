import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CardMedia, Grid, IconButton, Paper, Table, TableBody, TableContainer, TableHead, Typography, colors } from '@mui/material';
import { Delete, Edit, ErrorOutline, ImageRounded } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import TableRow from '../../../components/TableRow';
import TableCell from '../../../components/TableCell';
import Dialog from '../../../components/Dialog';
import InputField from '../../../components/InputField';
import useToast from '../../../hooks/useToast';
import moment from 'moment';
import ProductServices from '../../../api/products/ProductServices';

const tableHead = ["S.No", "Name", "Category", "Price", "Created At", "Actions"];

function Products() {
  const [isLoading, setIsLoading] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedCategory] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  const getProducts = async () => {
    try {
      const result = await ProductServices.getProducts();
      if (result.status) {
        setProducts(result.data.products);
      }
    } catch (error) {
      showToast(error, "error")
    }
  };

  const deleteProduct = async () => {
    setIsLoading(true);
    try {
      const result = await ProductServices.deleteProduct(selectedProduct?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        getProducts();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <Fragment>
      <Dialog
        open={isConfirmationDialogOpen}
        handleClose={handleConfirmationDialog}
        title={"Delete Product"}
      >
        <Grid item md={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1
            }}
          >
            <ErrorOutline sx={{ fontSize: 64, color: colors.red.A400 }} />
            <Typography sx={{ fontSize: 24, fontWeight: 600 }}>Are you sure?</Typography>
            <Typography>You wont be able to revert this!</Typography>
          </Box>
        </Grid>
        <Grid item md={6}>
          <SecondaryButton
            fullWidth
            title={"Cancel"}
            onClick={handleConfirmationDialog}
          />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton
            fullWidth
            title={"Delete"}
            onClick={deleteProduct}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </Grid>
      </Dialog>
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
              <PrimaryButton
                title={"Create Product"}
                onClick={() => {
                  setSelectedCategory(null);
                  navigate("/products/create-product")
                }}
              />
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
                  {products.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell>{ind + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item?.category?.name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{moment(item?.createdAt).format("DD-MM-YYYY")}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                          }}
                        >
                          <IconButton
                            onClick={() => {
                              setSelectedCategory(item);
                              navigate(`/products/update-product/${item._id}`, { state: item })
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setSelectedCategory(item);
                              handleConfirmationDialog();
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};

export default Products;