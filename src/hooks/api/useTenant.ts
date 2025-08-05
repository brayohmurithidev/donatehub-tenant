import {useQuery} from "@tanstack/react-query";
import API from "@/lib/api";

export const useGetTenant = () => {
  return useQuery({
    queryKey: ["tenant"],
    queryFn: async () => {
      const res = await API.get("/tenants/me");
      return res.data;
    },
  });
};
