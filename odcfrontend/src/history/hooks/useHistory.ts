
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import type { HistoryEntryFormValues, OptionRow } from "../dto/history.dto";
import { HistoryService } from "../services/History.service";

// Get month dropdown options
export function getMonthOptions(): OptionRow[] {
    const months = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(2026, index, 1);

        return {
            label: date.toLocaleString("en-US", { month: "long" }),
            value: date.toLocaleString("en-US", { month: "long" }),
        };
    });

    return [{ label: "All Months", value: "All" }, ...months];
}

// Get year dropdown options
export function getYearOptions(): OptionRow[] {
    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 10 }, (_, index) => {
        const year = (currentYear - index).toString();

        return {
            label: year,
            value: year,
        };
    });

    return [{ label: "All Years", value: "All" }, ...years];
}

// Get month name from date
export function getMonthName(date: string) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-US", {
        month: "long",
    });
}

// Get year from date
export function getYear(date: string) {
    if (!date) return "";

    return new Date(date).getFullYear().toString();
}

// Format date for display
export function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// Convert API data to history row
function mapHistoryEntry(item: any): HistoryEntryFormValues {
    const mobileNo =
        item.phoneNumber ||
        item.userMobileNo ||
        item.phone ||
        item.contactNumber ||
        "";

    const photo =
        item.photoUri ||
        item.photo ||
        item.image ||
        item.photoUrl ||
        item.imageBase64 ||
        item.photoBase64 ||
        item.base64 ||
        "";

    const audio = item.audioUri || item.audio || "";

    return {
        id: item.id || item._id || "",

        courierName: item.courierName || "",
        boxQuantity: String(item.boxQuantity || ""),
        collectedBy: item.collectedBy || "",

        hasPhoto: item.hasPhoto || Boolean(photo),

        userMobileNo: mobileNo,
        phoneNumber: mobileNo,

        photoUri: photo,
        audioUri: audio,

        date: item.date || item.createdAt || "",
        createdAt: item.createdAt || item.date || "",
        uuid4: item.uuid4,
    };
}

export function useHistory() {
    // History data state
    const [historyData, setHistoryData] = useState<HistoryEntryFormValues[]>([]);

    // Selected filter values
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [selectedYear, setSelectedYear] = useState("All");

    // Applied filter values
    const [filterMonth, setFilterMonth] = useState("All");
    const [filterYear, setFilterYear] = useState("All");

    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Memoized dropdown options
    const monthOptions = useMemo(() => getMonthOptions(), []);
    const yearOptions = useMemo(() => getYearOptions(), []);

    // Load history entriess
    const loadHistoryEntries = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await HistoryService.getHistoryEntries();

            const mappedData = response.data.map((item: any) =>
                mapHistoryEntry(item)
            );

            console.log("Mapped History Data:", mappedData);

            setHistoryData(mappedData);

            return {
                ...response,
                data: mappedData,
            };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load history.";

            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Filter history by month and year
    const filteredHistory = useMemo(() => {
        return historyData.filter((entry) => {
            const filterDate = entry.date || entry.createdAt || "";

            if (!filterDate) return true;

            const entryMonth = getMonthName(filterDate);
            const entryYear = getYear(filterDate);

            const monthMatched =
                filterMonth === "All" || entryMonth === filterMonth;

            const yearMatched =
                filterYear === "All" || entryYear === filterYear;

            return monthMatched && yearMatched;
        });
    }, [historyData, filterMonth, filterYear]);

    // Selected month label
    const selectedMonthLabel =
        monthOptions.find((item) => item.value === selectedMonth)?.label ??
        "Month";

    // Selected year label
    const selectedYearLabel =
        yearOptions.find((item) => item.value === selectedYear)?.label ??
        "Year";

    // Apply selected filters
    function handleApplyFilter() {
        setFilterMonth(selectedMonth);
        setFilterYear(selectedYear);
    }

    // Clear all filters
    function handleClearFilter() {
        setSelectedMonth("All");
        setSelectedYear("All");
        setFilterMonth("All");
        setFilterYear("All");
    }

    // Reload data when screen focuses
    useFocusEffect(
        useCallback(() => {
            loadHistoryEntries();
        }, [loadHistoryEntries])
    );

    // Return history data and actions
    return {
        historyData,
        filteredHistory,

        selectedMonth,
        selectedYear,
        filterMonth,
        filterYear,

        monthOptions,
        yearOptions,
        selectedMonthLabel,
        selectedYearLabel,

        setSelectedMonth,
        setSelectedYear,

        handleApplyFilter,
        handleClearFilter,
        loadHistoryEntries,

        isLoading,
        error,
    };
}
