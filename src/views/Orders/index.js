import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableContainer, Typography, colors } from '@mui/material';
import { Delete, ErrorOutline, Search, Visibility } from '@mui/icons-material';
import PrimaryButton, { SecondaryButton } from '../../components/Button';
import TableRow from '../../components/TableRow';
import TableCell from '../../components/TableCell';
import Dialog from '../../components/Dialog';
import InputField from '../../components/InputField';
import useToast from '../../hooks/useToast';
import OrderServices from '../../api/orders/OrderServices';
import useDebounce from '../../utils/Debounce';
import TablePagination from '../../components/Pagination';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import TableHead from '../../components/TableHead';

const tableHead = ["S.No", "Order#", "Customer Name", "Mobile No", "No of Products", "Total", "City", "Created At", "Actions"];

function Orders() {
  const [isLoading, setIsLoading] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  const getOrders = async (value, pageNumber, category, product) => {
    try {
      const params = { search: value, page: pageNumber, limit: limit, category: category, product: product };
      const result = await OrderServices.getOrders(params);
      if (result.status) {
        setOrders(result.data.orders);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
      }
    } catch (error) {
      showToast(error, "error")
    }
  };

  const deleteOrder = async () => {
    setIsLoading(true);
    try {
      const result = await OrderServices.deleteOrder(selectedOrder?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        getOrders();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsLoading(false);
    }
  };

  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    getOrders(debouncedSearch, page);
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
        title={"Delete Order"}
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
            onClick={deleteOrder}
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
                  {orders.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell>{ind + 1}</TableCell>
                      <TableCell>{item.orderNo}</TableCell>
                      <TableCell>{`${item.firstName} ${item.lastName}`}</TableCell>
                      <TableCell>{item.mobile}</TableCell>
                      <TableCell>{item?.items.length}</TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>{item.city}</TableCell>
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
                              setSelectedOrder(item);
                              // navigate(`/orders/update-product/${item._id}`, { state: item })
                            }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setSelectedOrder(item);
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
                  <Typography>Total Orders:</Typography>
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

export default Orders;