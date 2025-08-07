import React, { Fragment, useState } from 'react';
import { Box, CardMedia, DialogTitle, Grid, Paper, Table, TableBody, TableContainer, TableHead } from '@mui/material';
import { ImageRounded } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import TableRow from '../../../components/TableRow';
import TableCell from '../../../components/TableCell';
import Dialog from '../../../components/Dialog';
import InputField from '../../../components/InputField';
import UploadService from '../../../api/upload/UploadService';
import useToast from '../../../hooks/useToast';

const tableHead = ["S.No", "Image", "Name", "Type", "Created At", "Actions"];

function Categories() {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [image, setImage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { showToast } = useToast();

  const handleCategoryDialog = () => setIsCategoryDialogOpen((prevOpen) => !prevOpen);

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
  }

  return (
    <Fragment>
      <Dialog
        open={isCategoryDialogOpen}
        handleClose={handleCategoryDialog}
        title={"Create Category"}
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
                      register={register("categoryName", {
                        required: "Enter Category Name"
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
              <PrimaryButton title={"Create Category"} onClick={() => handleCategoryDialog()} />
            </Box>
          </Grid>
          <Grid item md={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {tableHead.map((ind) => (
                      <TableCell key={ind}>{ind}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>

                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};

export default Categories;