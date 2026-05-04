import { useCallback, useEffect, useState } from "react";

import type {
    CourierMasterFormValues,
    CourierMasterRow,
} from "../dto/courierMaster.dto";

import { CourierMasterService } from "../services/CourierMaster.service";

export function useCourierMaster() {
    // Courier master list state
    const [courierMasters, setCourierMasters] = useState<CourierMasterRow[]>([]);
    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    // Error state
    const [error, setError] = useState<string | null>(null);
    // Load courier masters
    const loadCourierMasters = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await CourierMasterService.getCourierMasters();
            setCourierMasters(response.data);
            return response;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load couriers.";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create courier master
    const createCourierMaster = useCallback(
        async (payload: CourierMasterFormValues) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await CourierMasterService.createCourierMaster(payload);
                setCourierMasters((prev) => [response.data, ...prev]);
                return response;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to register courier.";
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );
    // Update courier master
    const updateCourierMaster = useCallback(
        async (id: string, payload: CourierMasterFormValues) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await CourierMasterService.updateCourierMaster(
                    id,
                    payload
                );

                setCourierMasters((prev) =>
                    prev.map((item) => (item.id === id ? response.data : item))
                );

                return response;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update courier.";
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Delete courier master
    const deleteCourierMaster = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await CourierMasterService.deleteCourierMaster(id);
            setCourierMasters(response.data);
            return response;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to delete courier.";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        loadCourierMasters();
    }, [loadCourierMasters]);

    // Return data and actions
    return {
        courierMasters,
        setCourierMasters,
        loadCourierMasters,
        createCourierMaster,
        updateCourierMaster,
        deleteCourierMaster,
        isLoading,
        error,
    };
}
