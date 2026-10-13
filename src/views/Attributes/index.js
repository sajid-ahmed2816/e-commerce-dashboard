import React, { Fragment, useEffect, useState } from 'react';
import { Box, colors, Divider, Grid, Paper, Stack, Typography, } from "@mui/material";
import { Add, ErrorOutline } from "@mui/icons-material";
import { useForm } from 'react-hook-form';
import { Edit, Delete } from '../../assets/icons';
import Dialog from '../../components/Dialog';
import InputField from '../../components/InputField';
import { Switch } from '../../components/Switch';
import PrimaryButton, { IconButton, SecondaryButton } from '../../components/Button';
import AttributeServices from '../../api/attributes/AttributeServices';
import useToast from '../../hooks/useToast';
import AttributeValueServices from '../../api/attribute_values/AttributeValueServices';
import Loader from '../../components/Loader';

function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [isAttributeValuesLoading, setIsAttributeValuesLoading] = useState(false);
  const [isDeleteAttributeConfirmationDialogOpen, setIsDeleteAttributeConfirmationDialogOpen] = useState(false);
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [isAttributeValueDialogOpen, setIsAttributeValueDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedAttributeForEdit, setSelectedAttributeForEdit] = useState(null);
  const [selectedAttributeValue, setSelectedAttributeValue] = useState(null);
  const [selectedAttributeValueForEdit, setSelectedAttributeValueForEdit] = useState(null);
  const [isAULoading, setIsAULoading] = useState(false);
  const [isADLoading, setIsADLoading] = useState(false);
  const [isAVLoading, setIsAVLoading] = useState(false);

  const {
    register: register1,
    handleSubmit: handleSubmit1,
    reset: reset1,
    setValue: setValue1,
    formState: { errors: errors1 },
    watch: watch1
  } = useForm({
    defaultValues: {
      attributeName: "",
      attributeDescription: "",
      isActive: true,
    }
  });
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    reset: reset2,
    setValue: setValue2,
    formState: { errors: errors2 },
    watch: watch2
  } = useForm({
    defaultValues: {
      attributeValue: "",
      attributeValueDescription: "",
      valueIsActive: true,
    }
  });

  const { showToast } = useToast();

  const handleAttributeDialog = () => {
    setIsAttributeDialogOpen((prev) => !prev);
  };

  const handleDeleteAttributeConfirmationDialog = () => {
    setIsDeleteAttributeConfirmationDialogOpen((prevOpen) => !prevOpen);
  };

  const openCreateAttribute = () => {
    setSelectedAttributeForEdit(null);
    reset1({
      attributeName: "",
      attributeDescription: "",
      isActive: true,
    });
    setIsAttributeDialogOpen(true);
  };

  const openEditAttribute = () => {
    setSelectedAttributeForEdit(selectedAttribute);
    reset1({
      attributeName: selectedAttribute?.name || "",
      attributeDescription: selectedAttribute?.description || "",
      isActive: selectedAttribute?.isActive ?? true,
    });
    setIsAttributeDialogOpen(true);
  };

  const handleAttributeValueDialog = () => {
    setIsAttributeValueDialogOpen((prev) => !prev);
  };

  const openCreateAttributeValue = () => {
    setSelectedAttributeValueForEdit(null);
    reset2({
      attributeValue: "",
      attributeValueDescription: "",
      valueIsActive: true,
    });
    setIsAttributeValueDialogOpen(true);
  };

  const openEditAttributeValue = (item) => {
    setSelectedAttributeValue(item);
    setSelectedAttributeValueForEdit(item);
    reset2({
      attributeValue: item.value || "",
      attributeValueDescription: item.description || "",
      valueIsActive: item.isActive ?? true,
    });
    setIsAttributeValueDialogOpen(true);
  };

  const getAttributes = async () => {
    try {
      const result = await AttributeServices.getAttributes({ page: 1, limit: "all" });
      if (result.status) {
        setAttributes(result?.data?.attributes);
      };
    } catch (error) {
      showToast(error, "error");
    };
  };

  const getAttributeValues = async (attributeId) => {
    if (!attributeId) {
      setAttributeValues([]);
      return;
    }
    setIsAttributeValuesLoading(true);
    try {
      const params = {
        attribute: attributeId,
        page: 1,
        limit: "all",
      };
      const result = await AttributeValueServices.getAttributeValues(params);
      if (result.status) {
        setAttributeValues(
          result?.data?.attributeValues || []
        );
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsAttributeValuesLoading(false);
    };
  };

  const createAttribute = async (formData) => {
    setIsAULoading(true);
    const obj = {
      name: formData.attributeName,
      description: formData.attributeDescription,
      isActive: formData.isActive
    };
    try {
      const result = await AttributeServices.createAttribute(obj);
      if (result.status) {
        showToast(result.message, "success");
        reset1();
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsAULoading(false);
    }
  };

  const updateAttribute = async (formData) => {
    setIsAULoading(true);
    const obj = {
      name: formData.attributeName,
      description: formData.attributeDescription,
    };
    try {
      const result = await AttributeServices.updateAttribute(selectedAttributeForEdit?._id, obj);
      if (result.status) {
        showToast(result.message, "success");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsAULoading(false);
    }
  };

  const deleteAttribute = async (id) => {
    if (!id) return;
    setIsADLoading(true);
    try {
      const result = await AttributeServices.deleteAttribute(id);
      if (result.status) {
        showToast(result.message, "success");
        setSelectedAttribute(null);
        setSelectedAttributeForEdit(null);
        setAttributeValues([]);
        getAttributes();
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsADLoading(false);
    };
  };

  const createAttributeValue = async (formData) => {
    setIsAVLoading(true);
    const obj = {
      attribute: selectedAttribute?._id,
      value: formData.attributeValue,
      description: formData.attributeValueDescription,
      isActive: formData.valueIsActive,
    };
    try {
      const result = await AttributeValueServices.createAttributeValue(obj);
      if (result.status) {
        showToast(result.message, "success");
        reset2();
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsAVLoading(false);
    }
  };

  const updateAttributeValue = async (formData) => {
    setIsAVLoading(true);
    const obj = {
      value: formData.attributeValue,
      description: formData.attributeValueDescription,
      isActive: formData.valueIsActive,
    };
    try {
      const result = await AttributeValueServices.updateAttributeValue(selectedAttributeValue?._id, obj);
      if (result.status) {
        showToast(result.message, "success");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsAVLoading(false);
    }
  };

  useEffect(() => {
    getAttributes();
  }, []);

  return (
    <Fragment>
      <Dialog
        maxWidth={"sm"}
        open={isAttributeDialogOpen}
        handleClose={handleAttributeDialog}
        title={
          selectedAttributeForEdit == null
            ? "Create Attribute"
            : "Update Attribute"
        }
        component={"form"}
        onSubmit={handleSubmit1(
          selectedAttributeForEdit == null
            ? createAttribute
            : updateAttribute
        )}
      >
        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Attribute Name"}
              fullWidth={true}
              type={"text"}
              value={watch1("attributeName")}
              register={register1("attributeName", {
                required: "Enter Attribute Name",
              })}
              error={errors1?.attributeName && true}
              helperText={errors1?.attributeName?.message}
            />
          </Box>
        </Grid>

        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Description"}
              fullWidth={true}
              type={"text"}
              multiline={true}
              rows={4}
              value={watch1("attributeDescription")}
              register={register1("attributeDescription")}
              error={errors1?.attributeDescription && true}
              helperText={errors1?.attributeDescription?.message}
            />
          </Box>
        </Grid>

        {selectedAttributeForEdit != null && (
          <Grid item md={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Typography
                component={"label"}
                variant={"caption"}
                htmlFor={"isActive"}
              >
                Is this attribute active?
              </Typography>

              <Switch
                id={"isActive"}
                checked={watch1("isActive")}
                onChange={(e) =>
                  setValue1("isActive", e.target.checked)
                }
              />
            </Box>
          </Grid>
        )}

        <Grid item md={12}>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <SecondaryButton
                fullWidth
                title={"Cancel"}
                onClick={handleAttributeDialog}
              />
            </Grid>

            <Grid item md={6}>
              <PrimaryButton
                fullWidth
                type={"submit"}
                title={selectedAttributeValue == null ? "Submit" : "Update"}
                isLoading={isAULoading}
                disabled={isAULoading}
              />
            </Grid>
          </Grid>
        </Grid>
      </Dialog>

      <Dialog
        maxWidth={"sm"}
        open={isAttributeValueDialogOpen}
        handleClose={handleAttributeValueDialog}
        title={
          selectedAttributeValueForEdit == null
            ? "Add Attribute Value"
            : "Update Attribute Value"
        }
        component={"form"}
        onSubmit={handleSubmit2(
          selectedAttributeValue == null
            ? createAttributeValue
            : updateAttributeValue
        )}
      >
        <Grid item md={12}>
          <Box
            sx={{
              p: 1.5,
              border: "1px solid #b5b5b5",
              borderRadius: "4px",
              backgroundColor: "#fafafa"
            }}
          >
            <Typography
              variant={"caption"}
              sx={{
                display: "block",
                color: "text.secondary",
                mb: 0.5
              }}
            >
              Attribute
            </Typography>

            <Typography
              variant={"body2"}
              sx={{
                fontWeight: 600
              }}
            >
              {selectedAttributeForEdit?.name || "-"}
            </Typography>
          </Box>
        </Grid>

        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Value"}
              fullWidth={true}
              type={"text"}
              value={watch2("attributeValue")}
              register={register2("attributeValue", {
                required: "Enter Attribute Value",
              })}
              error={errors2?.attributeValue && true}
              helperText={errors2?.attributeValue?.message}
            />
          </Box>
        </Grid>

        <Grid item md={12}>
          <Box>
            <InputField
              variant={"outlined"}
              label={"Description"}
              fullWidth={true}
              type={"text"}
              multiline={true}
              rows={3}
              value={watch2("attributeValueDescription")}
              register={register2("attributeValueDescription")}
              error={errors2?.attributeValueDescription && true}
              helperText={errors2?.attributeValueDescription?.message}
            />
          </Box>
        </Grid>

        {selectedAttributeValue != null && (
          <Grid item md={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Typography
                component={"label"}
                variant={"caption"}
                htmlFor={"valueIsActive"}
              >
                Is this value active?
              </Typography>

              <Switch
                id={"valueIsActive"}
                checked={watch2("valueIsActive")}
                onChange={(e) =>
                  setValue2(
                    "valueIsActive",
                    e.target.checked
                  )
                }
              />
            </Box>
          </Grid>
        )}

        <Grid item md={12}>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <SecondaryButton
                fullWidth
                title={"Cancel"}
                onClick={handleAttributeValueDialog}
              />
            </Grid>

            <Grid item md={6}>
              <PrimaryButton
                fullWidth
                type={"submit"}
                title={selectedAttributeValueForEdit == null ? "Submit" : "Update"}
                isLoading={isAVLoading}
                disabled={isAVLoading}
              />
            </Grid>
          </Grid>
        </Grid>
      </Dialog>

      <Dialog
        open={isDeleteAttributeConfirmationDialogOpen}
        handleClose={handleDeleteAttributeConfirmationDialog}
        title={"Delete Attribute"}
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
          <SecondaryButton fullWidth title={"Cancel"} onClick={handleDeleteAttributeConfirmationDialog} />
        </Grid>
        <Grid item md={6}>
          <PrimaryButton
            fullWidth
            title={"Delete"}
            onClick={() => deleteAttribute(selectedAttribute?._id)}
            isLoading={isADLoading}
            disabled={isADLoading}
          />
        </Grid>
      </Dialog>

      <Box
        sx={{
          width: "100%",
          height: "100%",
          p: 2,
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
            }}
          >
            Attributes
          </Typography>

          <PrimaryButton
            startIcon={<Add />}
            onClick={openCreateAttribute}
            title={"Add Attribute"}
          />
        </Box>

        <Divider />

        <Box
          sx={{
            height: "calc(100vh - 150px)",
            overflowY: "auto"
          }}
        >
          {/* CONTENT */}
          <Grid container spacing={2} sx={{ mt: 0, height: "100%" }}>
            {/* LEFT - ATTRIBUTES */}
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: "4px",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Attribute List
                  </Typography>
                </Box>

                <Divider />

                <Stack>
                  {attributes.map((attribute) => {
                    const isSelected =
                      selectedAttributeForEdit?._id === attribute._id;

                    return (
                      <Box
                        key={attribute._id}
                        onClick={() => {
                          setSelectedAttribute(attribute);
                          setSelectedAttributeForEdit(attribute);
                          getAttributeValues(attribute._id);
                        }}
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          borderBottom: "1px solid #eeeeee",
                          backgroundColor: isSelected
                            ? "#f5f5f5"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: "#f7f7f7",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                              }}
                            >
                              {attribute.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {attribute.description || "-"}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor:
                                attribute.isActive
                                  ? "green"
                                  : "#bdbdbd",
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>

            {/* RIGHT - VALUES */}
            <Grid item xs={12} md={8}>
              <Paper
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: "4px",
                }}
              >
                {selectedAttribute ? (
                  <>
                    {/* ATTRIBUTE HEADER */}
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {selectedAttribute.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {selectedAttribute.description || "-"}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                      >
                        <SecondaryButton
                          size={"small"}
                          startIcon={<Delete />}
                          onClick={() => handleDeleteAttributeConfirmationDialog()}
                          title={"Delete"}
                          color={colors.red.A700}
                        />

                        <SecondaryButton
                          size={"small"}
                          startIcon={<Edit />}
                          onClick={() => openEditAttribute()}
                          title={"Edit"}
                        />

                        <PrimaryButton
                          size={"small"}
                          startIcon={<Add />}
                          onClick={() => openCreateAttributeValue()}
                          title={"Add Value"}
                        />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* VALUES HEADER */}
                    <Box
                      sx={{
                        p: 2,
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1.5fr 120px 80px",
                        gap: 2,
                        alignItems: "center",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Value
                      </Typography>

                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Description
                      </Typography>

                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Status
                      </Typography>

                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Action
                      </Typography>
                    </Box>

                    <Divider />
                    <Fragment>
                      {isAttributeValuesLoading ? (
                        <Box
                          sx={{
                            minHeight: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Loader />
                        </Box>
                      ) : attributeValues.length > 0 ? (
                        attributeValues.map((item) => (
                          <Box
                            key={item._id}
                            sx={{
                              p: 2,
                              display: "grid",
                              gridTemplateColumns:
                                "1fr 1.5fr 120px 80px",
                              gap: 2,
                              alignItems: "center",
                              borderBottom: "1px solid #eeeeee",
                            }}
                          >
                            <Typography variant="body2">
                              {item.value}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {item.description || "-"}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                color: item.isActive
                                  ? "green"
                                  : "text.secondary",
                                fontWeight: 600,
                              }}
                            >
                              {item.isActive
                                ? "Active"
                                : "Inactive"}
                            </Typography>

                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                type={"edit"}
                                onClick={() => openEditAttributeValue(item)}
                              >
                                <Edit />
                              </IconButton>

                              <IconButton
                                type={"delete"}
                              >
                                <Delete />
                              </IconButton>
                            </Stack>
                          </Box>
                        ))) : (
                        <Box
                          sx={{
                            minHeight: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            No values found
                          </Typography>
                        </Box>
                      )}
                    </Fragment>
                  </>
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Select an Attribute
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Select an attribute to view its values
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Fragment>
  );
};

export default Attributes;