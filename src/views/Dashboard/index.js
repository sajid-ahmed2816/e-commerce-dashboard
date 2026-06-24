import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { Category, Group, Groups, Paid, Sell, ShoppingBag, Workspaces } from "@mui/icons-material";
import { LineChart } from "@mui/x-charts/LineChart"
import DashboardServices from "../../api/dashboard/DashboardService";
import useToast from "../../hooks/useToast";

function Dashboard() {
  const [data, setData] = useState({});

  const { showToast } = useToast();

  const getStats = async () => {
    try {
      const result = await DashboardServices.getStats();
      if (result.status) {
        setData(result?.data);
      }
    } catch (error) {
      showToast(error, "error");
    };
  };

  useEffect(() => {
    getStats();
  }, []);

  const { totalProducts, totalOrders, totalRevenue, totalUsers } = data;

  const xLabels = data?.chart?.map(item => item.month);
  const ordersData = data?.chart?.map(item => item.orders);
  const usersData = data?.chart?.map(item => item.users);
  const revenueData = data?.chart?.map(item => item.revenue);

  return (
    <Box
      sx={{
        height: "calc(100vh - 90px)",
        width: "100%",
        overflowY: "auto",
        p: 2,
      }}
    >
      <Grid container spacing={2}>
        <Grid item md={12}>
          <Grid container spacing={2}>
            {[totalProducts, totalOrders, totalRevenue, totalUsers].map((item, ind) => (
              <Grid item md={3}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #D3D3D3",
                    borderRadius: "8px",
                    p: 2,
                    gap: 1
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    {ind == 0 ? <Workspaces sx={{ color: "#808080" }} /> : ind == 1 ? <Sell sx={{ color: "#808080" }} /> : ind == 2 ? <Paid sx={{ color: "#808080" }} /> : ind == 3 ? <Groups sx={{ color: "#808080" }} /> : ""}
                    <Typography
                      sx={{
                        color: "#808080"
                      }}
                    >
                      {ind == 0 ? "Total Products" : ind == 1 ? "Total Order" : ind == 2 ? "Total Revenue" : ind == 3 ? "Total Users" : ""}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 2
                    }}
                  >
                    <Typography variant="h5">
                      {item}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
        {Object.keys(data).length > 0 && (
          <Grid item md={12}>
            <Box
              sx={{
                border: "1px solid #D3D3D3",
                borderRadius: "8px",
              }}
            >
              <LineChart
                height={440}
                series={[
                  { data: ordersData, label: 'Orders' },
                  { data: usersData, label: 'Users' },
                ]}
                xAxis={[
                  {
                    scaleType: 'point',
                    data: xLabels,
                  }
                ]}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
