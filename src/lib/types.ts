export interface  Tenant {
    id: string;
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    location?: string;
    logo_url?: string;
    website?: string;
    is_Verified?: boolean;
}

export interface Campaign {
    id: string;
    title: string;
    description: string;
    status: string;
    goal_amount: string;
    current_amount: string;
    start_date: string;
    end_date: string;
    image_url: string;
    tenant_id: string;
    percent_funded?: number;
    days_left: number;
    total_donors: number;
    created_at: string;
    updatedAt: string;

}

export interface DonationType {
    id: string;
    amount: string;
    status: string;
    donor_email?: string;
    donor_name?: string;
    donor_phone?: string;
    method: string;
    is_anonymous: boolean;
    created_at: string;
    transaction_id?: string;
    callback_data?: any;
    donor_id?:string | null;
    donated_at: string;
    campaign: {
        id: string;
        title: string;
        goal_amount: string;
        start_date: string;
        end_date: string;
        image_url: string | null;
    };
}

export interface AxiosErrorResponse {
    detail?: string;
}