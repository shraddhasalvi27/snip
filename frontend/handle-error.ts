import axios from "axios";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";


export function getErrorMessage(err: unknown) {
  const unknownError = "Something went wrong, please try again later.";

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => issue.message);
    return errors.join("\n");
  }

  // Axios error handling
  if (axios.isAxiosError?.(err)) {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
    return unknownError;
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (isRedirectError(err)) {
    throw err;
  }

  return unknownError;
}
