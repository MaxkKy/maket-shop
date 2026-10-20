"use client"; // Error boundaries must be Client Components
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { AppError } from "@/lib/errors/AppError";
import { useEffect } from "react";
export default function ErrorMessage({ error, retry }) {
  useEffect(() => { 
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  const message = AppError.isAppError(error)
    ? ERROR_MESSAGES[error.code]
    : error.message;
  return (
    <div>
      <h2>{message}</h2>
      <button
        onClick={
          // Attempt to recover by re-fetching and re-rendering the segment
          () => retry()
        }
      >
        Try again
      </button>
    </div>
  );
}
