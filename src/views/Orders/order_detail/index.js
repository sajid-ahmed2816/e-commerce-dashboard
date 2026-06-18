import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import moment from 'moment';
import OrderServices from '../../../api/orders/OrderServices'; // adjust path
import useToast from '../../../hooks/useToast';
import Loader from '../../../components/Loader';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const result = await OrderServices.getOrderDetailById(id); // adjust method name
      if (result.status) {
        setOrder(result?.data?.order);
      } else {
        showToast('Order not found', 'error');
        navigate('/orders'); // or fallback route
      }
    } catch (error) {
      showToast(error?.message || 'Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Status chip color mapping
  const statusColor = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Order not found</Typography>
      </Box>
    );
  }

  return (
    <Fragment>
      <Box sx={{ p: 3 }}>
        {/* Back Button & Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Order #{order.orderNo}
          </Typography>
          <Chip
            label={order.status.toUpperCase()}
            color={statusColor[order.status] || 'default'}
            sx={{ textTransform: 'uppercase', fontWeight: 600 }}
          />
        </Box>

        <Box
          sx={{
            height: "calc(100vh - 173px)",
            overflowY: 'auto'
          }}
        >
          <Grid container spacing={3}>
            {/* Left Column: Customer & Address */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Customer Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {order?.customer?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{order?.customer?.email}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Mobile
                    </Typography>
                    <Typography variant="body1">{order?.customer?.mobile}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Billing Address
                    </Typography>
                    <Typography variant="body1">
                      {order?.customer?.billingAddress}, {order.city}, {order.state}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1">
                      {moment(order.createdAt).format('DD-MM-YYYY hh:mm A')}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Right Column: Summary */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body1">Rs. {order?.summary?.subtotal}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Delivery Charge
                    </Typography>
                    <Typography variant="body1">Rs. {order?.summary?.deliveryCharge}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Total
                    </Typography>
                    <Typography variant="h6" color="primary">
                      Rs. {parseFloat(Number(order?.summary?.subtotal) + Number(order?.summary?.deliveryCharge)).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Order #
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {order.orderNo}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Items Table */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price (each)</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={item._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {item.product ? item.product.name : 'Product deleted'}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">Rs. {item.priceEach}</TableCell>
                          <TableCell align="right">Rs. {item?.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Fragment>
  );
}

export default OrderDetail;