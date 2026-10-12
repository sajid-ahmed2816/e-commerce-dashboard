import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Box, CardMedia, Grid, InputAdornment, Typography, colors } from '@mui/material';
import PrimaryButton, { SecondaryButton } from '../../components/Button';
import Dialog from '../../components/Dialog';
import { useForm } from 'react-hook-form';
import useToast from '../../hooks/useToast';
import UploadService from '../../api/upload/UploadService';
import { ErrorOutline, ImageRounded, Search } from '@mui/icons-material';
import InputField from '../../components/InputField';
import CategoryServices from '../../api/categories/CategoryServices';
import SelectField from '../../components/SelectField';
import BannerServices from '../../api/banners/BannerServices';
import Loader from '../../components/Loader';
import Card from '../../components/Card';
import { useSearchParams } from 'react-router-dom';
import useDebounce from '../../utils/Debounce';

function Banners() {
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [banners, setBanners] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [image, setImage] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10; // fixed limit for infinite scroll

  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const scrollContainerRef = useRef(null);
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

  const handleBannerDialog = () => setIsBannerDialogOpen((prevOpen) => !prevOpen);
  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  const setDefaultData = () => {
    setValue("tagline", selectedBanner?.tagline);
    setValue("category", selectedBanner?.category?._id);
    setSelectedCategory(selectedBanner?.category?._id);
    setImage(selectedBanner?.image);
  };

  const uploadImage = async (e) => {
    setIsImageLoading(true);
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
    } finally {
      setIsImageLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const result = await CategoryServices.getCategories({ limit: "all" });
      if (result.status) {
        const renamed = result.data.categories.map((item) => ({ name: item.name, value: item._id }));
        setCategories(renamed);
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  // Fetch banners (append or replace)
  const getBanners = async (search, pageNumber, append = false) => {
    try {
      const params = { search, page: pageNumber, limit };
      const result = await BannerServices.getBanners(params);
      if (result.status) {
        const newBanners = result.data.banners || [];
        if (append) {
          setBanners(prev => [...prev, ...newBanners]);
        } else {
          setBanners(newBanners);
        }
        setTotalCount(result.data.pagination.total);
        setHasMore(pageNumber < result.data.pagination.totalPages);
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsDataLoading(false);
      setIsLoadingMore(false);
    }
  };

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
        // Refresh list from page 1
        setPage(1);
        setHasMore(true);
        setIsDataLoading(true);
        await getBanners(searchQuery, 1, false);
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
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
        // Refresh list from page 1
        setPage(1);
        setHasMore(true);
        setIsDataLoading(true);
        await getBanners(searchQuery, 1, false);
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBanner = async () => {
    try {
      const result = await BannerServices.deleteBanner(selectedBanner?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        // Refresh list from page 1
        setPage(1);
        setHasMore(true);
        setIsDataLoading(true);
        await getBanners(searchQuery, 1, false);
      }
    } catch (error) {
      showToast(error, "error");
    }
  };

  const handleStatus = async (banner) => {
    const obj = { isActive: !banner.isActive };
    try {
      const result = await BannerServices.updateStatus(banner._id, obj);
      if (result) {
        showToast(result?.message, "success");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      // Refresh list from page 1
      setPage(1);
      setHasMore(true);
      setIsDataLoading(true);
      await getBanners(searchQuery, 1, false);
    }
  };

  // Compute activeIds whenever banners change
  useEffect(() => {
    const ids = banners.filter(b => b.isActive).map(b => b._id);
    setActiveIds(ids);
  }, [banners]);

  // Set default data when editing
  useEffect(() => {
    if (selectedBanner != null) {
      setDefaultData();
    } else {
      reset();
      setSelectedCategory("");
      setImage("");
    }
  }, [selectedBanner]);

  // Handle search (debounced)
  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set("search", debouncedSearch || "");
      return prev;
    });
    // Reset and fetch first page on search change
    setPage(1);
    setHasMore(true);
    setIsDataLoading(true);
    getBanners(debouncedSearch, 1, false);
  }, [debouncedSearch]);

  // Scroll handler for infinite loading
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (!isLoadingMore && hasMore && !isDataLoading) {
          setIsLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          getBanners(searchQuery, nextPage, true);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, isDataLoading, page, searchQuery]);

  // Load categories on mount
  useEffect(() => {
    getCategories();
  }, []);

  return (
    <Fragment>
      {/* Create/Update Banner Dialog */}
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
                  style={{ display: "none" }}
                />
                <label
                  htmlFor='uploadImage'
                  style={{
                    width: "100%",
                    height: "186px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
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

      {/* Delete Confirmation Dialog */}
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
            <Typography>You won't be able to revert this!</Typography>
          </Box>
        </Grid>
        <Grid item md={6}>
          <SecondaryButton fullWidth title={"Cancel"} onClick={handleConfirmationDialog} />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton fullWidth title={"Delete"} onClick={deleteBanner} />
        </Grid>
      </Dialog>

      {/* Main Content */}
      <Box
        sx={{
          height: "100%",
          width: "100%",
          p: 2
        }}
      >
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
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
            <Grid container spacing={2}>
              <Grid item md={12}>
                <Box
                  ref={scrollContainerRef}
                  sx={{
                    height: "calc(100vh - 184px)",
                    overflowY: "auto"
                  }}
                >
                  {isDataLoading && page === 1 ? (
                    <Loader />
                  ) : (
                    <Grid container spacing={2}>
                      {banners.map((banner, index) => (
                        <Grid item md={6} key={index}>
                          <Card
                            data={banner}
                            primaryOnClick={(banner) => {
                              setSelectedBanner(banner);
                              handleBannerDialog();
                            }}
                            secondaryOnClick={(banner) => {
                              setSelectedBanner(banner);
                              handleConfirmationDialog();
                            }}
                            onChange={(banner) => handleStatus(banner)}
                            activeIds={activeIds}
                          />
                        </Grid>
                      ))}
                      {isLoadingMore && (
                        <Grid item md={12} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <Loader />
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Box>
              </Grid>
              <Grid item md={12}>
                <Grid container alignItems={"center"}>
                  <Grid item md={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "13px" }}>Total Banners:</Typography>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{totalCount}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
}

export default Banners;