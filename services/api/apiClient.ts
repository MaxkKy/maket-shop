import { AppError,ApiErrorResponse } from "@/lib/errors/AppError";
import axios, { AxiosError } from "axios";

export const apiClient = axios.create({baseURL:process.env.NEXT_PUBLIC_LOCAL_API,withCredentials:true})
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {

      // Transform to AppError
      if (error.response?.data) {
        return Promise.reject(
          AppError.fromResponse(error.response.data,error.response.status)
        );
      }
   
      // Network error
      if (!error.response) {
        return Promise.reject(
          new AppError('Network error', 'NETWORK_ERROR', 0)
        );
      }
   
      return Promise.reject(error);
    }
  );