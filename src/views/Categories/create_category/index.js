import React from 'react'
import { Box, Grid, IconButton, Input, Typography, } from '@mui/material';
import BreadCrumb from '../../../components/BreadCrumb';
import { KeyboardArrowLeft, ImageRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import colors from '../../../assets/styles/colors';
import InputField from '../../../components/InputField';
import { useForm } from 'react-hook-form';

function CreateCategory() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const handleFileUpload = (file) => {
    console.log("file ===>", file);
  }
  return (
    <Box>
      <Grid container
        sx={{
          background: colors.darkGrey,
          borderRadius: "6px",
          color: colors.white
        }}
      >
        <Grid item md={6}>
          <Box
            sx={{
              pl: 1,
              display: "flex",
              gap: "8px",
              alignItems: "center",
              height: "100%"
            }}
          >
            <IconButton
              onClick={() => navigate(-1)}
            >
              <KeyboardArrowLeft sx={{ color: colors.white }} />
            </IconButton>
            <Typography variant='body2'>
              Create Category
            </Typography>
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <BreadCrumb currentPage={"Create Category"} />
          </Box>
        </Grid>
      </Grid>
      <Grid
        container
        justifyContent={"center"}
      >
        <Grid item md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              p: 3
            }}
          >
            <Box>
              <InputField
                variant={"outlined"}
                label={"Category Name"}
                fullWidth={true}
                type={"text"}
                register={register("categoryName", {
                  required: "Category Name"
                })}
                error={errors?.categoryName && true}
                helperText={errors?.categoryName?.message}
              />
            </Box>
            <Box
              sx={{
                border: "1px solid #b5b5b5",
                borderRadius: "4px"
              }}
            >
              <input
                id="uploadImage"
                type="file"
                style={{
                  display: "none"
                }}
              />
              <label
                htmlFor='uploadImage'
                style={{
                  width: "100%",
                  height: "250px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImageRounded sx={{ fontSize: "48px" }} />
              </label>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CreateCategory;