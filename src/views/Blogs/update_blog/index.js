import React, { Fragment, useEffect, useState } from 'react'
import { Box, CardMedia, Grid, Paper, Typography } from '@mui/material';
import BlogServices from '../../../api/blogs/BlogServices';
import UploadService from '../../../api/upload/UploadService';
import useToast from '../../../hooks/useToast';
import { useForm } from 'react-hook-form';
import { ImageRounded } from '@mui/icons-material';
import InputField from '../../../components/InputField';
import PrimaryButton, { SecondaryButton } from '../../../components/Button';
import Loader from '../../../components/Loader';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '../../../components/Editor';
import moment from 'moment';

function UpdateBlog() {
    const [image, setImage] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm({
        defaultValues: {
            size: []
        }
    });
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { state } = useLocation();

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
        };
    };

    const updateBlog = async (formData) => {
        setIsLoading(true);
        const obj = {
            title: formData.title,
            date: formData.date,
            content: getValues("content"),
            thumbnail: image,
            status: "draft"
        };
        try {
            const result = await BlogServices.updateBlog(state?._id, obj);
            if (result.status) {
                showToast(result.message, "success");
                navigate(-1);
            }
        } catch (error) {
            showToast(error, "error");
        } finally {
            setIsLoading(false);
        };
    };

    const onReset = () => {
        reset();
        setImage("");
    };

    const setDefaultData = () => {
        const date = moment(state.date).format("YYYY-MM-DD")
        console.log("🚀 ~ setDefaultData ~ date:", date)
        setValue("title", state?.title);
        setValue("date", date);
        setValue("content", state?.content);
        setImage(state?.thumbnail);
        setValue("status", state?.status);
    };

    useEffect(() => {
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
                    onSubmit={handleSubmit(updateBlog)}
                >
                    <Grid item md={12}>
                        <Box>
                            <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                Update Blog
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item md={12}>
                        <Box
                            sx={{
                                height: "300px",
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
                                            height: "300px",
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
                                                        height: "300px",
                                                        borderRadius: "4px",
                                                        objectFit: "contain"
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
                                label={"Title"}
                                fullWidth={true}
                                type={"text"}
                                value={watch("title")}
                                register={register("title", {
                                    required: "Enter Blog title",
                                })}
                                error={errors?.title && true}
                                helperText={errors?.title?.message}
                            />
                        </Box>
                    </Grid>
                    <Grid item md={6}>
                        <Box>
                            <InputField
                                variant={"outlined"}
                                fullWidth={true}
                                type={"date"}
                                value={watch("date")}
                                register={register("date", {
                                    required: "Enter Blog Date",
                                })}
                                error={errors?.date && true}
                                helperText={errors?.date?.message}
                            />
                        </Box>
                    </Grid>
                    <Grid item md={12}>
                        <Box>
                            <Editor
                                value={watch("content")}
                                onChange={(data) => setValue("content", data)}
                                error={errors?.content?.message}
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
                            title={"Update"}
                            type={"submit"}
                            fullWidth={true}
                            isLoading={isLoading}
                            disabled={isLoading} />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default UpdateBlog;
