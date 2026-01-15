import React, { Fragment, useEffect, useState } from 'react';
import { Box, CardMedia, Grid, IconButton, Paper, Table, TableBody, TableContainer, TableHead, Typography, colors } from '@mui/material';
import PrimaryButton, { SecondaryButton } from '../../components/Button';
import TableRow from '../../components/TableRow';
import TableCell from '../../components/TableCell';
import Dialog from '../../components/Dialog';
import { useForm } from 'react-hook-form';
import useToast from '../../hooks/useToast';
import UploadService from '../../api/upload/UploadService';
import { AccessTime, Category, Delete, ErrorOutline, ImageRounded, Label } from '@mui/icons-material';
import InputField from '../../components/InputField';
import CategoryServices from '../../api/categories/CategoryServices';
import SelectField from '../../components/SelectField';
import BannerServices from '../../api/banners/BannerServices';
import Loader from '../../components/Loader';
import moment from 'moment';
import { Switch } from '../../components/Switch';

function Banners() {
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [banners, setBanners] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [image, setImage] = useState("");
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { showToast } = useToast();

  const handleBannerDialog = () => setIsBannerDialogOpen((prevOpen) => !prevOpen);
  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  const setDefaultData = () => {
    setValue("tagline", selectedBanner?.tagline);
    setValue("category", selectedBanner?.category?._id);
    setSelectedCategory(selectedBanner?.category?._id);
    setImage(selectedBanner?.image);
  };

  const uploadImage = async (e) => {
    setIsImageLoading(true)
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await UploadService.uploadImage(formData);
      if (result) {
        showToast(result.message, "success");
        setImage(result.url);
      };
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsImageLoading(false);
    };
  };

  const getCategories = async () => {
    try {
      const result = await CategoryServices.getCategories();
      if (result.status) {
        const renamed = result.data.categories.map((item) => ({ name: item.name, value: item._id }));
        setCategories(renamed);
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  const getBanners = async () => {
    try {
      const result = await BannerServices.getBanners();
      if (result.status) {
        setBanners(result.data.banners);
        const ids = result.data.banners.filter(b => b.isActive).map(b => b._id);
        setActiveIds(ids);
      }
    } catch (error) {
      showToast(error, "error");
    }
  }

  const createBanner = async (formData) => {
    const obj = {
      tagline: formData.tagline,
      category: formData.category,
      image: image
    };
    try {
      setIsLoading(true);
      const result = await BannerServices.createBanner(obj);
      if (result.status) {
        showToast(result.message, "success");
        reset();
        setImage("");
        handleBannerDialog();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsLoading(false);
      getBanners();
    }
  };

  const updateBanner = async (formData) => {
    const obj = {
      tagline: formData.tagline,
      category: formData.category,
      image: image
    };
    try {
      setIsLoading(true);
      const result = await BannerServices.updateBanner(selectedBanner?._id, obj);
      if (result.status) {
        showToast(result.message, "success");
        handleBannerDialog();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsLoading(false);
      getBanners();
    }
  };

  const deleteBanner = async () => {
    try {
      const result = await BannerServices.deleteBanner(selectedBanner?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      getBanners();
    }
  };

  const handleStatus = async (banner) => {
    const obj = {}
    if (banner.isActive) {
      obj.isActive = false;
    } else {
      obj.isActive = true;
    };
    try {
      const result = await BannerServices.updateStatus(banner._id, obj);
      if (result) {
        showToast(result?.message, "success");
      };
    } catch (error) {
      showToast(error, "error");
    } finally {
      getBanners();
    };
  };

  useEffect(() => {
    getBanners();
    getCategories();
  }, []);

  useEffect(() => {
    if (selectedBanner != null) {
      setDefaultData();
    } else {
      reset();
      setSelectedCategory("");
      setImage("");
    };
  }, [selectedBanner]);

  return (
    <Fragment>
      <Dialog
        maxWidth={"md"}
        fullWidth={true}
        open={isBannerDialogOpen}
        handleClose={handleBannerDialog}
        title={selectedBanner == null ? "Create Banner" : "Update Banner"}
        component={"form"}
        onSubmit={handleSubmit(selectedBanner == null ? createBanner : updateBanner)}
      >
        <Grid item md={12}>
          <Box
            sx={{
              height: "186px",
              border: "1px solid #b5b5b5",
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden",
              "&:hover .overlay": {
                opacity: 1,
              },
            }}
          >
            {isImageLoading ? (
              <Loader />
            ) : (
              <Fragment>
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
                    height: "186px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {image != "" ? (
                    <Fragment>
                      <CardMedia
                        component={"img"}
                        src={image}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      <Box
                        className="overlay"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(0,0,0,0.4)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.3s",
                          fontSize: 16,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <ImageRounded sx={{ fontSize: "48px" }} />
                        <Typography>Upload Image</Typography>
                      </Box>
                    </Fragment>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <ImageRounded sx={{ fontSize: "48px" }} />
                      <Typography>Upload Image</Typography>
                    </Box>
                  )}
                </label>
              </Fragment>
            )}
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Tagline"}
              fullWidth={true}
              type={"text"}
              value={watch("tagline")}
              register={register("tagline", {
                required: "Enter a Tagline"
              })}
              error={errors?.tagline && true}
              helperText={errors?.tagline?.message}
            />
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box>
            <SelectField
              label={"Category"}
              fullWidth={true}
              value={selectedCategory}
              register={register("category", {
                required: "Select a Category",
                onChange: (e) => setSelectedCategory(e.target.value),
              })}
              error={errors?.category && true}
              helperText={errors?.category?.message}
              options={categories}
            />
          </Box>
        </Grid>
        <Grid item md={6}>
          <SecondaryButton title={"Cancel"} fullWidth onClick={handleBannerDialog} />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton
            title={"Submit"}
            fullWidth
            type={"submit"}
            isLoading={isLoading}
          />
        </Grid>
      </Dialog>
      <Dialog
        open={isConfirmationDialogOpen}
        handleClose={handleConfirmationDialog}
        title={"Delete Banner"}
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
          <PrimaryButton fullWidth title={"Delete"} onClick={deleteBanner} />
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
                title={"Create Banner"}
                onClick={() => {
                  setSelectedBanner(null);
                  handleBannerDialog();
                }}
              />
            </Box>
          </Grid>
          <Grid item md={12}>
            <Box
              sx={{
                height: "calc(100vh - 176px)",
                overflowY: "auto",
                p: 1
              }}
            >
              <Grid container spacing={2}>
                {banners.map((banner) => (
                  <Grid item md={6}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        boxShadow: "0px 0px 5px 2px #E6E6E6",
                        borderRadius: 2
                      }}
                    >
                      <CardMedia
                        component={"img"}
                        src={banner?.image}
                        sx={{
                          width: "100%",
                          height: "240px",
                          objectFit: "cover",
                          borderRadius: "8px 8px 0 0"
                        }}
                      />
                      <Grid
                        container
                        spacing={1}
                        sx={{ p: 2 }}
                      >
                        <Grid item md={6}>
                          <Box
                            sx={{
                              height: "-webkit-fill-available",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between"
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Label sx={{ fontSize: 20 }} />
                              <Typography variant={"body2"}>
                                {banner?.tagline}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Category sx={{ fontSize: 20 }} />
                              <Typography variant={"body2"}>
                                {banner?.category?.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item md={6}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              checked={activeIds.includes(banner._id)}
                              onChange={() => handleStatus(banner)}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            <AccessTime sx={{ fontSize: 20 }} />
                            <Typography variant={"caption"} sx={{ lineHeight: 1.5 }}>
                              {moment(banner.createdAt).format("DD-MMM-YYYY")}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item md={12}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <PrimaryButton
                              title={"Edit"}
                              fullWidth={true}
                              onClick={() => {
                                setSelectedBanner(banner);
                                handleBannerDialog();
                              }}
                            />
                            <IconButton
                              sx={{
                                background: colors.red.A700,
                                width: 36.5,
                                height: 36.5,
                                border: "1px solid transparent",
                                ":hover": {
                                  border: `1px solid ${colors.red.A700}`,
                                  svg: {
                                    color: colors.red.A700,
                                  }
                                }
                              }}
                              onClick={() => {
                                setSelectedBanner(banner);
                                handleConfirmationDialog();
                              }}
                            >
                              <Delete sx={{ color: colors.common.white }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};

export default Banners;