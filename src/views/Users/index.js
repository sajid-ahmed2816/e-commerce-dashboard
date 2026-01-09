import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CardMedia, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableContainer, TableHead, Typography, colors } from '@mui/material';
import { Delete, Edit, ErrorOutline, ImageRounded, Search } from '@mui/icons-material';
import PrimaryButton, { SecondaryButton } from '../../components/Button';
import TableRow from '../../components/TableRow';
import TableCell from '../../components/TableCell';
import Dialog from '../../components/Dialog';
import InputField from '../../components/InputField';
import UserServices from '../../api/users/UserServices';
import useToast from '../../hooks/useToast';
import useDebounce from '../../utils/Debounce';
import TablePagination from '../../components/Pagination';
import { useForm } from 'react-hook-form';
import moment from 'moment';

const tableHead = ["S.No", "Name", "Email", "Created At", "Actions"];

function Users() {
  const [isLoading, setIsLoading] = useState("");
  const [users, setUsers] = useState([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const searchQuery = searchParams.get("search") || "";

  const handleUserDialog = () => setIsUserDialogOpen((prevOpen) => !prevOpen);
  const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

  const getUsers = async (value, pageNumber, category) => {
    try {
      const params = { search: value, page: pageNumber, limit: limit };
      const result = await UserServices.getUsers(params);
      if (result.status) {
        setUsers(result.data.users);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
      }
    } catch (error) {
      showToast(error, "error")
    }
  };

  const updateUser = async (formData) => {
    setIsLoading(true);
    const obj = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    };
    try {
      const result = await UserServices.updateUser(selectedUser?._id, obj);
      if (result.status) {
        showToast(result.message, "success");
        navigate(-1);
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async () => {
    setIsLoading(true);
    try {
      const result = await UserServices.deleteUser(selectedUser?._id);
      if (result.status) {
        showToast(result.message, "success");
        handleConfirmationDialog();
        getUsers();
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
    getUsers(debouncedSearch, page);
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
        open={isUserDialogOpen}
        handleClose={handleUserDialog}
        title={selectedUser == null ? "Create User" : "Update User"}
        component={"form"}
        onSubmit={handleSubmit(updateUser)}
      >
        <Grid item md={6}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"First Name"}
              fullWidth={true}
              type={"text"}
              value={watch("firstName")}
              register={register("firstName", {
                required: "Enter First Name",
              })}
              error={errors?.firstName && true}
              helperText={errors?.firstName?.message}
            />
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Last Name"}
              fullWidth={true}
              type={"text"}
              value={watch("lastName")}
              register={register("lastName", {
                required: "Enter Last Name",
              })}
              error={errors?.lastName && true}
              helperText={errors?.lastName?.message}
            />
          </Box>
        </Grid>
        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Email"}
              fullWidth={true}
              type={"text"}
              value={watch("email")}
              register={register("email", {
                required: "Enter a email"
              })}
              error={errors?.email && true}
              helperText={errors?.email?.message}
            />
          </Box>
        </Grid>
        <Grid item md={12}>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <SecondaryButton title={"Cancel"} fullWidth onClick={handleUserDialog} />
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
        title={"Delete Product"}
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
            onClick={deleteUser}
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
                  {users.map((item, ind) => (
                    <TableRow key={ind}>
                      <TableCell>{ind + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
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
                              setSelectedUser(item);
                              handleUserDialog();
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setSelectedUser(item);
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
                  <Typography>Total Users:</Typography>
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

export default Users;