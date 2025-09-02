import {useQuery} from "@tanstack/react-query";
import API from "@/lib/api";


export const useGetDashboardStats = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await API.get("/stats/dashboard");
            return res.data;
        },
    })
}