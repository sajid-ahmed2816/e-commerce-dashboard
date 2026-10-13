import React, { useEffect, useState } from "react";
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

function CreateVariant() {
  const [productCategoryAttributes, setProductCategoryAttributes] = useState([]);
  const [isAttributesLoading, setIsAttributesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const { register } = useForm();

  const { showToast } = useToast();

  const handleReset = () => {
    setVariants([]);
    setSelectedProduct(null);
    setProductCategoryAttributes([]);
    setSelectedAttributes({});
  };

  const toggleAttributeValue = (attributeId, valueId) => {
    setSelectedAttributes((prev) => {
      const currentValues = prev[attributeId] || [];

      const exists = currentValues.includes(valueId);

      return {
        ...prev,
        [attributeId]: exists
          ? currentValues.filter((id) => id !== valueId)
          : [...currentValues, valueId],
      };
    });
  };

  const generateCombinations = (attributes) => {
    const attributeIds = Object.keys(attributes).filter((attributeId) => attributes[attributeId]?.length);

    if (!attributeIds.length) {
      return [];
    };

    return attributeIds.reduce((combinations, attributeId) => {
      const values = attributes[attributeId];

      return combinations.flatMap((combination) =>
        values.map((valueId) => ({
          ...combination,
          [attributeId]: valueId,
        }))
      );
    }, [{}]);
  };

  const getCombinationKey = (attributes = {}) => {
    return JSON.stringify(
      Object.entries(attributes).sort(([a], [b]) =>
        a.localeCompare(b)
      )
    );
  };

  const generateVariants = () => {
    const combinations = generateCombinations(selectedAttributes);

    if (!combinations.length) return;

    setVariants((prevVariants) => {
      const existingKeys = new Set(
        prevVariants.map((variant) =>
          getCombinationKey(variant.attributes)
        )
      );

      const newVariants = [];

      combinations.forEach((combination) => {
        const combinationKey = getCombinationKey(combination);

        // Existing combination dobara add nahi karna
        if (existingKeys.has(combinationKey)) return;

        existingKeys.add(combinationKey);

        newVariants.push({
          id: crypto.randomUUID(),
          productId: selectedProduct?._id,
          attributes: combination,
          sku: "",
          price: "",
          stock: "",
          images: [],
        });
      });

      // Purane variants preserve, sirf naye variants add
      return [...prevVariants, ...newVariants];
    });

    // Agle batch ke liye selections clear kar do
    setSelectedAttributes((prev) =>
      Object.fromEntries(
        Object.keys(prev).map((attributeId) => [
          attributeId,
          [],
        ])
      )
    );
  };

  const updateVariant = (id, field, value) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === id
          ? {
            ...variant,
            [field]: value,
          }
          : variant
      )
    );
  };

  const removeVariant = (id) => {
    setVariants((prev) => prev.filter((variant) => variant.id !== id));
  };

  const handleImages = (variantId, files) => {
    if (!files?.length) return;

    const imageFiles = Array.from(files);

    const images = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
            ...variant,
            images: [...variant.images, ...images],
          }
          : variant
      )
    );
  };

  const removeImage = (variantId, imageId) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
            ...variant,
            images: variant.images.filter(
              (image) => image.id !== imageId
            ),
          }
          : variant
      )
    );
  };

  const getAttributeValue = (attributeId, valueId) => {
    const attribute = productCategoryAttributes.find((item) => item._id === attributeId);

    if (!attribute) return "";

    const value = attribute.values?.find((item) => item._id === valueId);

    return value?.value || "";
  };

  const getVariantTitle = (attributes) => {
    const names = Object.entries(attributes || {}).map(([attributeId, valueId]) =>
      getAttributeValue(attributeId, valueId)
    ).filter(Boolean);

    return names.join(" / ") || "New Variant";
  };

  const formatVariantForApi = (variant) => ({
    product: variant.productId,
    sku: variant.sku.trim(),
    attributes: Object.entries(variant.attributes || {}).map(([attributeId, attributeValueId]) => ({
      attribute: attributeId,
      value: attributeValueId,
    })),
    price: Number(variant.price),
    stock: Number(variant.stock),
  });

  const handleSave = async () => {
    if (!selectedProduct?._id) {
      showToast("Please select a product", "error");
      return;
    }

    if (!variants.length) {
      showToast("Please generate at least one variant", "error");
      return;
    }

    const invalidVariant = variants.find((variant) =>
      !variant.sku.trim() ||
      variant.price === "" ||
      variant.stock === "" ||
      Number(variant.price) < 0 ||
      Number(variant.stock) < 0 ||
      !Number.isFinite(Number(variant.price)) ||
      !Number.isFinite(Number(variant.stock))
    );

    if (invalidVariant) {
      showToast("Please enter a valid SKU, price and stock for every variant", "error");
      return;
    };

    const formData = new FormData();

    // Step 1: Variants ka JSON data prepare karo
    const variantsData = variants.map((variant) => formatVariantForApi(variant));

    // Step 2: JSON ko FormData mein append karo
    formData.append("variants", JSON.stringify(variantsData));

    // Step 3: Har variant ki images alag field mein append karo
    variants.forEach((variant, index) => {
      variant.images.forEach((image) => {
        if (image.file) {
          formData.append(`images_${index}`, image.file);
        }
      });
    });

    setIsLoading(true);
    try {
      const result = await ProductVariantServices.createProductVariant(formData);
      if (result.status) {
        showToast(result.message, "success");
        handleReset();
      };
    } catch (error) {
      showToast(error, "error");
    } finally {
      setIsLoading(false);
    };
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

  const handleSelectProduct = async (productId) => {
    const selected = products.find((item) => item._id === productId);

    setSelectedProduct(selected);

    // Product change hone par purane variants/selections clear karo
    setVariants([]);
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
            Create Variant
          </Typography>
        </Box>
      </Stack>

      {/* =================================================
          SELECT PRODUCT
      ================================================= */}
      <Stack mb={3}>
        <SelectField
          fullWidth={true}
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

          <Divider sx={{ my: 3 }} />

          <PrimaryButton
            startIcon={<Refresh />}
            onClick={generateVariants}
            disabled={
              !selectedProduct ||
              isAttributesLoading ||
              !productCategoryAttributes.length
            }
            title={"Generate Variants"}

          />
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

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {variants.length} variant
            {variants.length !== 1 ? "s" : ""} configured
          </Typography>
        </Box>
      </Stack>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {!variants.length && (
        <Card>
          <CardContent>
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body1">
                No variants generated yet.
              </Typography>

              <Typography variant="body2" mt={0.5}>
                Select attribute values and click
                "Generate Variants".
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          VARIANTS
      ================================================= */}

      <Stack spacing={2}>
        {variants.map((variant, index) => (
          <Card key={variant.id}>
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
                      variant.attributes
                    )}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Variant #{index + 1}
                  </Typography>
                </Box>

                <IconButton
                  color="error"
                  onClick={() =>
                    removeVariant(variant.id)
                  }
                >
                  <Delete />
                </IconButton>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Fields */}

              <Grid container spacing={2}>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="SKU"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(
                        variant.id,
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
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(
                        variant.id,
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
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(
                        variant.id,
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
                      {variant.images.map((image) => (
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
                              removeImage(
                                variant.id,
                                image.id
                              )
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
                              variant.id,
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
        ))}
      </Stack>

      {/* =================================================
          BOTTOM ACTIONS
      ================================================= */}

      {variants.length > 0 && (
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
            disabled={isLoading || !variants.length}
            title={`Save ${variants.length} Variants`}
          />
        </Stack>
      )}
    </Box>
  );
}

export default CreateVariant;