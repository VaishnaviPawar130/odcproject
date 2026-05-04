import { apiClient } from "@/src/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
    GetHistoryEntriesResponse,
    HistoryEntryFormValues,
    LoggedInUserDto,
} from "../dto/history.dto";

// Get base URL for uploaded files
function getUploadBaseUrl() {
    return (apiClient.defaults.baseURL || "").replace(/\/api\/?$/, "");
}

// Build full media URL
function buildMediaUrl(path?: string | null) {
    if (!path) return "";

    if (/^https?:\/\//i.test(path)) {
        const separator = path.includes("?") ? "&" : "?";
        return `${path}${separator}t=${Date.now()}`;
    }

    const normalizedPath = path.replace(/\\/g, "/");
    const uploadsSegment = "/uploads/";
    const uploadsIndex = normalizedPath.lastIndexOf(uploadsSegment);

    if (uploadsIndex >= 0) {
        const relativePath = normalizedPath.slice(uploadsIndex + uploadsSegment.length);
        return `${getUploadBaseUrl()}/uploads/${relativePath}?t=${Date.now()}`;
    }

    const filename = normalizedPath.split("/").pop();
    return `${getUploadBaseUrl()}/uploads/${filename}?t=${Date.now()}`;
}

export class HistoryService {
    // Get logged-in user
    static async getLoggedInUser(): Promise<LoggedInUserDto | null> {
        const storedUser = await AsyncStorage.getItem("loggedInUser");

        if (!storedUser) {
            return null;
        }

        return JSON.parse(storedUser) as LoggedInUserDto;
    }

    // Get history entries
    static async getHistoryEntries(page = 1, limit = 100): Promise<GetHistoryEntriesResponse> {
        const loggedInUser = await this.getLoggedInUser();

        if (!loggedInUser) {
            return {
                data: [],
                totalRecords: 0,
                page: 1,
                limit: 10,
                totalPages: 1,
            };
        }

        try {
            const response = await apiClient.get(`/courier?page=${page}&limit=${limit}`);

            if (!response.data || !response.data.success) {
                throw new Error("Failed to fetch history");
            }

            const rawData = response.data.data || [];

            // Convert API data to frontend history format
            const mappedData: HistoryEntryFormValues[] = rawData.map((item: any) => ({
                id: item._id,
                date: item.entryDate,
                courierName: item.courierId?.company_name || "Unknown Courier",
                boxQuantity: String(item.quantity),
                collectedBy: item.collectedBy,
                hasPhoto: !!item.picture,
                userMobileNo: item.contactNumber,
                photoUri: buildMediaUrl(item.picture),
                audioUri: buildMediaUrl(item.audio),
            }));

            // Filter records based on user role
            const filteredData =
                loggedInUser.role.toLowerCase() === "superadmin"
                    ? mappedData
                    : mappedData.filter(
                        (entry) => entry.userMobileNo === (loggedInUser as any).phone
                    );

            return {
                data: filteredData,
                totalRecords: filteredData.length,
                page: response.data.currentPage || 1,
                limit: response.data.pageSize || limit,
                totalPages: response.data.totalPages || 1,
            };
        } catch (error) {
            console.error("Error fetching history:", error);
            throw error;
        }
    }
}
