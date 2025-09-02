import {useQuery} from "@tanstack/react-query";
import API from "@/lib/api";

export const useGetCampaigns = () => {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await API.get("/campaigns/");
      return res.data;
    },
  });
};

export const useGetCampaign = (id: string | undefined) => {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await API.get(`/campaigns/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};
