import React, { Fragment, useEffect, useState } from 'react';
import { Box, Grid, InputAdornment, Paper, Table, TableBody, TableContainer, Typography, colors } from '@mui/material';
import { Delete, Edit, ErrorOutline, Search } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import PrimaryButton, { SecondaryButton, IconButton } from '../../components/Button';
import TableRow from '../../components/TableRow';
import TableCell from '../../components/TableCell';
import Dialog from '../../components/Dialog';
import InputField from '../../components/InputField';
import useToast from '../../hooks/useToast';
import SizeServices from '../../api/sizes/SizeServices';
import useDebounce from '../../utils/Debounce';
import { useSearchParams } from "react-router-dom";
import TablePagination from '../../components/Pagination';
import moment from 'moment';
import { Switch } from '../../components/Switch';
import TableHead from '../../components/TableHead';
import Loader from '../../components/Loader';

const tableHead = ["S.No", "Size", "Status", "Created At", "Actions"];

function Sizes() {
  const [isLoading, setIsLoading] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const searchQuery = searchParams.get("search") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: { search: searchQuery || "" }
  });
  const { showToast } = useToast();

  const handleSizeDialog = () => setIsSizeDialogOpen((prevOpen) => !prevOpen);
  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  const handleRowsPerPageChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setSearchParams((prev) => {
      prev.set("limit", newLimit);
      prev.set("page", 1);  // Reset to first page
      return prev;
    });
  };

  const setDefaultData = () => {
    setValue("size", selectedSize?.size);
    setValue("description", selectedSize?.description);
  };

  const createSize = async (formData) => {
    setIsLoading(true);
    const obj = {
      size: formData.size,
      description: formData.description,
    };
    try {
      const result = await SizeServices.createSize(obj);
      if (result.status) {
        showToast(result.message, "success");
        reset();
        handleSizeDialog();
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
      getSizes(searchQuery, page, limit);
    }
  };

  const updateSize = async (formData) => {
    setIsLoading(true);
    const obj = {
      size: formData.size,
      description: formData.description,
    };
    try {
      const result = await SizeServices.updateSize(selectedSize?._id, obj);
      if (result.status) {
        showToast(result.message, "success");
        handleSizeDialog();
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
      getSizes(searchQuery, page, limit);
    }
  };

  const getSizes = async (value, pageNumber, limit) => {
    try {
      const params = { search: value, page: pageNumber, limit: limit };
      const result = await SizeServices.getSizes(params);
      if (result.status) {
        setSizes(result.data.sizes);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
        const ids = result.data.sizes.filter(s => s.isActive).map(s => s._id);
        setActiveIds(ids);
      };
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsDataLoading(false);
    };
  };

  const deleteSize = async () => {
    setIsLoading(true);
    try {
      const result = await SizeServices.deleteSize(selectedSize?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsLoading(false);
      getSizes(searchQuery, page, limit);
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
      const result = await SizeServices.updateStatus(item._id, obj);
      if (result) {
        showToast(result?.message, "success");
      };
    } catch (error) {
      showToast(error, "error");
    } finally {
      getSizes(searchQuery, page, limit);
    };
  };

  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    if (selectedSize != null) {
      setDefaultData();
    } else {
      reset();
    };
  }, [selectedSize]);

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set("page", 1);
      prev.set("limit", limit);
      prev.set("search", debouncedSearch || "");
      return prev;
    });
    getSizes(debouncedSearch, page, limit);
  }, [debouncedSearch, page, limit]);

  return (
    <Fragment>
      <Dialog
        open={isSizeDialogOpen}
        handleClose={handleSizeDialog}
        title={selectedSize == null ? "Create Size" : "Update Size"}
        component={"form"}
        onSubmit={handleSubmit(selectedSize == null ? createSize : updateSize)}
      >
        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Size"}
              fullWidth={true}
              type={"text"}
              value={watch("size")}
              register={register("size", {
                required: "Enter Size",
              })}
              error={errors?.size && true}
              helperText={errors?.size?.message}
            />
          </Box>
        </Grid>
        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Description"}
              fullWidth={true}
              type={"text"}
              value={watch("description")}
              register={register("description")}
              multiline={true}
              rows={3}
            />
          </Box>
        </Grid>
        <Grid item md={12}>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <SecondaryButton title={"Cancel"} fullWidth onClick={handleSizeDialog} />
            </Grid>
            <Grid item md={6}>
              <PrimaryButton title={"Submit"} fullWidth type={"submit"} isLoading={isLoading} isDisabled={isLoading} />
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
      <Dialog
        open={isConfirmationDialogOpen}
        handleClose={handleConfirmationDialog}
        title={"Delete Size"}
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
          <PrimaryButton fullWidth title={"Delete"} onClick={deleteSize} isLoading={isLoading} isDisabled={isLoading} />
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
                    title={"Create Size"}
                    onClick={() => {
                      setSelectedSize(null);
                      handleSizeDialog();
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
                      <TableCell key={ind} sx={{ textAlign: ind === "Actions" ? "center" : "left" }}>{ind}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isDataLoading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Loader />
                      </TableCell>
                    </TableRow>
                  ) : sizes.length > 0 ? sizes.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell>{ind + 1}</TableCell>
                      <TableCell>{item.size}</TableCell>
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
                            justifyContent: "center",
                            gap: 1
                          }}
                        >
                          <IconButton
                            type={"edit"}
                            onClick={() => {
                              setSelectedSize(item);
                              handleSizeDialog();
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            type={"delete"}
                            onClick={() => {
                              setSelectedSize(item);
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
                      <TableCell colSpan={5} sx={{ textAlign: "center" }}>
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
                  <Typography>Total Sizes:</Typography>
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

export default Sizes;