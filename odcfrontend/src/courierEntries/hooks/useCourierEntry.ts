import { useCallback, useEffect, useState } from "react";

import type {
    CourierEntryFormValues,
    CourierEntryRow,
    CourierRow,
} from "../dto/courierEntry.dto";

import { CourierEntryService } from "../services/CourierEntry.service";

export function useCourierEntry() {
    // Courier list state
    const [courierList, setCourierList] = useState<CourierRow[]>([]);
    // Courier entries state
    const [entries, setEntries] = useState<CourierEntryRow[]>([]);
    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    // Error state
    const [error, setError] = useState<string | null>(null);
    // Load courier list and entries
    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const couriers = await CourierEntryService.getCourierList();
            const entriesResponse = await CourierEntryService.getEntries();

            setCourierList(couriers);
            setEntries(entriesResponse.data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load courier entries.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create new courier entry
    const createEntry = useCallback(async (payload: CourierEntryFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await CourierEntryService.createEntry(payload);

            setEntries((prevEntries) => [response.data, ...prevEntries]);

            return response;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to save courier entry.";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update entry photo
    const updateEntryPhoto = useCallback(
        async (entryId: string, photoUri: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await CourierEntryService.updateEntryPhoto(
                    entryId,
                    photoUri
                );

                setEntries((prevEntries) =>
                    prevEntries.map((entry) =>
                        entry.id === entryId ? response.data : entry
                    )
                );

                return response;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update photo.";
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Delete courier entry
    const deleteEntry = useCallback(async (entryId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await CourierEntryService.deleteEntry(entryId);

            setEntries(response.data);

            return response;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to delete entry.";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load data on screen mount
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    return {
        courierList,
        entries,
        setEntries,
        createEntry,
        updateEntryPhoto,
        deleteEntry,
        loadInitialData,
        isLoading,
        error,
    };
}
