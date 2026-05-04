import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TableComponent, {
    type AppTableColumn,
} from "@/components/TableComponent";

import ThreeDotsActionMenu from "@/components/ThreeDotsActionMenu";
import {
    courierMasterSchema,
    type CourierMasterFormValues,
    type CourierMasterRow,
} from "@/src/courierMaster/dto/courierMaster.dto";
import { useCourierMaster } from "@/src/courierMaster/hooks/useCourierMaster";

// Error type for form fields
type CourierMasterErrors = Partial<Record<keyof CourierMasterFormValues, string>>;

export default function CourierMaster() {
    const {
        courierMasters: courierList,
        createCourierMaster,
        updateCourierMaster,
        deleteCourierMaster,
        isLoading,
    } = useCourierMaster();

    // Form states
    const [courierName, setCourierName] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [isFocused, setIsFocused] = useState<string | null>(null);
    // Selected courier state
    const [selectedCourier, setSelectedCourier] =
        useState<CourierMasterRow | null>(null);
    // Action and edit states
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    // Validation errors
    const [errors, setErrors] = useState<CourierMasterErrors>({});
    // Table columns
    const courierColumns: AppTableColumn<CourierMasterRow>[] = [
        {
            key: "srNo",
            title: "No",
            width: 40,
            render: (_item, index) => (
                <Text className="text-sm font-semibold text-gray-500">
                    {index + 1}
                </Text>
            ),
        },
        {
            key: "name",
            title: "Courier Name",
            flex: 1,
            render: (item) => (
                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                    {item.courierName}
                </Text>
            ),
        },
        {
            key: "mobileNo",
            title: "Mobile",
            width: 95,
            render: (item) => (
                <Text className="text-xs font-semibold text-gray-600">
                    {item.mobileNo}
                </Text>
            ),
        },
    ];
    // Open action menu
    function openActionMenu(courier: CourierMasterRow) {
        setSelectedCourier(courier);
        setActionMenuVisible(true);
    }
    // Close action menu
    function closeActionMenu() {
        setActionMenuVisible(false);
    }
    // Reset form fields
    function resetForm() {
        setCourierName("");
        setMobileNo("");
        setEditingId(null);
        setErrors({});
    }
    // Handle courier name input
    function handleCourierNameChange(value: string) {
        setCourierName(value);

        if (errors.courierName) {
            setErrors((previousErrors) => ({
                ...previousErrors,
                courierName: undefined,
            }));
        }
    }
    // Handle mobile number input
    function handleMobileNoChange(value: string) {
        const onlyDigits = value.replace(/[^0-9]/g, "");

        setMobileNo(onlyDigits);

        if (errors.mobileNo) {
            setErrors((previousErrors) => ({
                ...previousErrors,
                mobileNo: undefined,
            }));
        }
    }
    // Save or update courier

    async function handleSubmit() {
        const payload: CourierMasterFormValues = {
            courierName,
            mobileNo,
        };

        const result = courierMasterSchema.safeParse(payload);

        if (!result.success) {
            const fieldErrors: CourierMasterErrors = {};

            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof CourierMasterFormValues;

                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = issue.message;
                }
            });

            setErrors(fieldErrors);

            const firstError =
                result.error.issues[0]?.message || "Invalid courier details";

            Alert.alert("Validation Error", firstError);
            return;
        }

        setErrors({});

        if (editingId) {
            const response = await updateCourierMaster(editingId, result.data);

            if (!response) {
                Alert.alert("Error", "Failed to update courier");
                return;
            }

            Alert.alert("Success", response.message);
        } else {
            const response = await createCourierMaster(result.data);

            if (!response) {
                Alert.alert("Error", "Failed to create courier");
                return;
            }

            Alert.alert("Success", response.message);
        }

        resetForm();
    }

    // Fill form for editing
    function handleEditCourier() {
        if (!selectedCourier) return;

        setActionMenuVisible(false);
        setCourierName(selectedCourier.courierName);
        setMobileNo(selectedCourier.mobileNo);
        setEditingId(selectedCourier.id);
        setErrors({});
    }

    // Delete selected courier
    function handleDeleteCourier() {
        if (!selectedCourier) return;

        setActionMenuVisible(false);

        Alert.alert(
            "Confirm Delete",
            `Are you sure you want to delete ${selectedCourier.courierName}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteCourierMaster(selectedCourier.id);

                        if (editingId === selectedCourier.id) {
                            resetForm();
                        }

                        setSelectedCourier(null);
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
            {/* Keyboard handling */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 12,
                        paddingBottom: 120,
                    }}
                    nestedScrollEnabled
                >
                    {/* Back Button */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <Pressable
                            onPress={() => router.replace("/settings" as any)}
                            className="h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm active:opacity-80"
                        >
                            <Ionicons name="arrow-back" size={22} color="#111827" />
                        </Pressable>

                        <View className="flex-1" />

                        <View className="w-11" />
                    </View>

                    {/* Header */}
                    <View className="mb-6 rounded-3xl bg-white px-5 py-5 shadow-md">
                        <View className="flex-row items-center">
                            <View
                                className="mr-4 items-center justify-center rounded-2xl bg-blue-100"
                                style={{ height: 52, width: 52 }}
                            >
                                <Ionicons name="briefcase-outline" size={28} color="#2563EB" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-2xl font-extrabold text-gray-900">
                                    Courier Master
                                </Text>

                                <Text className="mt-1 text-sm font-medium text-gray-500">
                                    Add and manage courier details
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Form */}
                    <View className="rounded-3xl bg-white p-5 shadow-md">
                        <Text className="mb-5 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
                            Courier Details
                        </Text>

                        <View className="mb-5">
                            <View
                                className={`flex-row items-center rounded-2xl border px-4 ${errors.courierName
                                    ? "border-red-500 bg-red-50"
                                    : isFocused === "courierName"
                                        ? "border-blue-600 bg-white"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <Ionicons
                                    name="briefcase-outline"
                                    size={20}
                                    color={
                                        errors.courierName
                                            ? "#EF4444"
                                            : isFocused === "courierName"
                                                ? "#2563EB"
                                                : "#9CA3AF"
                                    }
                                />

                                <TextInput
                                    className="flex-1 px-3 py-4 text-base font-semibold text-gray-900"
                                    placeholder="Courier Name"
                                    placeholderTextColor="#9CA3AF"
                                    value={courierName}
                                    onFocus={() => setIsFocused("courierName")}
                                    onBlur={() => setIsFocused(null)}
                                    onChangeText={handleCourierNameChange}
                                />
                            </View>

                            {errors.courierName ? (
                                <Text className="mt-2 text-xs font-semibold text-red-500">
                                    {errors.courierName}
                                </Text>
                            ) : null}
                        </View>

                        <View className="mb-6">
                            <View
                                className={`flex-row items-center rounded-2xl border px-4 ${errors.mobileNo
                                    ? "border-red-500 bg-red-50"
                                    : isFocused === "mobileNo"
                                        ? "border-blue-600 bg-white"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <Ionicons
                                    name="call-outline"
                                    size={20}
                                    color={
                                        errors.mobileNo
                                            ? "#EF4444"
                                            : isFocused === "mobileNo"
                                                ? "#2563EB"
                                                : "#9CA3AF"
                                    }
                                />

                                <TextInput
                                    className="flex-1 px-3 py-4 text-base font-semibold text-gray-900"
                                    placeholder="Mobile Number"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    value={mobileNo}
                                    onFocus={() => setIsFocused("mobileNo")}
                                    onBlur={() => setIsFocused(null)}
                                    onChangeText={handleMobileNoChange}
                                />
                            </View>

                            {errors.mobileNo ? (
                                <Text className="mt-2 text-xs font-semibold text-red-500">
                                    {errors.mobileNo}
                                </Text>
                            ) : null}
                        </View>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={isLoading}
                            className="rounded-2xl bg-blue-600 py-4 active:opacity-80"
                        >
                            <Text className="text-center text-base font-bold text-white">
                                {isLoading
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Courier"
                                        : "Save Courier"}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Courier List with Vertical Scroller */}
                    <View className="mt-6 rounded-3xl bg-white p-4 shadow-md">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View className="flex-1 pr-3">
                                <Text className="text-xl font-bold text-gray-900">
                                    Courier List
                                </Text>
                            </View>

                            <View className="rounded-full bg-blue-100 px-3 py-1">
                                <Text className="text-xs font-bold text-blue-600">
                                    {courierList.length} Total
                                </Text>
                            </View>
                        </View>

                        <TableComponent<CourierMasterRow>
                            columns={courierColumns}
                            data={courierList}
                            keyExtractor={(item) => item.id}
                            onActionPress={openActionMenu}
                            emptyText="No couriers found"
                            scrollBody={true}
                        />
                    </View>
                </ScrollView>

                <ThreeDotsActionMenu
                    visible={actionMenuVisible}
                    onClose={closeActionMenu}
                    onEdit={handleEditCourier}
                    onDelete={handleDeleteCourier}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}