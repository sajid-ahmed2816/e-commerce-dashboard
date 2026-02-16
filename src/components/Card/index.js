import React from 'react';
import { AccessTime, Category, Delete, Label } from '@mui/icons-material';
import { Box, CardMedia, colors, Grid, IconButton, Typography } from '@mui/material';
import { Switch } from '../Switch';
import PrimaryButton from '../Button';
import moment from 'moment';

function Card({ data, primaryOnClick, secondaryOnClick, activeIds, onChange }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                boxShadow: "0px 0px 5px 2px #E6E6E6",
                borderRadius: 2
            }}
        >
            <CardMedia
                component={"img"}
                src={data?.image}
                sx={{
                    width: "100%",
                    height: "240px",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0"
                }}
            />
            <Grid
                container
                spacing={1}
                sx={{ p: 2 }}
            >
                <Grid item md={6}>
                    <Box
                        sx={{
                            height: "-webkit-fill-available",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Label sx={{ fontSize: 20 }} />
                            <Typography
                                variant={"body2"}
                                sx={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow:"hidden",
                                    width:"100%"
                                }}
                            >
                                {data?.tagline}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Category sx={{ fontSize: 20 }} />
                            <Typography 
                                variant={"body2"}
                                sx={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow:"hidden",
                                    width:"100%"
                                }}
                            >
                                {data?.category?.name}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item md={6}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }}
                    >
                        <Switch
                            checked={activeIds.includes(data._id)}
                            onChange={() => onChange(data)}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1,
                        }}
                    >
                        <AccessTime sx={{ fontSize: 20 }} />
                        <Typography variant={"caption"} sx={{ lineHeight: 1.5 }}>
                            {moment(data.createdAt).format("DD-MMM-YYYY")}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item md={12}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        <PrimaryButton
                            title={"Edit"}
                            fullWidth={true}
                            onClick={() => {
                                primaryOnClick(data)
                            }}
                        />
                        <IconButton
                            sx={{
                                background: colors.red.A700,
                                width: 36.5,
                                height: 36.5,
                                border: "1px solid transparent",
                                ":hover": {
                                    border: `1px solid ${colors.red.A700}`,
                                    svg: {
                                        color: colors.red.A700,
                                    }
                                }
                            }}
                            onClick={() => {
                                secondaryOnClick(data);
                            }}
                        >
                            <Delete sx={{ color: colors.common.white }} />
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Card;