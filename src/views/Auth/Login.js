import React, { Fragment, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import colors from '../../assets/styles/colors';
import AuthServices from '../../api/auth/AuthServices';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB859K8L2v-rwWiKZpKBw_xMlTjhpUd2yc",
  authDomain: "tara-dashboard-login.firebaseapp.com",
  projectId: "tara-dashboard-login",
  storageBucket: "tara-dashboard-login.appspot.com",
  messagingSenderId: "424103744596",
  appId: "1:424103744596:web:a67a82a72acb28cf04c9c1",
  measurementId: "G-0VCKM2N5YH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="#">
        Ecommerce Store
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { userLogin } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setLoading(true);
    const obj = {
      email: formData.email,
      password: formData.password
    };
    try {
      const result = await AuthServices.login(obj);
      if (result.status) {
        const obj = {
          token: result.data.token,
          email: result.data.user.email,
          name: result.data.user.name,
          picture: result.data.user.picture,
          role: result.data.user.role,
        }
        userLogin(obj);
        navigate("/");
        showToast(result.message, "success");
      }
    } catch (error) {
      showToast(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", background: "#FFFFFF" }}>
        <Container maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                {...register("email", {
                  required: "Email Required"
                })}
                helperText={errors?.email?.message}
                error={errors?.email && true}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Password Required"
                })}
                helperText={errors?.password?.message}
                error={errors?.password && true}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={"24px"} sx={{ color: colors.white }} /> : "Sign In"}
              </Button>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      </Box>
    </Fragment>
  );
}