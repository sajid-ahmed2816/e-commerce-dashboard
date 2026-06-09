import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CardMedia, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableContainer, Typography, colors } from '@mui/material';
import { Delete, Edit, ErrorOutline, ImageRounded, Search } from '@mui/icons-material';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import TableRow from '../../../components/TableRow';
import TableCell from '../../../components/TableCell';
import Dialog from '../../../components/Dialog';
import InputField from '../../../components/InputField';
import useToast from '../../../hooks/useToast';
import ProductServices from '../../../api/products/ProductServices';
import useDebounce from '../../../utils/Debounce';
import TablePagination from '../../../components/Pagination';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import TableHead from '../../../components/TableHead';
import { Switch } from '../../../components/Switch';

const tableHead = ["S.No", "Image", "Name", "Category", "Price", "Status", "Created At", "Actions"];

function Products() {
  const [isLoading, setIsLoading] = useState("");
  const [products, setProducts] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { register, setValue, watch } = useForm();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const searchQuery = searchParams.get("search") || "";

  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  const getProducts = async (value, pageNumber, category) => {
    try {
      const params = { search: value, page: pageNumber, limit: limit, category: category };
      const result = await ProductServices.getProducts(params);
      if (result.status) {
        setProducts(result.data.products);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
        const ids = result.data.products.filter(p => p.isActive).map(p => p._id);
        setActiveIds(ids);
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

  const handleStatus = async (item) => {
    const obj = {}
    if (item.isActive) {
      obj.isActive = false;
    } else {
      obj.isActive = true;
    };
    try {
      const result = await ProductServices.updateStatus(item._id, obj);
      if (result) {
        showToast(result?.message, "success");
      };
    } catch (error) {
      showToast(error, "error");
    } finally {
      getProducts();
    };
  };

  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    getProducts(debouncedSearch, page);
  }, [debouncedSearch, page]);

  const debouncedInput = useDebounce(searchValue, 500);

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set("page", 1);
      prev.set("limit", limit);
      prev.set("search", debouncedInput || "");
      return prev;
    });
  }, [debouncedInput]);

  useEffect(() => {
    setValue("search", searchQuery);
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
        sx={{
          height: "100%",
          width: "100%",
          p: 2
        }}
      >
        <Grid container spacing={2}>
          <Grid item md={12}>
            <Grid container spacing={2}>
              <Grid item md={6}>
                <InputField
                  placeholder={"Search here..."}
                  size={"small"}
                  fullWidth={true}
                  value={watch("search")}
                  register={register("search")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item md={6}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end"
                  }}
                >
                  <PrimaryButton
                    title={"Create Product"}
                    onClick={() => {
                      setSelectedProduct(null);
                      navigate("/products/create-product")
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={12}>
            <TableContainer
              sx={{
                height: "calc(100vh - 200px)",
                overflowY: "auto"
              }}
            >
              <Table size='small'>
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
                      <TableCell><CardMedia src={item.image} component={"img"} sx={{ width: "80px", height: "40px", objectFit: "cover" }} /></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item?.category?.name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>
                        <Switch
                          checked={activeIds.includes(item._id)}
                          onChange={() => handleStatus(item)}
                        />
                      </TableCell>
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
                              setSelectedProduct(item);
                              navigate(`/products/update-product/${item._id}`, { state: item })
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setSelectedProduct(item);
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
          <Grid item md={12}>
            <Grid container alignItems={"center"}>
              <Grid item md={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Typography>Total Products:</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{totalCount}</Typography>
                </Box>
              </Grid>
              <Grid item md={6}>
                <TablePagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(e, value) => {
                    setSearchParams((prev) => {
                      prev.set("page", value);
                      return prev;
                    });
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};

export default Products;