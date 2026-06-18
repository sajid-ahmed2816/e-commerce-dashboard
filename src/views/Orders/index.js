import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Checkbox, Grid, InputAdornment, Table, TableBody, TableContainer, Typography, colors } from '@mui/material';
import { Delete, ErrorOutline, Search, Visibility } from '@mui/icons-material';
import PrimaryButton, { SecondaryButton, IconButton } from '../../components/Button';
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
import Loader from '../../components/Loader';

const tableHead = ["Order#", "Customer Name", "Mobile No", "Total", "Country", "State", "City", "Created At", "Actions"];

function Orders() {
  const [isLoading, setIsLoading] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);


  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const searchQuery = searchParams.get("search") || "";

  const { register, watch } = useForm({
    defaultValues: { search: searchQuery || "" }
  });
  const { showToast } = useToast();

  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);
  const handleBulkDeleteDialog = () => setIsBulkDeleteDialogOpen((prev) => !prev);

  const handleRowsPerPageChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setSearchParams((prev) => {
      prev.set("limit", newLimit);
      prev.set("page", 1);  // Reset to first page
      return prev;
    });
  };

  const getOrders = async (value, pageNumber, limit, category, product) => {
    setIsDataLoading(true);
    try {
      const params = { search: value, page: pageNumber, limit: limit, category: category, product: product };
      const result = await OrderServices.getOrders(params);
      if (result.status) {
        setOrders(result?.data?.orders);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsDataLoading(false);
    }
  };

  const deleteOrder = async () => {
    setIsLoading(true);
    try {
      const result = await OrderServices.deleteOrder(selectedOrder?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        getOrders(searchQuery, page, limit);
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteOrders = async () => {
    setIsBulkDeleting(true);
    try {
      const deletePromises = selectedRows.map(id => OrderServices.deleteOrder(id));
      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(res => res.status);
      if (allSuccessful) {
        showToast(`${selectedRows.length} product(s) deleted successfully`, "success");
        handleBulkDeleteDialog();
        getOrders(searchQuery, page, limit);
        setSelectedRows([]);
      } else {
        showToast("Some products could not be deleted", "error");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAllCurrentPage = () => {
    const currentPageIds = orders.map(p => p._id);
    const allSelectedOnCurrentPage = currentPageIds.every(id => selectedRows.includes(id));

    if (allSelectedOnCurrentPage) {
      setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      const newSelected = [...selectedRows];
      currentPageIds.forEach(id => {
        if (!newSelected.includes(id)) newSelected.push(id);
      });
      setSelectedRows(newSelected);
    }
  };

  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set("page", 1);
      prev.set("limit", limit);
      prev.set("search", debouncedSearch || "");
      return prev;
    });
    getOrders(debouncedSearch, page, limit);
  }, [debouncedSearch, page, limit]);

  const currentPageIds = orders.map(p => p._id);
  const allSelectedOnCurrentPage = currentPageIds.length > 0 && currentPageIds.every(id => selectedRows.includes(id));
  const someSelectedOnCurrentPage = currentPageIds.some(id => selectedRows.includes(id));

  return (
    <Fragment>
      {/* Single Delete */}
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

      {/* Bulk Delete */}
      {/* Bulk Delete Dialog */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        handleClose={handleBulkDeleteDialog}
        title={"Delete Selected Orders"}
      >
        <Grid item md={12}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <ErrorOutline sx={{ fontSize: 64, color: colors.red.A400 }} />
            <Typography sx={{ fontSize: 24, fontWeight: 600 }}>Are you sure?</Typography>
            <Typography>You are about to delete {selectedRows.length} orders(s). This action cannot be undone.</Typography>
          </Box>
        </Grid>
        <Grid item md={6}>
          <SecondaryButton fullWidth title={"Cancel"} onClick={handleBulkDeleteDialog} />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton fullWidth title={"Delete"} onClick={bulkDeleteOrders} isLoading={isBulkDeleting} disabled={isBulkDeleting} />
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
              {selectedRows?.length > 0 && (
                <Grid item md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "end"
                    }}
                  >
                    <SecondaryButton
                      title={`Delete Selected (${selectedRows.length})`}
                      onClick={handleBulkDeleteDialog}
                    />
                  </Box>
                </Grid>
              )}
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
                    <TableCell padding="checkbox">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "end"
                        }}
                      >
                        <Checkbox
                          checked={allSelectedOnCurrentPage}
                          indeterminate={someSelectedOnCurrentPage && !allSelectedOnCurrentPage}
                          onChange={handleSelectAllCurrentPage}
                          sx={{
                            p: 0,
                            color: "#ffffff !important",
                            "&.Mui-checked": {
                              color: "#ffffff",
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    {tableHead.map((ind) => (
                      <TableCell key={ind} sx={{ textAlign: ind === "Actions" ? "center" : "left" }}>{ind}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isDataLoading ? (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ textAlign: "center" }}>
                        <Loader />
                      </TableCell>
                    </TableRow>
                  ) : orders?.length > 0 ? orders?.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.includes(item._id)}
                          onChange={() => handleSelectRow(item._id)}
                        />
                      </TableCell>
                      <TableCell>{item?.orderNo}</TableCell>
                      <TableCell>{item?.customerName}</TableCell>
                      <TableCell>{item?.mobile}</TableCell>
                      <TableCell>{item?.total}</TableCell>
                      <TableCell>{item?.country}</TableCell>
                      <TableCell>{item?.state}</TableCell>
                      <TableCell>{item?.city}</TableCell>
                      <TableCell>{moment(item?.createdAt).format("DD-MM-YYYY")}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1
                          }}
                        >
                          <IconButton
                            type={"edit"}
                            onClick={() => {
                              setSelectedOrder(item);
                              navigate(`/orders/order-detail/${item._id}`, { state: item })
                            }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            type={"delete"}
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
                  )) : (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ textAlign: "center" }}>
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
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
                  rowsPerPage={limit}
                  onRowsPerPageChange={handleRowsPerPageChange}
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