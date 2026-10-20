import { toast } from "sonner";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
export const useApiError = () => {
  const router = useRouter();
  const pathName = usePathname();
  const handleError = useCallback((error) => {
    // Known application error
    // Axios error
    if (AppError.isAppError(error)) {
      const status = error.status || error.statusCode;
      const message = ERROR_MESSAGES[error.code] ?? error.message;
      if (status === 400) {
        toast.error(message);
        return;
      }
      if (error.code === "UNAUTHORIZED" || status === 401) {
        toast.error(message);
        return;
      }

      if (status === 403) {
        toast.error(message);
        return;
      }

      if (status === 404) {
        toast.error(message);
        return;
      }

      if (status === 429) {
        toast.error(message);
        return;
      }

      if (!error.response) {
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
        return;
      }
    }
    // if (AppError.isAppError(error)) {
    //   const message = ERROR_MESSAGES[error.code] ?? error.message;
    //   toast.error(message);

    //   // Handle specific error codes
    //   if (error.code === "UNAUTHORIZED") {
    //   }

    //   return;
    // }
    // Unknown error
    console.error("Unhandled error:", error);
    toast.error(ERROR_MESSAGES.DEFAULT);
  }, [pathName, router]);

  return { handleError };
};
