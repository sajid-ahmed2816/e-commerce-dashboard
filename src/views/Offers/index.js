import React, { Fragment, useEffect, useState } from 'react';
import { Box, CardMedia, Grid, InputAdornment, Paper, Table, TableBody, TableContainer, Typography, colors } from '@mui/material';
import { Delete, Edit, ErrorOutline, Search } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import PrimaryButton, { SecondaryButton, IconButton } from '../../components/Button';
import TableRow from '../../components/TableRow';
import TableCell from '../../components/TableCell';
import Dialog from '../../components/Dialog';
import InputField from '../../components/InputField';
import useToast from '../../hooks/useToast';
import OfferServices from '../../api/offers/OfferServices';
import useDebounce from '../../utils/Debounce';
import { useSearchParams } from "react-router-dom";
import TablePagination from '../../components/Pagination';
import moment from 'moment';
import { Switch } from '../../components/Switch';
import TableHead from '../../components/TableHead';
import SelectField from '../../components/SelectField';
import Loader from '../../components/Loader';
import CategoryServices from '../../api/categories/CategoryServices';

const tableHead = ["S.No", "Name", "Category", "Color", "Discount Type", "Discount Value", "Start Date", "End Date", "Status", "Actions"];

function Offers() {
	const [isLoading, setIsLoading] = useState("");
	const [isDataLoading, setIsDataLoading] = useState(true);
	const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
	const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
	const [offers, setOffers] = useState([]);
	const [activeIds, setActiveIds] = useState([]);
	const [selectedOffer, setSelectedOffer] = useState(null);
	const [selectedDiscountType, setSelectedDiscountType] = useState(null);
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [searchParams, setSearchParams] = useSearchParams();
	const { showToast } = useToast();

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || 10;
	const searchQuery = searchParams.get("search") || "";

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch
	} = useForm({
		defaultValues: { search: searchQuery || "" }
	});

	const handleOfferDialog = () => setIsOfferDialogOpen((prevOpen) => !prevOpen);
	const handleConfirmationDialog = () => setIsConfirmationDialogOpen((prevOpen) => !prevOpen);

	const handleRowsPerPageChange = (event) => {
		const newLimit = parseInt(event.target.value, 10);
		setSearchParams((prev) => {
			prev.set("limit", newLimit);
			prev.set("page", 1);  // Reset to first page
			return prev;
		});
	};

	const setDefaultData = () => {
		setValue("offerName", selectedOffer?.name);
		setValue("color", selectedOffer?.color);
		setSelectedDiscountType(selectedOffer?.discountType);
		setValue("discountValue", selectedOffer?.discountValue);
		const startDate = moment(selectedOffer?.startDate).format("YYYY-MM-DD");
		const endDate = moment(selectedOffer?.endDate).format("YYYY-MM-DD")
		setValue("startDate", startDate);
		setValue("endDate", endDate);
		setSelectedCategory(selectedOffer?.category?._id);
		setValue("category", selectedOffer?.category?._id);
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

	const createOffer = async (formData) => {
		setIsLoading(true);
		const obj = {
			isActive: formData.isActive,
			name: formData.offerName,
			color: formData.color,
			discountType: selectedDiscountType,
			discountValue: Number(formData.discountValue),
			startDate: formData.startDate,
			endDate: formData.endDate,
			category: formData.category
		};
		try {
			const result = await OfferServices.createOffer(obj);
			if (result.status) {
				showToast(result.message, "success");
				reset();
				handleOfferDialog();
			}
		} catch (error) {
			showToast(error, "error");
		} finally {
			setIsLoading(false);
			getOffers(searchQuery, page, limit);
		};
	};

	const updateOffer = async (formData) => {
		setIsLoading(true);
		const obj = {
			isActive: formData.isActive,
			name: formData.offerName,
			color: formData.color,
			discountType: selectedDiscountType,
			discountValue: Number(formData.discountValue),
			startDate: formData.startDate,
			endDate: formData.endDate,
			category: formData.category
		};
		try {
			const result = await OfferServices.updateOffer(selectedOffer?._id, obj);
			if (result.status) {
				showToast(result.message, "success");
				handleOfferDialog();
			}
		} catch (error) {
			showToast(error, "error");
		} finally {
			setIsLoading(false);
			getOffers(searchQuery, page, limit);
		};
	};

	const getOffers = async (value, pageNumber, limit) => {
		try {
			const params = { search: value, page: pageNumber, limit: limit };
			const result = await OfferServices.getOffers(params);
			if (result.status) {
				setOffers(result.data.offers);
				setTotalPages(result.data.pagination.totalPages);
				setTotalCount(result.data.pagination.total);
				const ids = result.data.offers.filter(c => c.isActive).map(c => c._id);
				setActiveIds(ids);
			};
		} catch (error) {
			showToast(error, "error")
		} finally {
			setIsDataLoading(false);
		};
	};

	const deleteOffer = async () => {
		setIsLoading(true);
		try {
			const result = await OfferServices.deleteOffer(selectedOffer?._id);
			if (result.status) {
				showToast(result.message, "success");
				handleConfirmationDialog();
			}
		} catch (error) {
			showToast(error, "error")
		} finally {
			setIsLoading(false);
			getOffers();
		};
	};

	const handleStatus = async (item) => {
		const obj = {}
		if (item.isActive) {
			obj.isActive = false;
		} else {
			obj.isActive = true;
		};
		try {
			const result = await OfferServices.updateStatus(item._id, obj);
			if (result) {
				showToast(result?.message, "success");
			};
		} catch (error) {
			showToast(error, "error");
		} finally {
			getOffers();
		};
	};

	const searchValue = watch("search");
	const debouncedSearch = useDebounce(searchValue, 500);

	useEffect(() => {
		getCategories();
	}, []);

	useEffect(() => {
		if (selectedOffer != null) {
			setDefaultData();
		} else {
			reset();
		};
	}, [selectedOffer]);

	useEffect(() => {
		setSearchParams((prev) => {
			prev.set("page", 1);
			prev.set("limit", limit);
			prev.set("search", debouncedSearch || "");
			return prev;
		});
		getOffers(debouncedSearch, page, limit);
	}, [debouncedSearch, page, limit]);

	return (
		<Fragment>
			<Dialog
				open={isOfferDialogOpen}
				handleClose={handleOfferDialog}
				title={selectedOffer == null ? "Create Offer" : "Update Offer"}
				component={"form"}
				onSubmit={handleSubmit(selectedOffer == null ? createOffer : updateOffer)}
				maxWidth={"sm"}
			>
				<Grid item md={12}>
					<Box>
						<InputField
							variant={"outlined"}
							label={"Offer Name"}
							fullWidth={true}
							type={"text"}
							value={watch("offerName")}
							register={register("offerName", {
								required: "Enter Category Name",
							})}
							error={errors?.offerName && true}
							helperText={errors?.offerName?.message}
						/>
					</Box>
				</Grid>
				<Grid item md={8}>
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
				<Grid item md={2}>
					<Box>
						<InputField
							variant={"outlined"}
							label={"Color"}
							fullWidth={true}
							type={"color"}
							value={watch("color")}
							register={register("color", {
								required: "Enter a color"
							})}
							error={errors?.color && true}
							helperText={errors?.color?.message}
						/>
					</Box>
				</Grid>
				<Grid item md={2}>
					<Box component={"fieldset"}
						sx={{
							p: "14px",
							lineHeight: 0,
							outline: "none",
							border: "none",
							border: "1px solid rgba(0, 0, 0, 0.23)",
							borderRadius: "4px",
							position: "relative"
						}}
					>
						<Box component={"legend"}
							sx={{
								color: "#00000099",
								fontFamily: "Comfortaa",
								fontSize: "12px",
								px: "4px",
								position: "absolute",
								right: "26px",
								top: "-2px",
								background: "white",
								display: "block",
								height: "16px",
							}}
						>
							Status
						</Box>
						<Switch
							checked={watch("isActive")}
							onChange={(e) => setValue("isActive", e.target.checked)}
						/>
					</Box>
				</Grid>
				<Grid item md={6}>
					<Box>
						<SelectField
							label={"Discount Type"}
							fullWidth={true}
							value={selectedDiscountType}
							register={register("discountType", {
								required: "Select an Offer",
								onChange: (e) => setSelectedDiscountType(e.target.value),
							})}
							error={errors?.discountType && true}
							helperText={errors?.discountType?.message}
							options={[{ name: "Percentage", value: "percentage" }, { name: "Flat", value: "flat" }]}
						/>
					</Box>
				</Grid>
				<Grid item md={6}>
					<Box>
						<InputField
							variant={"outlined"}
							label={"Discount"}
							fullWidth={true}
							type={"text"}
							value={watch("discountValue")}
							register={register("discountValue", {
								required: "Enter Discount Value",
							})}
							error={errors?.discountValue && true}
							helperText={errors?.discountValue?.message}
						/>
					</Box>
				</Grid>
				<Grid item md={6}>
					<Box>
						<InputField
							variant={"outlined"}
							// label={"Start Date"}
							fullWidth={true}
							type={"date"}
							value={watch("startDate")}
							register={register("startDate", {
								required: "Enter Start Date",
							})}
							error={errors?.startDate && true}
							helperText={errors?.startDate?.message}
						/>
					</Box>
				</Grid>
				<Grid item md={6}>
					<Box>
						<InputField
							variant={"outlined"}
							// label={"End Date"}
							fullWidth={true}
							type={"date"}
							value={watch("endDate")}
							register={register("endDate", {
								required: "Enter End Date",
							})}
							error={errors?.endDate && true}
							helperText={errors?.endDate?.message}
						/>
					</Box>
				</Grid>
				<Grid item md={12}>
					<Grid container spacing={2}>
						<Grid item md={6}>
							<SecondaryButton title={"Cancel"} fullWidth onClick={handleOfferDialog} />
						</Grid>
						<Grid item md={6}>
							<PrimaryButton title={"Submit"} fullWidth type={"submit"} isLoading={isLoading} isDisabled={isLoading} />
						</Grid>
					</Grid>
				</Grid>
			</Dialog>
			<Dialog
				open={isConfirmationDialogOpen}
				handleClose={handleConfirmationDialog}
				title={"Delete Offer"}
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
					<SecondaryButton fullWidth title={"Cancel"} onClick={handleConfirmationDialog} />
				</Grid>
				<Grid item md={6}>
					<PrimaryButton fullWidth title={"Delete"} onClick={deleteOffer} isLoading={isLoading} isDisabled={isLoading} />
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
										title={"Create Offer"}
										onClick={() => {
											setSelectedOffer(null);
											handleOfferDialog();
										}}
									/>
								</Box>
							</Grid>
						</Grid>
					</Grid>
					<Grid item md={12}>
						<TableContainer
							sx={{
								height: "calc(100vh - 200px)",
								overflowY: "auto"
							}}
						>
							<Table size='small'>
								<TableHead>
									<TableRow>
										{tableHead.map((ind) => (
											<TableCell key={ind} sx={{ textAlign: ind === "Actions" ? "center" : "left" }}>{ind}</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{isDataLoading ? (
										<TableRow>
											<TableCell colSpan={10}>
												<Loader />
											</TableCell>
										</TableRow>
									) : offers.length > 0 ? offers.map((item, ind) => (
										<TableRow key={ind}>
											<TableCell>{ind + 1}</TableCell>
											<TableCell>{item.name}</TableCell>
											<TableCell>{item?.category?.name}</TableCell>
											<TableCell>
												<Box
													sx={{
														width: "32px",
														height: "32px",
														background: item.color,
														borderRadius: "50%"
													}}
												/>
											</TableCell>
											<TableCell>{item.discountType}</TableCell>
											<TableCell>{item.discountValue}</TableCell>
											<TableCell>{moment(item?.startDate).format("DD-MM-YYYY")}</TableCell>
											<TableCell>{moment(item?.endDate).format("DD-MM-YYYY")}</TableCell>
											<TableCell>
												<Switch
													checked={activeIds.includes(item._id)}
													onChange={() => handleStatus(item)}
												/>
											</TableCell>
											<TableCell>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														gap: 1
													}}
												>
													<IconButton
														type={"edit"}
														onClick={() => {
															setSelectedOffer(item);
															handleOfferDialog();
														}}
													>
														<Edit />
													</IconButton>
													<IconButton
														type={"delete"}
														onClick={() => {
															setSelectedOffer(item);
															handleConfirmationDialog();
														}}
													>
														<Delete />
													</IconButton>
												</Box>
											</TableCell>
										</TableRow>
									)) : (
										<TableRow>
											<TableCell colSpan={10} sx={{ textAlign: "center" }}>
												No data available
											</TableCell>
										</TableRow>
									)}
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
									<Typography>Total offers:</Typography>
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
									rowsPerPage={limit}
									onRowsPerPageChange={handleRowsPerPageChange}
								/>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Box>
		</Fragment>
	);
};

export default Offers;