import axios from "axios";
import { getURL } from "../utils/config";

const axiosClient = axios.create({
  baseURL: getURL(),
  timeout: 360000,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error ", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
