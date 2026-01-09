import React, { Fragment, useEffect, useState } from 'react';
import { Box, CardMedia, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableContainer, TableHead, Typography, colors } from '@mui/material';
import { Delete, Edit, ErrorOutline, ImageRounded, Search } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import TableRow from '../../../components/TableRow';
import TableCell from '../../../components/TableCell';
import Dialog from '../../../components/Dialog';
import InputField from '../../../components/InputField';
import UploadService from '../../../api/upload/UploadService';
import useToast from '../../../hooks/useToast';
import CategoryServices from '../../../api/categories/CategoryServices';
import useDebounce from '../../../utils/Debounce';
import { useSearchParams } from "react-router-dom";
import TablePagination from '../../../components/Pagination';
import moment from 'moment';

const tableHead = ["S.No", "Image", "Name", "Type", "Created At", "Actions"];

function Categories() {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [image, setImage] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { showToast } = useToast();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const searchQuery = searchParams.get("search") || "";

  const handleCategoryDialog = () => setIsCategoryDialogOpen((prevOpen) => !prevOpen);
  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  const setDefaultData = () => {
    setValue("categoryName", selectedCategory?.name);
    setValue("type", selectedCategory?.type);
    setImage(selectedCategory?.image);
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await UploadService.uploadImage(formData);
      if (result) {
        showToast(result.message, "success");
        setImage(result.url);
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  const createCategory = async (formData) => {
    const obj = {
      name: formData.categoryName,
      type: formData.type,
      image: image
    };
    try {
      const result = await CategoryServices.createCategory(obj);
      if (result.status) {
        showToast(result.message, "success");
        reset();
        setImage("");
        handleCategoryDialog();
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      getCategories();
    }
  };

  const updateCategory = async (formData) => {
    const obj = {
      name: formData.categoryName,
      type: formData.type,
      image: image
    };
    try {
      const result = await CategoryServices.updateCategory(selectedCategory?._id, obj);
      if (result.status) {
        showToast(result.message, "success");
        handleCategoryDialog();
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      getCategories();
    }
  };

  const getCategories = async (value, pageNumber) => {
    try {
      const params = { search: value, page: pageNumber, limit: limit };
      const result = await CategoryServices.getCategories(params);
      if (result.status) {
        setCategories(result.data.categories);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
      };
    } catch (error) {
      showToast(error, "error")
    };
  };

  const deleteCategory = async () => {
    try {
      const result = await CategoryServices.deleteCategory(selectedCategory?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      getCategories();
    }
  };

  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    getCategories(debouncedSearch, page);
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (selectedCategory != null) {
      setDefaultData();
    } else {
      reset();
      setImage("");
    };
  }, [selectedCategory]);

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
        open={isCategoryDialogOpen}
        handleClose={handleCategoryDialog}
        title={selectedCategory == null ? "Create Category" : "Update Category"}
        component={"form"}
        onSubmit={handleSubmit(selectedCategory == null ? createCategory : updateCategory)}
      >
        <Grid item md={12}>
          <Grid container spacing={2}>
            <Grid item md={4}>
              <Box
                sx={{
                  border: "1px solid #b5b5b5",
                  borderRadius: "4px"
                }}
              >
                <input
                  id="uploadImage"
                  type="file"
                  onChange={uploadImage}
                  style={{
                    display: "none"
                  }}
                />
                <label
                  htmlFor='uploadImage'
                  style={{
                    width: "100%",
                    height: "126px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {image != "" ? (
                    <CardMedia
                      component={"img"}
                      src={image}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <ImageRounded sx={{ fontSize: "48px" }} />
                  )}
                </label>
              </Box>
            </Grid>
            <Grid item md={8}>
              <Grid container spacing={2}>
                <Grid item md={12}>
                  <Box>
                    <InputField
                      variant={"outlined"}
                      label={"Category Name"}
                      fullWidth={true}
                      type={"text"}
                      value={watch("categoryName")}
                      register={register("categoryName", {
                        required: "Enter Category Name",
                      })}
                      error={errors?.categoryName && true}
                      helperText={errors?.categoryName?.message}
                    />
                  </Box>
                </Grid>
                <Grid item md={12}>
                  <Box>
                    <InputField
                      variant={"outlined"}
                      label={"Type"}
                      fullWidth={true}
                      type={"text"}
                      value={watch("type")}
                      register={register("type", {
                        required: "Enter a type"
                      })}
                      error={errors?.type && true}
                      helperText={errors?.type?.message}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={12}>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <SecondaryButton title={"Cancel"} fullWidth onClick={handleCategoryDialog} />
            </Grid>
            <Grid item md={6}>
              <PrimaryButton title={"Submit"} fullWidth type={"submit"} />
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
      <Dialog
        open={isConfirmationDialogOpen}
        handleClose={handleConfirmationDialog}
        title={"Delete Category"}
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
          <PrimaryButton fullWidth title={"Delete"} onClick={deleteCategory} />
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
                    title={"Create Category"}
                    onClick={() => {
                      setSelectedCategory(null);
                      handleCategoryDialog();
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={12}>
            <TableContainer
              sx={{
                height: "calc(100vh - 226px)",
                overflowY: "auto"
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    {tableHead.map((ind) => (
                      <TableCell key={ind}>{ind}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell>{ind + 1}</TableCell>
                      <TableCell><CardMedia src={item.image} component={"img"} sx={{ width: "80px", height: "40px", objectFit: "cover" }} /></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.type}</TableCell>
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
                              handleCategoryDialog();
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
                  <Typography>Total Categories:</Typography>
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

export default Categories;