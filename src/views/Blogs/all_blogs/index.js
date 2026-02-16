import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CardMedia, Grid, InputAdornment, Paper, Typography, colors } from '@mui/material';
import { ErrorOutline, Search } from '@mui/icons-material';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import Dialog from '../../../components/Dialog';
import InputField from '../../../components/InputField';
import useToast from '../../../hooks/useToast';
import BlogServices from '../../../api/blogs/BlogServices';
import useDebounce from '../../../utils/Debounce';
import TablePagination from '../../../components/Pagination';
import { useForm } from 'react-hook-form';
import Card from '../../../components/Card';

function Blogs() {
  const [isLoading, setIsLoading] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
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

  const getBlogs = async (value, pageNumber) => {
    try {
      const params = { search: value, page: pageNumber, limit: limit };
      const result = await BlogServices.getBlogs(params);
      if (result.status) {
        const arr = result?.data?.blogs?.map(b => ({
          ...b,
          image: b.thumbnail,
          tagline: b.title,
          category: { name: b.slug }
        }))
        setBlogs(arr);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
        const ids = result.data.blogs.filter(p => p.status == "published").map(p => p._id);
        setActiveIds(ids);
      }
    } catch (error) {
      showToast(error, "error");
    };
  };

  const deleteBlog = async () => {
    setIsLoading(true);
    try {
      const result = await BlogServices.deleteBlog(selectedBlog?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        getBlogs();
      }
    } catch (error) {
      showToast(error, "error")
    } finally {
      setIsLoading(false);
    };
  };

  const handleStatus = async (item) => {
    const obj = {}
    if (item.status == "published") {
      obj.status = "draft";
    } else {
      obj.status = "published";
    };
    try {
      const result = await BlogServices.updateStatus(item._id, obj);
      if (result) {
        showToast(result?.message, "success");
      };
    } catch (error) {
      showToast(error, "error");
    } finally {
      getBlogs();
    };
  };

  const searchValue = watch("search");
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    getBlogs(debouncedSearch, page);
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
        title={"Delete Blog"}
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
            onClick={deleteBlog}
            isLoading={isLoading}
            disabled={isLoading}
          />
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
                    title={"Create Blog"}
                    onClick={() => {
                      setSelectedBlog(null);
                      navigate("/blogs/create-blog")
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
                  sx={{
                    height: "calc(100vh - 226px)",
                    overflowY: "auto"
                  }}
                >
                  <Grid container spacing={2}>
                    {blogs.map((item, ind) => (
                      <Grid item md={4} key={ind}>
                        <Card
                          data={item}
                          primaryOnClick={(blog) => {
                            setSelectedBlog(blog);
                            navigate(`/blogs/update-blog/${blog._id}`, {
                              state: blog
                            });
                          }}
                          secondaryOnClick={(blog) => {
                            setSelectedBlog(blog);
                            handleConfirmationDialog();
                          }}
                          onChange={(blog) => handleStatus(blog)}
                          activeIds={activeIds}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
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
                      <Typography>Total Blogs:</Typography>
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
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};

export default Blogs;