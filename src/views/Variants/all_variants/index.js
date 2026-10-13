import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Chip, colors, Grid, InputAdornment, Table, TableBody, TableContainer, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import InputField from '../../../components/InputField';
import { ErrorOutline, Search } from '@mui/icons-material';
import PrimaryButton, { IconButton, SecondaryButton } from '../../../components/Button';
import TableHead from '../../../components/TableHead';
import TableRow from '../../../components/TableRow';
import TableCell from '../../../components/TableCell';
import TablePagination from '../../../components/Pagination';
import ProductVariantServices from '../../../api/product_variants/ProductVariantServices';
import useToast from '../../../hooks/useToast';
import useDebounce from '../../../utils/Debounce';
import Loader from '../../../components/Loader';
import moment from 'moment';
import { Delete, Edit } from '../../../assets/icons';
import Dialog from '../../../components/Dialog';

const tableHead = ["Product", "Attributes", "SKU", "Price", "Stock", "Status", "Created At", "Actions"];

function Variants() {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  const handleRowsPerPageChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setSearchParams((prev) => {
      prev.set("limit", newLimit);
      prev.set("page", 1);  // Reset to first page
      return prev;
    });
  };

  const getAllVaraints = async (value, pageNumber, limit, product) => {
    setIsDataLoading(true);
    try {
      const params = { search: value, page: pageNumber, limit: limit, product: product };
      const result = await ProductVariantServices.getAllVaraints(params);
      if (result.status) {
        setVariants(result.data.variants);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsDataLoading(false);
    }
  };

  const deleteCategory = async () => {
    setIsLoading(true);
    const id = selectedVariant?._id;
    const product = selectedVariant?.product?._id;
    try {
      const result = await ProductVariantServices.deleteProductVariant(id, { product });
      if (result.status) {
        showToast(result.message, "success");
        getAllVaraints(searchQuery, page, limit);
        handleConfirmationDialog();
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
    setSearchParams((prev) => {
      prev.set("page", page);
      prev.set("limit", limit);
      prev.set("search", debouncedSearch || "");
      return prev;
    });
    getAllVaraints(debouncedSearch, page, limit);
  }, [debouncedSearch, page, limit]);

  return (
    <Fragment>
      <Dialog
        open={isConfirmationDialogOpen}
        handleClose={handleConfirmationDialog}
        title={"Delete Variant"}
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
          <SecondaryButton fullWidth title={"Cancel"} onClick={handleConfirmationDialog} />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton
            fullWidth
            title={"Delete"}
            onClick={deleteCategory}
            isLoading={isLoading}
            disabled={isLoading}
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
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <PrimaryButton
                    title={"Create Variant"}
                    onClick={() => {
                      navigate("/variants/create-variant");
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={12}>
            <TableContainer sx={{ height: "calc(100vh - 194px)", overflowY: "auto" }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    {tableHead.map((item, ind) => (
                      <TableCell
                        key={item}
                        sx={{
                          textAlign: (item === "Thumbnail" || item === "Actions") ? "center" : "left",
                          whiteSpace: "nowrap",
                          borderRadius: ind === 0 ? "8px 0px 0px 0px" : ind === tableHead.length - 1 ? "0px 8px 0px 0px" : "0px"
                        }}
                      >
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isDataLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        sx={{ textAlign: "center" }}
                      >
                        <Loader />
                      </TableCell>
                    </TableRow>
                  ) : variants?.length > 0 ? variants.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell><Box sx={{ textWrap: "wrap" }}>{item.product?.name}</Box></TableCell>
                      <TableCell>
                        <Box>
                          {item?.attributes?.map((attribute) => (
                            <Typography
                              key={attribute?._id}
                              sx={{ fontSize: "13px" }}
                            >
                              {`${attribute?.attribute?.name}: ${attribute?.value?.value}`}
                            </Typography>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{item?.sku}</TableCell>
                      <TableCell>{item?.price}</TableCell>
                      <TableCell>{item?.stock}</TableCell>
                      <TableCell>
                        {<Chip
                          label={item?.isActive ? "active" : "in-active"}
                          variant={"outlined"}
                          color={item?.isActive ? "success" : "error"}
                          size={"small"}
                        />}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{moment(item?.createdAt).format("DD-MM-YYYY")}</TableCell>
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
                              navigate(`/variants/update-variant/${item._id}`)
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            type={"delete"}
                            onClick={() => {
                              setSelectedVariant(item);
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
                      <TableCell colSpan={9} sx={{ textAlign: "center" }}>
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
                  <Typography sx={{ fontSize: "13px" }}>Total Products:</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{totalCount}</Typography>
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
  )
}

export default Variants;