import {useQuery} from "@tanstack/react-query";
import API from "@/lib/api";

export const useGetDonations = () => {
    return useQuery({
        queryKey: ["donations"],
        queryFn: async () => {
            const res = await API.get("/donations");
            return res.data;
        },
    })
}