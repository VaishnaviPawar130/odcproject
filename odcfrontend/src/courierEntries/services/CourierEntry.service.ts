// import { apiClient } from "@/src/api/apiClient";

// import type {
//     CourierEntryFormValues,
//     CourierEntryResponse,
//     CourierEntryRow,
//     CourierRow,
//     GetCourierEntriesResponse,
// } from "../dto/courierEntry.dto";

// type CourierMasterApiRow = {
//     _id: string;
//     company_name: string;
// };

// type CourierEntryApiRow = {
//     _id: string;
//     quantity: number;
//     collectedBy: string;
//     contactNumber: string;
//     picture?: string | null;
//     courierId?:
//     | {
//         _id: string;
//         company_name: string;
//     }
//     | string;
// };

// const uploadBaseUrl = (apiClient.defaults.baseURL || "").replace(/\/api\/?$/, "");

// function buildPhotoUrl(picture?: string | null) {
//     if (!picture) {
//         return undefined;
//     }

//     // Guard against corrupted JSON object strings saved from previous bugs
//     if (picture.trim().startsWith("{") || picture.includes("[object Object]")) {
//         return undefined;
//     }

//     if (/^https?:\/\//i.test(picture)) {
//         const separator = picture.includes("?") ? "&" : "?";
//         return `${picture}${separator}t=${Date.now()}`;
//     }

//     // Extract just the filename, regardless of whether it's an absolute Windows path or relative Unix path
//     const filename = picture.split(/[\\/]/).pop();

//     // The backend serves static files at /uploads
//     return `${uploadBaseUrl}/uploads/${filename}?t=${Date.now()}`;
// }

// function mapEntryRow(item: CourierEntryApiRow): CourierEntryRow {
//     const courierName =
//         typeof item.courierId === "object" && item.courierId
//             ? item.courierId.company_name
//             : "";

//     return {
//         id: item._id,
//         courierName,
//         boxQuantity: String(item.quantity),
//         phoneNumber: item.contactNumber,
//         collectedBy: item.collectedBy,
//         photoUri: buildPhotoUrl(item.picture),
//     };
// }

// function withCourierNameFallback(
//     row: CourierEntryRow,
//     fallbackCourierName: string
// ): CourierEntryRow {
//     if (row.courierName) {
//         return row;
//     }

//     return {
//         ...row,
//         courierName: fallbackCourierName,
//     };
// }

// async function getCourierListInternal() {
//     const response = await apiClient.get<{
//         data: CourierMasterApiRow[];
//     }>("/courier-master/list");

//     return response.data.data.map((item) => ({
//         id: item._id,
//         name: item.company_name,
//     }));
// }

// async function getCourierIdByName(courierName: string) {
//     const couriers = await getCourierListInternal();
//     const matchedCourier = couriers.find((item) => item.name === courierName);

//     if (!matchedCourier) {
//         throw new Error("Selected courier was not found in courier master.");
//     }

//     return matchedCourier.id;
// }

// export class CourierEntryService {
//     static async getCourierList(): Promise<CourierRow[]> {
//         return getCourierListInternal();
//     }

//     static async getEntries(): Promise<GetCourierEntriesResponse> {
//         const AsyncStorage = require("@react-native-async-storage/async-storage").default;
//         const storedUser = await AsyncStorage.getItem("loggedInUser");
//         const loggedInUser = storedUser ? JSON.parse(storedUser) : null;

//         const response = await apiClient.get<{
//             data: CourierEntryApiRow[];
//             total?: number;
//             currentPage?: number;
//             pageSize?: number;
//             totalPages?: number;
//         }>("/courier");

//         const mappedRows = response.data.data.map(mapEntryRow);

//         let filteredRows = mappedRows;

//         if (loggedInUser && loggedInUser.role.toLowerCase() !== "superadmin") {
//             filteredRows = mappedRows.filter(
//                 (entry) => entry.phoneNumber === loggedInUser.phone
//             );
//         }

//         return {
//             data: filteredRows,
//             totalRecords: filteredRows.length,
//             page: response.data.currentPage ?? 1,
//             limit: response.data.pageSize ?? (filteredRows.length || 10),
//             totalPages: response.data.totalPages ?? 1,
//         };
//     }

//     static async createEntry(
//         payload: CourierEntryFormValues
//     ): Promise<CourierEntryResponse> {
//         const courierId = await getCourierIdByName(payload.courierName);

//         const response = await apiClient.post<{
//             success: boolean;
//             message: string;
//             data: CourierEntryApiRow;
//         }>("/courier", {
//             courierId,
//             quantity: Number(payload.boxQuantity),
//             collectedBy: payload.collectedBy,
//             contactNumber: payload.phoneNumber,
//         });

//         return {
//             success: response.data.success,
//             message: response.data.message,
//             data: withCourierNameFallback(
//                 mapEntryRow(response.data.data),
//                 payload.courierName
//             ),
//         };
//     }

//     static async updateEntry(
//         entryId: string,
//         payload: CourierEntryFormValues
//     ): Promise<CourierEntryResponse> {
//         const courierId = await getCourierIdByName(payload.courierName);

//         const response = await apiClient.put<{
//             success: boolean;
//             message: string;
//             data: CourierEntryApiRow;
//         }>(`/courier/${entryId}`, {
//             courierId,
//             quantity: Number(payload.boxQuantity),
//             collectedBy: payload.collectedBy,
//             contactNumber: payload.phoneNumber,
//         });

//         return {
//             success: response.data.success,
//             message: response.data.message,
//             data: withCourierNameFallback(
//                 mapEntryRow(response.data.data),
//                 payload.courierName
//             ),
//         };
//     }

//     static async updateEntryPhoto(
//         entryId: string,
//         base64String: string
//     ): Promise<CourierEntryResponse> {
//         const response = await apiClient.put<{
//             success: boolean;
//             message: string;
//             data: CourierEntryApiRow;
//         }>(
//             `/courier/${entryId}`,
//             {
//                 pictureBase64: `data:image/jpeg;base64,${base64String}`,
//             },
//             {
//                 timeout: 120000,
//             }
//         );

//         return {
//             success: response.data.success,
//             message: response.data.message,
//             data: mapEntryRow(response.data.data),
//         };
//     }

//     static async deleteEntry(entryId: string): Promise<GetCourierEntriesResponse> {
//         await apiClient.delete(`/courier/${entryId}`);
//         return this.getEntries();
//     }
// }


import { apiClient } from "@/src/api/apiClient";
import * as FileSystem from "expo-file-system/legacy";

import type {
    CourierEntryFormValues,
    CourierEntryResponse,
    CourierEntryRow,
    CourierRow,
    GetCourierEntriesResponse,
} from "../dto/courierEntry.dto";

// Courier master API row type
type CourierMasterApiRow = {
    _id: string;
    company_name: string;
};

// Courier entry API row type
type CourierEntryApiRow = {
    _id: string;
    quantity: number;
    collectedBy: string;
    contactNumber: string;
    picture?: string | null;
    audio?: string | null;
    courierId?:
    | {
        _id: string;
        company_name: string;
    }
    | string;
};

// Get upload base URL
function getUploadBaseUrl() {
    return (apiClient.defaults.baseURL || "").replace(/\/api\/?$/, "");
}

// Build photo/audio URL
function buildMediaUrl(filePath?: string | null) {
    if (!filePath) {
        return undefined;
    }

    if (filePath.trim().startsWith("{") || filePath.includes("[object Object]")) {
        return undefined;
    }

    if (/^https?:\/\//i.test(filePath)) {
        const separator = filePath.includes("?") ? "&" : "?";
        return `${filePath}${separator}t=${Date.now()}`;
    }

    if (filePath.startsWith("file://")) {
        return filePath;
    }

    if (filePath.startsWith("data:")) {
        return filePath;
    }

    const normalizedPath = filePath.replace(/\\/g, "/");
    const uploadsSegment = "/uploads/";
    const uploadsIndex = normalizedPath.lastIndexOf(uploadsSegment);

    if (uploadsIndex >= 0) {
        const relativePath = normalizedPath.slice(uploadsIndex + uploadsSegment.length);
        return `${getUploadBaseUrl()}/uploads/${relativePath}?t=${Date.now()}`;
    }

    const filename = normalizedPath.split("/").pop();
    return `${getUploadBaseUrl()}/uploads/${filename}?t=${Date.now()}`;
}

// Convert API entry to frontend row
function mapEntryRow(item: CourierEntryApiRow): CourierEntryRow {
    const courierName =
        typeof item.courierId === "object" && item.courierId
            ? item.courierId.company_name
            : "";

    return {
        id: item._id,
        courierName,
        boxQuantity: String(item.quantity),
        phoneNumber: item.contactNumber,
        collectedBy: item.collectedBy,
        photoUri: buildMediaUrl(item.picture),
        audioUri: buildMediaUrl(item.audio),
    };
}

// Add courier name if missing
function withCourierNameFallback(
    row: CourierEntryRow,
    fallbackCourierName: string
): CourierEntryRow {
    if (row.courierName) {
        return row;
    }

    return {
        ...row,
        courierName: fallbackCourierName,
    };
}

// Get courier master list
async function getCourierListInternal() {
    const response = await apiClient.get<{
        data: CourierMasterApiRow[];
    }>("/courier-master/list");

    return response.data.data.map((item) => ({
        id: item._id,
        name: item.company_name,
    }));
}

// Find courier id by name
async function getCourierIdByName(courierName: string) {
    const couriers = await getCourierListInternal();
    const normalizedInput = courierName.trim().toLowerCase();
    const matchedCourier =
        couriers.find((item) => item.name === courierName) ||
        couriers.find(
            (item) => item.name.trim().toLowerCase() === normalizedInput
        );

    if (!matchedCourier) {
        throw new Error("Selected courier was not found in courier master.");
    }

    return matchedCourier.id;
}

export class CourierEntryService {
    // Get courier dropdown list
    static async getCourierList(): Promise<CourierRow[]> {
        return getCourierListInternal();
    }

    // Get courier entries
    static async getEntries(): Promise<GetCourierEntriesResponse> {
        const AsyncStorage = require("@react-native-async-storage/async-storage").default;
        const storedUser = await AsyncStorage.getItem("loggedInUser");
        const loggedInUser = storedUser ? JSON.parse(storedUser) : null;

        const response = await apiClient.get<{
            data: CourierEntryApiRow[];
            total?: number;
            currentPage?: number;
            pageSize?: number;
            totalPages?: number;
        }>("/courier");

        const mappedRows = response.data.data.map(mapEntryRow);

        let filteredRows = mappedRows;

        // Filter entries for normal userss
        if (loggedInUser && loggedInUser.role.toLowerCase() !== "superadmin") {
            filteredRows = mappedRows.filter(
                (entry) => entry.phoneNumber === loggedInUser.phone
            );
        }

        return {
            data: filteredRows,
            totalRecords: filteredRows.length,
            page: response.data.currentPage ?? 1,
            limit: response.data.pageSize ?? (filteredRows.length || 10),
            totalPages: response.data.totalPages ?? 1,
        };
    }

    // Create courier entry
    static async createEntry(
        payload: CourierEntryFormValues
    ): Promise<CourierEntryResponse> {
        const courierId = await getCourierIdByName(payload.courierName);

        const response = await apiClient.post<{
            success: boolean;
            message: string;
            data: CourierEntryApiRow;
        }>("/courier", {
            courierId,
            quantity: Number(payload.boxQuantity),
            collectedBy: payload.collectedBy,
            contactNumber: payload.phoneNumber,
        });

        return {
            success: response.data.success,
            message: response.data.message,
            data: withCourierNameFallback(
                mapEntryRow(response.data.data),
                payload.courierName
            ),
        };
    }

    // Update courier entry
    static async updateEntry(
        entryId: string,
        payload: CourierEntryFormValues
    ): Promise<CourierEntryResponse> {
        const courierId = await getCourierIdByName(payload.courierName);

        const response = await apiClient.put<{
            success: boolean;
            message: string;
            data: CourierEntryApiRow;
        }>(`/courier/${entryId}`, {
            courierId,
            quantity: Number(payload.boxQuantity),
            collectedBy: payload.collectedBy,
            contactNumber: payload.phoneNumber,
        });

        return {
            success: response.data.success,
            message: response.data.message,
            data: withCourierNameFallback(
                mapEntryRow(response.data.data),
                payload.courierName
            ),
        };
    }

    // Update entry photo
    static async updateEntryPhoto(
        entryId: string,
        base64String: string
    ): Promise<CourierEntryResponse> {
        const response = await apiClient.put<{
            success: boolean;
            message: string;
            data: CourierEntryApiRow;
        }>(
            `/courier/${entryId}`,
            {
                pictureBase64: `data:image/jpeg;base64,${base64String}`,
            },
            {
                timeout: 120000,
            }
        );

        return {
            success: response.data.success,
            message: response.data.message,
            data: mapEntryRow(response.data.data),
        };
    }

    // Update entry audio
    static async updateEntryAudio(
        entryId: string,
        audioUri: string
    ): Promise<CourierEntryResponse> {
        try {
            const formData = new FormData();
            const filename = audioUri.split("/").pop() || `audio-${Date.now()}.m4a`;

            formData.append("audio", {
                uri: audioUri,
                name: filename,
                type: "audio/m4a",
            } as any);

            const response = await apiClient.put<{
                success: boolean;
                message: string;
                data: CourierEntryApiRow;
            }>(
                `/courier/${entryId}/audio`,
                formData,
                {
                    timeout: 120000,
                }
            );

            return {
                success: response.data.success,
                message: response.data.message,
                data: mapEntryRow(response.data.data),
            };
        } catch {

            // Fallback audio upload as base64
            const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
                encoding: "base64" as any,
            });

            const response = await apiClient.put<{
                success: boolean;
                message: string;
                data: CourierEntryApiRow;
            }>(
                `/courier/${entryId}`,
                {
                    audioBase64: `data:audio/m4a;base64,${base64Audio}`,
                },
                {
                    timeout: 120000,
                }
            );

            return {
                success: response.data.success,
                message: response.data.message,
                data: mapEntryRow(response.data.data),
            };
        }
    }

    // Delete courier entry
    static async deleteEntry(entryId: string): Promise<GetCourierEntriesResponse> {
        await apiClient.delete(`/courier/${entryId}`);
        return this.getEntries();
    }
}
