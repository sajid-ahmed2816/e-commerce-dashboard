import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, IconButton, Stack, TextField, Typography, } from "@mui/material";
import { Close, Delete, ImageOutlined, Refresh, Save, } from "@mui/icons-material";
import { red } from "@mui/material/colors";
import { useForm } from "react-hook-form";
import PrimaryButton, { SecondaryButton } from "../../../components/Button";
import SelectField from "../../../components/SelectField";
import ProductServices from "../../../api/products/ProductServices";
import AttributeServices from "../../../api/attributes/AttributeServices";
import AttributeValueServices from "../../../api/attribute_values/AttributeValueServices";
import useToast from "../../../hooks/useToast";
import ProductVariantServices from "../../../api/product_variants/ProductVariantServices";

function UpdateVariant() {
  const [productCategoryAttributes, setProductCategoryAttributes] = useState([]);
  const [isAttributesLoading, setIsAttributesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [products, setProducts] = useState([]);
  const [variant, setVariant] = useState(null);

  const { register } = useForm();

  const { showToast } = useToast();

  const { id } = useParams();
  const navigate = useNavigate();

  const handleReset = () => {
    setSelectedProduct(null);
    setProductCategoryAttributes([]);
    setSelectedAttributes({});
  };

  const getSelectedVariantAttributes = () =>
    Object.entries(selectedAttributes).filter(([, valueIds]) => valueIds?.length > 0)
      .map(([attributeId, valueIds]) => ({
        attribute: attributeId,
        value: valueIds[0],
      }));

  const toggleAttributeValue = (attributeId, valueId) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeId]:
        prev[attributeId]?.[0] === valueId ? [] : [valueId],
    }));
  };

  const updateVariant = (field, value) => {
    setVariant((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const handleImages = (files) => {
    if (!files?.length) return;

    const newImages = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setVariant((prev) =>
      prev
        ? {
          ...prev,
          images: [...prev.images, ...newImages],
        }
        : prev
    );
  };

  const removeImage = (imageId) => {
    setVariant((prev) =>
      prev
        ? {
          ...prev,
          images: prev.images.filter(
            (image) => image.id !== imageId
          ),
        }
        : prev
    );
  };

  const getAttributeValue = (attributeId, valueId) => {
    const attribute = productCategoryAttributes.find((item) => String(item._id) === String(attributeId));

    const value = attribute?.values?.find((item) => String(item._id) === String(valueId));

    return value?.value || "";
  };

  const getVariantTitle = (attributes = []) => attributes.map((item) => getAttributeValue(
    typeof item.attribute === "object"
      ? item.attribute._id
      : item.attribute,
    typeof item.value === "object"
      ? item.value._id
      : item.value
  )).filter(Boolean).join(" / ") || "Variant";

  const loadProductAttributes = async (selected, existingAttributes = []) => {
    const categoryAttributeIds = (selected.category?.attributes || []).map((item) =>
      String(typeof item === "object" ? item._id : item)
    );

    if (!categoryAttributeIds.length) {
      setProductCategoryAttributes([]);
      setSelectedAttributes({});
      return;
    }

    setIsAttributesLoading(true);

    try {
      const attributeResult = await AttributeServices.getAttributes({
        page: 1,
        limit: "all",
      });

      if (!attributeResult?.status) {
        setProductCategoryAttributes([]);
        return;
      }

      const allAttributes = attributeResult.data?.attributes || [];

      const matchingAttributes = allAttributes.filter((attribute) =>
        categoryAttributeIds.includes(String(attribute._id)) && attribute.isActive
      );

      const valueResults = await Promise.all(
        matchingAttributes.map((attribute) =>
          AttributeValueServices.getAttributeValues({
            attribute: attribute._id,
            page: 1,
            limit: "all",
          })
        )
      );

      const attributesWithValues = matchingAttributes.map(
        (attribute, index) => ({
          ...attribute,
          values: (valueResults[index]?.data?.attributeValues || []).filter((value) => value.isActive)
        })
      );

      setProductCategoryAttributes(attributesWithValues);

      const initialSelections = {};

      attributesWithValues.forEach((attribute) => {
        initialSelections[String(attribute._id)] = [];
      });

      existingAttributes.forEach((item) => {
        const attributeId = String(
          typeof item.attribute === "object"
            ? item.attribute._id
            : item.attribute
        );

        const valueId = String(
          typeof item.value === "object"
            ? item.value._id
            : item.value
        );

        const attribute = attributesWithValues.find(
          (item) => String(item._id) === attributeId
        );

        const valueExists = attribute?.values?.some(
          (value) => String(value._id) === valueId
        );

        if (valueExists) {
          initialSelections[attributeId] = [valueId];
        }
      });

      setSelectedAttributes(initialSelections);
    } catch (error) {
      console.error("Failed to load category attributes:", error);
      setProductCategoryAttributes([]);
    } finally {
      setIsAttributesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!variant) {
      showToast("Variant not loaded", "error");
      return;
    };

    if (
      !variant.sku.trim() ||
      variant.price === "" ||
      variant.stock === "" ||
      !Number.isFinite(Number(variant.price)) ||
      !Number.isFinite(Number(variant.stock)) ||
      Number(variant.price) < 0 ||
      Number(variant.stock) < 0
    ) {
      showToast("Please enter a valid SKU, price and stock", "error");
      return;
    }

    const formData = new FormData();

    const attributes = getSelectedVariantAttributes();

    formData.append("sku", variant.sku.trim());
    formData.append("attributes", JSON.stringify(attributes));
    formData.append("price", String(Number(variant.price)));
    formData.append("stock", String(Number(variant.stock)));
    formData.append("isActive", String(variant.isActive));

    // Sirf existing images ke public_id bhejo jo abhi retained hain.
    const existingImages = variant.images.filter(
      (image) => !image.file && image.public_id
    ).map(
      (image) => image.public_id
    );

    formData.append("existingImages", JSON.stringify(existingImages));

    // Sirf newly selected files upload honge.
    variant.images.forEach((image) => {
      if (image.file) {
        formData.append("images", image.file);
      }
    });
    setIsLoading(true);
    try {
      const result = await ProductVariantServices.updateProductVariant(id, formData);
      if (result?.status) {
        showToast(result.message, "success");
        navigate("/variants");
      } else {
        showToast(result?.message || "Failed to update variant", "error");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getProducts = async () => {
    const params = { page: 1, limit: "all" };
    try {
      const result = await ProductServices.getProducts(params);
      if (result.status) {
        const newArr = result.data.products.map(p => ({ ...p, value: p._id }));
        setProducts(newArr);
      }
    } catch (error) {
      showToast(error, "error");
    };
  };

  const getProductVariant = async () => {
    setIsLoading(true);

    try {
      const result = await ProductVariantServices.getProductVariantById(id);

      if (!result?.status) {
        showToast(result?.message || "Variant not found", "error");
        return;
      }

      const currentVariant = result.data;

      const productId = String(
        typeof currentVariant.product === "object" ? currentVariant.product._id : currentVariant.product
      );

      const productFromList = products.find((item) => String(item._id) === productId);

      const populatedProduct = typeof currentVariant.product === "object" ? currentVariant.product : null;

      const selected = productFromList || (populatedProduct ?
        { ...populatedProduct, value: productId } :
        null
      );

      if (!selected) {
        showToast("Associated product not found", "error");
        return;
      }

      setSelectedProduct(selected);

      setVariant({
        id: currentVariant._id,
        productId,
        sku: currentVariant.sku || "",
        price: currentVariant.price ?? "",
        stock: currentVariant.stock ?? "",
        isActive: currentVariant.isActive ?? true,
        images: (currentVariant.images || []).map(
          (image, index) => ({
            ...image,
            id: image.public_id || `existing-${index}`,
            preview: image.url,
          })
        ),
      });

      await loadProductAttributes(
        selected,
        currentVariant.attributes || []
      );
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load variant",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = async (productId) => {
    const selected = products.find((item) => item._id === productId);

    setSelectedProduct(selected);

    // Product change hone par purane variants/selections clear karo
    setSelectedAttributes({});
    setProductCategoryAttributes([]);

    if (!selected) return;

    // Product ki populated category se assigned attribute IDs
    const categoryAttributeIds = (selected.category?.attributes || []).map((item) =>
      String(typeof item === "object" ? item._id : item)
    );

    if (!categoryAttributeIds.length) return;

    setIsAttributesLoading(true);

    try {
      // Saare attributes fetch karo, phir category ke IDs se filter karo
      const attributeResult = await AttributeServices.getAttributes({
        page: 1,
        limit: "all",
      });

      if (!attributeResult?.status) {
        setProductCategoryAttributes([]);
        return;
      }

      const allAttributes = attributeResult?.data?.attributes || [];

      const matchingAttributes = allAttributes.filter((attribute) =>
        categoryAttributeIds.includes(String(attribute._id)) &&
        attribute.isActive
      );

      // Har assigned attribute ki values fetch karo
      const valueResults = await Promise.all(matchingAttributes.map((attribute) =>
        AttributeValueServices.getAttributeValues({
          attribute: attribute._id,
          page: 1,
          limit: "all",
        })
      ));

      const attributesWithValues = matchingAttributes.map((attribute, index) => ({
        ...attribute,
        values: (
          valueResults[index]?.data?.attributeValues || []
        ).filter((value) => value.isActive),
      }));

      setProductCategoryAttributes(attributesWithValues);

      // Har attribute ke liye initial empty selection
      const initialSelections = {};

      attributesWithValues.forEach((attribute) => {
        initialSelections[attribute._id] = [];
      });

      setSelectedAttributes(initialSelections);
    } catch (error) {
      console.error("Failed to load category attributes:", error);
      setProductCategoryAttributes([]);
    } finally {
      setIsAttributesLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      getProductVariant();
    }
  }, [products, id]);

  return (
    <Box
      sx={{
        p: 2,
        height: "calc(100vh - 64px)",
        overflowY: "auto",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Update Variant
          </Typography>
        </Box>
      </Stack>

      {/* =================================================
          SELECT PRODUCT
      ================================================= */}
      <Stack mb={3}>
        <SelectField
          fullWidth={true}
          disabled={true}
          label={"Select Product"}
          value={selectedProduct != null ? selectedProduct?.value : ""}
          register={register("product", {
            onChange: (e) => {
              handleSelectProduct(e.target.value);
            },
          })}
          options={products}
        />
      </Stack>

      {/* =================================================
          CATEGORY ATTRIBUTES
      ================================================= */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Variant Attributes
          </Typography>

          {!selectedProduct ? (
            <Typography variant="body2" color="text.secondary">
              Select a product to view its category attributes.
            </Typography>
          ) : isAttributesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : !productCategoryAttributes.length ? (
            <Typography variant="body2" color="text.secondary">
              No active attributes are assigned to this product's category.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {productCategoryAttributes.map((attribute) => {
                const selectedValues =
                  selectedAttributes[attribute._id] || [];

                return (
                  <Box key={attribute._id}>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      {attribute.name}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {attribute.values.map((value) => {
                        const isSelected = selectedValues.includes(value._id);

                        return (
                          <Chip
                            key={value._id}
                            label={value.value}
                            clickable
                            color={isSelected ? "primary" : "default"}
                            variant={isSelected ? "filled" : "outlined"}
                            onClick={() =>
                              toggleAttributeValue(attribute._id, value._id)
                            }
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* =================================================
          GENERATED VARIANTS HEADER
      ================================================= */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Generated Variants
          </Typography>
        </Box>
      </Stack>

      {/* =================================================
          VARIANTS
      ================================================= */}

      {variant != null && (
        <Card>
          <CardContent>
            {/* Variant Header */}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                >
                  {getVariantTitle(
                    variant?.attributes
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Variant
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Fields */}

            <Grid container spacing={2}>
              <Grid item md={4} xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="SKU"
                  value={variant?.sku}
                  onChange={(e) =>
                    updateVariant(
                      "sku",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item md={4} xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Price"
                  value={variant?.price}
                  onChange={(e) =>
                    updateVariant(
                      "price",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item md={4} xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stock"
                  value={variant?.stock}
                  onChange={(e) =>
                    updateVariant(
                      "stock",
                      e.target.value
                    )
                  }
                />
              </Grid>

              {/* Images */}

              <Grid item xs={12}>
                <Box mt={1}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    mb={1}
                  >
                    Variant Images
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {variant?.images?.map((image) => (
                      <Box
                        key={image.id}
                        sx={{
                          position: "relative",
                          width: 90,
                          height: 90,
                          borderRadius: 1,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          component="img"
                          src={image.preview}
                          alt=""
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        <IconButton
                          size="small"
                          onClick={() =>
                            removeImage(image.id)
                          }
                          sx={{
                            position: "absolute",
                            top: 3,
                            right: 3,
                            width: 24,
                            height: 24,
                            backgroundColor: "white",

                            "&:hover": {
                              backgroundColor: "white",
                            },
                          }}
                        >
                          <Close
                            sx={{
                              fontSize: 16,
                              color: red.A400,
                            }}
                          />
                        </IconButton>
                      </Box>
                    ))}

                    {/* Add Images */}

                    <Button
                      component="label"
                      variant="outlined"
                      sx={{
                        p: "5px",
                        minWidth: 90,
                        width: 90,
                        height: 90,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <ImageOutlined />

                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "none",
                        }}
                      >
                        Add Images
                      </Typography>

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleImages(
                            variant?.id,
                            e.target.files
                          );

                          e.target.value = "";
                        }}
                      />
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          BOTTOM ACTIONS
      ================================================= */}

      {variant != null && (
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          mt={3}
        >
          <SecondaryButton
            title={"Cancel"}
            onClick={handleReset}
          />

          <PrimaryButton
            startIcon={<Save />}
            onClick={handleSave}
            isLoading={isLoading}
            disabled={isLoading || !variant}
            title={`Update Variant`}
          />
        </Stack>
      )}
    </Box>
  );
}

export default UpdateVariant;