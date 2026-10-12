import axios from "axios";

const baseUrl = "http://localhost:3030/api";

const instance = axios.create({
  baseURL: baseUrl
});

instance.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  request.headers = {
    Accept: "application/json, text/plain, */*",
    Authorization: `Bearer ${token}`
  }
  return request;
});

instance.interceptors.response.use((response) => {
  if (response) {
    return response;
  };
}, (error) => {
  return Promise.reject(error);
});

export default instance;
