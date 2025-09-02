import { useMutation } from "@tanstack/react-query";
import API from "@/lib/api";
import type { AxiosError } from "axios";

type UploadResponse = {
  url: string;
};

type UploadVariables = FormData;

export const useUploadImage = () => {
  return useMutation<UploadResponse, AxiosError, UploadVariables>({
    mutationFn: async (formData: FormData) => {
      const res = await API.post("/uploads/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
  });
};
