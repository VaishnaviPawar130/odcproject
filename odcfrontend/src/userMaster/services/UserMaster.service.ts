import { apiClient } from "@/src/api/apiClient";

import type {
    GetUserMastersResponse,
    UserMasterFormValues,
    UserMasterResponse,
    UserMasterRow,
} from "../dto/userMaster.dto";

// Backend user row type
type UserMasterApiRow = {
    _id: string;
    name: string;
    contactNumber: string;
};

// Get first letter for avatar
function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase() || "U";
}

// Get avatar color from id
function getColor(id: string) {
    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-green-500",
        "bg-orange-500",
        "bg-pink-500",
    ];

    let hash = 0;

    for (const char of id) {
        hash += char.charCodeAt(0);
    }

    return colors[hash % colors.length];
}

// Convert API row to frontend row
function mapUserRow(item: UserMasterApiRow): UserMasterRow {
    return {
        id: item._id,
        name: item.name,
        phone: item.contactNumber,
        initial: getInitial(item.name),
        color: getColor(item._id),
    };
}

export class UserMasterService {
    // Get users list
    static async getUserMasters(): Promise<GetUserMastersResponse> {
        const response = await apiClient.get<{
            data: UserMasterApiRow[];
        }>("/user-master/list");

        const rows = response.data.data.map(mapUserRow);

        return {
            data: rows,
            totalRecords: rows.length,
            page: 1,
            limit: rows.length || 10,
            totalPages: 1,
        };
    }

    // Create user
    static async createUserMaster(
        payload: UserMasterFormValues
    ): Promise<UserMasterResponse> {
        const response = await apiClient.post<{
            success: boolean;
            message: string;
            data: UserMasterApiRow;
        }>("/user-master/add", {
            name: payload.name,
            phone: payload.mobileNo,
            password: payload.mobileNo,
            role: "USER",
        });

        return {
            success: response.data.success,
            message: response.data.message,
            data: mapUserRow(response.data.data),
        };
    }

    // Update user
    static async updateUserMaster(
        id: string,
        payload: UserMasterFormValues
    ): Promise<UserMasterResponse> {
        const response = await apiClient.put<{
            success: boolean;
            message: string;
            data: UserMasterApiRow;
        }>(`/user-master/update/${id}`, {
            name: payload.name,
            phone: payload.mobileNo,
            role: "USER",
        });

        return {
            success: response.data.success,
            message: response.data.message,
            data: mapUserRow(response.data.data),
        };
    }

    // Delete user
    static async deleteUserMaster(id: string): Promise<GetUserMastersResponse> {
        await apiClient.delete(`/user-master/delete/${id}`);
        return this.getUserMasters();
    }
}
