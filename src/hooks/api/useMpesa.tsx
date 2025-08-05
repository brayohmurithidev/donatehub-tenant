import {useQuery} from "@tanstack/react-query";
import API from "@/lib/api";

export const useGetMpesaIntegration = () => {
    return useQuery({
        queryKey: ["mpesa"],
        queryFn: async () => {
            const res = await API.get("/mpesa");
            return res.data;
        },
    })
}