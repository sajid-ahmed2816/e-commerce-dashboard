import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CardMedia, Grid, IconButton, InputAdornment, Typography, colors } from '@mui/material';
import { AccessTime, Delete, ErrorOutline, Label, Search } from '@mui/icons-material';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import Dialog from '../../../components/Dialog';
import InputField from '../../../components/InputField';
import useToast from '../../../hooks/useToast';
import BlogServices from '../../../api/blogs/BlogServices';
import useDebounce from '../../../utils/Debounce';
import { useForm } from 'react-hook-form';
import Card from '../../../components/Card';
import Loader from '../../../components/Loader';
import { Switch } from '../../../components/Switch';
import moment from 'moment';

function Blogs() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10; // fixed limit for infinite scroll

  const { showToast } = useToast();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const { register, watch } = useForm({
    defaultValues: { search: searchQuery || "" }
  });

  const scrollContainerRef = useRef(null);

  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  // Fetch blogs (append or replace)
  const getBlogs = async (search, pageNumber, append = false) => {
    try {
      const params = { search, page: pageNumber, limit };
      const result = await BlogServices.getBlogs(params);
      if (result.status) {
        const newBlogs = result?.data?.blogs?.map(b => ({
          ...b,
          image: b.thumbnail,
          tagline: b.title,
          category: { name: b.slug }
        })) || [];

        if (append) {
          setBlogs(prev => [...prev, ...newBlogs]);
        } else {
          setBlogs(newBlogs);
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

  // Delete blog
  const deleteBlog = async () => {
    setIsLoading(true);
    try {
      const result = await BlogServices.deleteBlog(selectedBlog?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        // Refresh list after deletion (reset to page 1)
        setPage(1);
        setHasMore(true);
        setIsDataLoading(true);
        await getBlogs(searchQuery, 1, false);
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle status
  const handleStatus = async (item) => {
    const obj = { status: item.status === "published" ? "draft" : "published" };
    try {
      const result = await BlogServices.updateStatus(item._id, obj);
      if (result) {
        showToast(result?.message, "success");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      // Refresh list (reset to page 1)
      setPage(1);
      setHasMore(true);
      setIsDataLoading(true);
      await getBlogs(searchQuery, 1, false);
    }
  };

  // Compute activeIds whenever blogs change
  useEffect(() => {
    const ids = blogs.filter(p => p.status === "published").map(p => p._id);
    setActiveIds(ids);
  }, [blogs]);

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
    getBlogs(debouncedSearch, 1, false);
  }, [debouncedSearch]);

  // Scroll handler for infinite loading
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      // Load more when scrolled within 100px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (!isLoadingMore && hasMore && !isDataLoading) {
          setIsLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          getBlogs(searchQuery, nextPage, true);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, isDataLoading, page, searchQuery]);

  return (
    <Fragment>
      <Dialog
        open={isConfirmationDialogOpen}
        handleClose={handleConfirmationDialog}
        title={"Delete Blog"}
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
          <PrimaryButton
            fullWidth
            title={"Delete"}
            onClick={deleteBlog}
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
                  fullWidth
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
                    title={"Create Blog"}
                    onClick={() => {
                      setSelectedBlog(null);
                      navigate("/blogs/create-blog");
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item md={12}>
            <Grid container spacing={2}>
              <Grid item md={12}>
                <Box
                  ref={scrollContainerRef}
                  sx={{
                    height: "calc(100vh - 188px)",
                    overflowY: "auto"
                  }}
                >
                  {isDataLoading && page === 1 ? (
                    <Loader />
                  ) : (
                    <Grid container spacing={2}>
                      {blogs.map((item, ind) => (
                        <Grid item md={4} key={ind}>
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
                              src={item?.image}
                              sx={{
                                width: "100%",
                                height: "240px",
                                objectFit: "cover",
                                borderRadius: "8px 8px 0 0"
                              }}
                            />
                            <Box sx={{ p: 2 }}>
                              <Grid
                                container
                                spacing={1}
                                alignItems={"center"}
                              >
                                <Grid item md={12}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Label sx={{ fontSize: 20 }} />
                                    <Typography
                                      variant={"body2"}
                                      sx={{
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        width: "100%"
                                      }}
                                    >
                                      {item?.tagline}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item md={6}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <AccessTime sx={{ fontSize: 20 }} />
                                    <Typography variant={"caption"} sx={{ lineHeight: 1.5 }}>
                                      {moment(item.date).format("DD-MMM-YYYY")}
                                    </Typography>
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
                                      checked={activeIds.includes(item._id)}
                                      onChange={() => handleStatus(item)}
                                    />
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
                                        navigate(`/blogs/update-blog/${item._id}`, { state: item })
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
                                        setSelectedBlog(item);
                                        handleConfirmationDialog();
                                      }}
                                    >
                                      <Delete sx={{ color: colors.common.white }} />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Box>
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
                      <Typography>Total Blogs:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{totalCount}</Typography>
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

export default Blogs;