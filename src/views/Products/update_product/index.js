import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import CategoryServices from '../../../api/categories/CategoryServices';
import useToast from '../../../hooks/useToast';
import ProductServices from '../../../api/products/ProductServices';
import UploadService from '../../../api/upload/UploadService';
import { Box, CardMedia, Grid, Paper, Typography } from '@mui/material';
import Loader from '../../../components/Loader';
import { ImageRounded } from '@mui/icons-material';
import InputField from '../../../components/InputField';
import SelectField from '../../../components/SelectField';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';

function UpdateProduct() {
  const [image, setImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { state } = useLocation();

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

  const updateProduct = async (formData) => {
    setIsLoading(true);
    const obj = {
      name: formData.name,
      category: formData.category,
      type: formData.type,
      image: image,
      price: formData.price,
      description: formData.description
    };
    try {
      const result = await ProductServices.updateProduct(state?._id, obj);
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

  const onReset = () => {
    reset();
    setImage("");
    setSelectedCategory("");
    setValue("description", "");
  };

  const setDefaultData = () => {
    setValue("name", state?.name);
    setValue("type", state?.type);
    setImage(state?.image);
    setSelectedCategory(state?.category?._id);
    setValue("category", state?.category?._id);
    setValue("price", state?.price);
    setValue("description", state?.description);
  };

  useEffect(() => {
    getCategories();
    setDefaultData();
  }, []);

  return (
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
      <Grid
        container
        spacing={2}
        component={"form"}
        onSubmit={handleSubmit(updateProduct)}
      >
        <Grid item md={12}>
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
                height: "171px",
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
              ) : isImageLoading ? (
                <Loader />
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
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Name"}
              fullWidth={true}
              type={"text"}
              value={watch("name")}
              register={register("name", {
                required: "Enter Product Name",
              })}
              error={errors?.name && true}
              helperText={errors?.name?.message}
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
          <Box>
            <InputField
              variant={"outlined"}
              label={"Type"}
              fullWidth={true}
              type={"text"}
              value={watch("type")}
              register={register("type", {
                required: "Enter Product Type",
              })}
              error={errors?.type && true}
              helperText={errors?.type?.message}
            />
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Price"}
              fullWidth={true}
              type={"text"}
              value={watch("price")}
              register={register("price", {
                required: "Enter Product Price",
              })}
              error={errors?.price && true}
              helperText={errors?.price?.message}
            />
          </Box>
        </Grid>
        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Description"}
              fullWidth={true}
              multiline={true}
              rows={6}
              type={"text"}
              value={watch("description")}
              register={register("description", {
                required: "Enter Product Description",
              })}
              error={errors?.description && true}
              helperText={errors?.description?.message}
            />
          </Box>
        </Grid>
        <Grid item md={6}>
          <SecondaryButton
            title={"Reset"}
            fullWidth={true}
            onClick={onReset}
          />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton
            title={"Create"}
            type={"submit"}
            fullWidth={true}
            isLoading={isLoading}
            disabled={isLoading} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default UpdateProduct
