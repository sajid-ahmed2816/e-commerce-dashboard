import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CardMedia, Checkbox, Grid, IconButton, InputAdornment, Table, TableBody, TableContainer, Typography, colors } from '@mui/material';
import { Delete, Edit, ErrorOutline, Search } from '@mui/icons-material';
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
import Loader from '../../../components/Loader';

const tableHead = ["Image", "Name", "Category", "Price", "Status", "Created At", "Actions"];

function Products() {
  const [isLoading, setIsLoading] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]); // Persists across pages
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, setValue, watch } = useForm();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const searchQuery = searchParams.get("search") || "";

  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);
  const handleBulkDeleteDialog = () => setIsBulkDeleteDialogOpen((prev) => !prev);
  const handleBulkUploadDialog = () => setIsBulkUploadDialogOpen((prev) => !prev);

  const handleRowsPerPageChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setSearchParams((prev) => {
      prev.set("limit", newLimit);
      prev.set("page", 1);  // Reset to first page
      return prev;
    });
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      showToast("Please select a file", "warning");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const result = await ProductServices.bulkUpload(formData);
      if (result.status) {
        showToast(result.message || "Bulk upload successful", "success");
        handleBulkUploadDialog();
        getProducts(); // Refresh product list
        setBulkFile(null);
      }
    } catch (error) {
      showToast(error?.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const getProducts = async (value, pageNumber, category) => {
    setIsDataLoading(true);
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
    } finally {
      setIsDataLoading(false);
    };
  };

  const deleteProduct = async () => {
    setIsLoading(true);
    try {
      const result = await ProductServices.deleteProduct(selectedProduct?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        getProducts();
        setSelectedRows(prev => prev.filter(id => id !== selectedProduct?._id));
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

  const bulkDeleteProducts = async () => {
    setIsBulkDeleting(true);
    try {
      const deletePromises = selectedRows.map(id => ProductServices.deleteProduct(id));
      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(res => res.status);
      if (allSuccessful) {
        showToast(`${selectedRows.length} product(s) deleted successfully`, "success");
        handleBulkDeleteDialog();
        getProducts(); // Refresh list
        setSelectedRows([]); // Clear selections after successful bulk delete
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
    const currentPageIds = products.map(p => p._id);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: validate file type (CSV, Excel)
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        showToast("Please upload a CSV or Excel file", "error");
        e.target.value = ''; // reset input
        setBulkFile(null);
        return;
      }
      setBulkFile(file);
    }
  };

  const clearAllSelections = () => setSelectedRows([]);

  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    getProducts(debouncedSearch, page);
  }, [debouncedSearch, page, limit]);

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

  const currentPageIds = products.map(p => p._id);
  const allSelectedOnCurrentPage = currentPageIds.length > 0 && currentPageIds.every(id => selectedRows.includes(id));
  const someSelectedOnCurrentPage = currentPageIds.some(id => selectedRows.includes(id));

  return (
    <Fragment>
      {/* Single Delete Dialog */}
      <Dialog
        open={isConfirmationDialogOpen}
        handleClose={handleConfirmationDialog}
        title={"Delete Product"}
      >
        <Grid item md={12}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <ErrorOutline sx={{ fontSize: 64, color: colors.red.A400 }} />
            <Typography sx={{ fontSize: 24, fontWeight: 600 }}>Are you sure?</Typography>
            <Typography>You won't be able to revert this!</Typography>
          </Box>
        </Grid>
        <Grid item md={6}>
          <SecondaryButton fullWidth title={"Cancel"} onClick={handleConfirmationDialog} />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton fullWidth title={"Delete"} onClick={deleteProduct} isLoading={isLoading} disabled={isLoading} />
        </Grid>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        handleClose={handleBulkDeleteDialog}
        title={"Delete Selected Products"}
      >
        <Grid item md={12}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <ErrorOutline sx={{ fontSize: 64, color: colors.red.A400 }} />
            <Typography sx={{ fontSize: 24, fontWeight: 600 }}>Are you sure?</Typography>
            <Typography>You are about to delete {selectedRows.length} product(s). This action cannot be undone.</Typography>
          </Box>
        </Grid>
        <Grid item md={6}>
          <SecondaryButton fullWidth title={"Cancel"} onClick={handleBulkDeleteDialog} />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton fullWidth title={"Delete"} onClick={bulkDeleteProducts} isLoading={isBulkDeleting} disabled={isBulkDeleting} />
        </Grid>
      </Dialog>

      <Dialog
        open={isBulkUploadDialogOpen}
        handleClose={handleBulkUploadDialog}
        title={"Bulk Upload Products"}
      >
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            Upload a CSV or Excel file with product data.
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Required columns: name, category, price, image (URL), description, etc.
            <br />
            <a href="/sample-bulk-upload-template.csv" download>Download sample template</a>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <input
            accept=".csv, .xls, .xlsx"
            type="file"
            onChange={handleFileChange}
            style={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={6}>
          <SecondaryButton
            fullWidth
            title="Cancel"
            onClick={handleBulkUploadDialog}
          />
        </Grid>
        <Grid item xs={6}>
          <PrimaryButton
            fullWidth
            title="Upload"
            onClick={handleBulkUpload}
            isLoading={isUploading}
            disabled={isUploading || !bulkFile}
          />
        </Grid>
      </Dialog>

      <Box sx={{ height: "100%", width: "100%", p: 2 }}>
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
                {selectedRows.length !== 0 ? (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <SecondaryButton
                      title={`Delete Selected (${selectedRows.length})`}
                      onClick={handleBulkDeleteDialog}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <PrimaryButton
                      title={"Bulk Upload"}
                      onClick={handleBulkUploadDialog}
                    />
                    <PrimaryButton
                      title={"Create Product"}
                      onClick={() => {
                        setSelectedProduct(null);
                        navigate("/products/create-product");
                      }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={12}>
            <TableContainer sx={{ height: "calc(100vh - 204px)", overflowY: "auto" }}>
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
                      <TableCell key={ind}>{ind}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isDataLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: "center" }}>
                        <Loader />
                      </TableCell>
                    </TableRow>
                  ) : products?.length > 0 ? products.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.includes(item._id)}
                          onChange={() => handleSelectRow(item._id)}
                        />
                      </TableCell>
                      <TableCell><CardMedia src={item.image} component={"img"} sx={{ width: "80px", height: "40px", objectFit: "cover" }} /></TableCell>
                      <TableCell><Box sx={{ textWrap: "wrap" }}>{item.name}</Box></TableCell>
                      <TableCell>{item?.category?.name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>
                        <Switch
                          checked={activeIds.includes(item._id)}
                          onChange={() => handleStatus(item)}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{moment(item?.createdAt).format("DD-MM-YYYY")}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <IconButton onClick={() => {
                            setSelectedProduct(item);
                            navigate(`/products/update-product/${item._id}`, { state: item });
                          }}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => {
                            setSelectedProduct(item);
                            handleConfirmationDialog();
                          }}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: "center" }}>
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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

export default Products;