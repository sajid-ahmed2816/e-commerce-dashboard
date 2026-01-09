import React, { Fragment, useEffect, useState } from 'react'
import { Box, CardMedia, Grid, Paper, Typography } from '@mui/material';
import ProductServices from '../../../api/products/ProductServices';
import UploadService from '../../../api/upload/UploadService';
import CategoryServices from '../../../api/categories/CategoryServices';
import SelectField from '../../../components/SelectField';
import useToast from '../../../hooks/useToast';
import { useForm, Controller } from 'react-hook-form';
import { ImageRounded } from '@mui/icons-material';
import InputField from '../../../components/InputField';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import Loader from '../../../components/Loader';
import SizeServices from '../../../api/sizes/SizeServices';
import MultiSelectField from '../../../components/MultiSelectField';

function CreateProduct() {
  const [image, setImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { register, handleSubmit, formState: { errors }, reset, watch, control } = useForm({
    defaultValues: {
      size: []
    }
  });
  const { showToast } = useToast();

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

  const createProduct = async (formData) => {
    setIsLoading(true);
    const obj = {
      name: formData.name,
      category: formData.category,
      image: image,
      price: formData.price,
      description: formData.description
    };
    try {
      const result = await ProductServices.createProduct(obj);
      if (result.status) {
        showToast(result.message, "success");
        reset();
        setSelectedCategory("");
        setImage("");
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
    };
  };

  const getSizes = async () => {
    try {
      const result = await SizeServices.getSizes();
      if (result.status) {
        const renamed = result.data.sizes.map((item) => ({ name: item.size, value: item._id }));
        setSizes(renamed);
      }
    } catch (error) {
      showToast(error, "error");
    };
  };

  const onReset = () => {
    reset();
    setImage("");
    setSelectedCategory("");
  };

  useEffect(() => {
    getCategories();
    getSizes();
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
      <Box
        sx={{
          height: "calc(100vh - 116px)",
          overflowY: "auto"
        }}
      >
        <Grid
          container
          spacing={2}
          component={"form"}
          onSubmit={handleSubmit(createProduct)}
        >
          <Grid item md={12}>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                Create Product
              </Typography>
            </Box>
          </Grid>
          <Grid item md={6}>
            <Box
              sx={{
                height: "-webkit-fill-available",
                border: "1px solid #b5b5b5",
                borderRadius: "4px",
                position: "relative",
                overflow: "hidden",
                "&:hover .overlay": {
                  opacity: 1,
                },
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
                  height: "-webkit-fill-available",
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
                        height: "calc(100vh - 219px)",
                        borderRadius: "4px",
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
            <Grid
              container
              spacing={2}
            >
              <Grid item md={12}>
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
              <Grid item md={12}>
                <Box>
                  <Controller
                    name={"size"}
                    control={control}
                    rules={{ required: "Select a size" }}
                    render={({ field }) => (
                      <MultiSelectField
                        label={"Size"}
                        fullWidth={true}
                        value={field?.value}
                        onChange={field?.onChange}
                        error={errors?.size && true}
                        helperText={errors?.size?.message}
                        options={sizes}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item md={12}>
                <Box>
                  <InputField
                    variant={"outlined"}
                    label={"Price"}
                    fullWidth={true}
                    type={"text"}
                    value={watch("price")}
                    register={register("price", {
                      required: "Enter Category Name",
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
                    label={"Name"}
                    fullWidth={true}
                    type={"text"}
                    value={watch("name")}
                    register={register("name", {
                      required: "Enter Category Name",
                    })}
                    error={errors?.name && true}
                    helperText={errors?.name?.message}
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
            </Grid>
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
    </Box>
  )
}

export default CreateProduct