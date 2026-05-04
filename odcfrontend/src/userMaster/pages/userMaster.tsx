
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
    type UserMasterErrors,
    type UserMasterFormValues,
    type UserMasterRow,
    userMasterSchema,
} from "@/src/userMaster/dto/userMaster.dto";
import { useUserMaster } from "@/src/userMaster/hooks/useUserMaster";



export default function UserMaster() {
    // User master hook
    const {
        users: userList,
        createUserMaster,
        updateUserMaster,
        deleteUserMaster,
        isLoading,
    } = useUserMaster();

    // Form states
    const [name, setName] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [isFocused, setIsFocused] = useState<string | null>(null);

    // Selected user state
    const [selectedUser, setSelectedUser] = useState<UserMasterRow | null>(null);

    // Action menu and edit states
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<UserMasterErrors>({});

    // Table columns
    const userColumns: AppTableColumn<UserMasterRow>[] = [
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
            title: "User Name",
            flex: 1,
            render: (item) => (
                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                    {item.name}
                </Text>
            ),
        },
        {
            key: "mobileNo",
            title: "Mobile",
            width: 95,
            render: (item) => (
                <Text className="text-xs font-semibold text-gray-600">
                    {item.phone}
                </Text>
            ),
        },
    ];

    // Open action menu
    function openActionMenu(user: UserMasterRow) {
        setSelectedUser(user);
        setActionMenuVisible(true);
    }

    // Close action menu
    function closeActionMenu() {
        setActionMenuVisible(false);
    }

    // Reset form
    function resetForm() {
        setName("");
        setMobileNo("");
        setEditingId(null);
        setErrors({});
    }

    // Handle name input
    function handleNameChange(value: string) {
        setName(value);

        if (errors.name) {
            setErrors((previousErrors) => ({
                ...previousErrors,
                name: undefined,
            }));
        }
    }

    // Handle mobile input
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

    // Save or update user
    async function handleSubmit() {
        const payload: UserMasterFormValues = {
            name,
            mobileNo,
        };

        const result = userMasterSchema.safeParse(payload);

        if (!result.success) {
            const fieldErrors: UserMasterErrors = {};

            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof UserMasterFormValues;

                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = issue.message;
                }
            });

            setErrors(fieldErrors);

            const firstError =
                result.error.issues[0]?.message || "Invalid user details";

            Alert.alert("Validation Error", firstError);
            return;
        }

        setErrors({});

        if (editingId) {
            const response = await updateUserMaster(editingId, result.data);

            if (!response) {
                return;
            }

            Alert.alert(
                "Success",
                `${response.message} Initial password is the mobile number.`
            );
        } else {
            const response = await createUserMaster(result.data);

            if (!response) {
                return;
            }

            Alert.alert(
                "Success",
                `${response.message} Initial password is the mobile number.`
            );
        }

        resetForm();
    }

    // Fill form for edit
    function handleEditUser() {
        if (!selectedUser) return;

        setActionMenuVisible(false);
        setName(selectedUser.name);
        setMobileNo(selectedUser.phone);
        setEditingId(selectedUser.id);
        setErrors({});
    }

    // Delete selected user
    function handleDeleteUser() {
        if (!selectedUser) return;

        setActionMenuVisible(false);

        Alert.alert(
            "Confirm Delete",
            `Are you sure you want to delete ${selectedUser.name}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteUserMaster(selectedUser.id);

                        if (editingId === selectedUser.id) {
                            resetForm();
                        }

                        setSelectedUser(null);
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
                                className="mr-4 items-center justify-center rounded-2xl bg-green-100"
                                style={{ height: 52, width: 52 }}
                            >
                                <Ionicons name="people-outline" size={28} color="#16A34A" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-2xl font-extrabold text-gray-900">
                                    User Master
                                </Text>

                                <Text className="mt-1 text-sm font-medium text-gray-500">
                                    Add and manage registered users
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Form */}
                    <View className="rounded-3xl bg-white p-5 shadow-md">
                        <Text className="mb-5 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
                            User Details
                        </Text>

                        <View className="mb-5">
                            <View
                                className={`flex-row items-center rounded-2xl border px-4 ${errors.name
                                    ? "border-red-500 bg-red-50"
                                    : isFocused === "name"
                                        ? "border-green-600 bg-white"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color={
                                        errors.name
                                            ? "#EF4444"
                                            : isFocused === "name"
                                                ? "#16A34A"
                                                : "#9CA3AF"
                                    }
                                />

                                <TextInput
                                    className="flex-1 px-3 py-4 text-base font-semibold text-gray-900"
                                    placeholder="User Name"
                                    placeholderTextColor="#9CA3AF"
                                    value={name}
                                    onFocus={() => setIsFocused("name")}
                                    onBlur={() => setIsFocused(null)}
                                    onChangeText={handleNameChange}
                                />
                            </View>

                            {errors.name ? (
                                <Text className="mt-2 text-xs font-semibold text-red-500">
                                    {errors.name}
                                </Text>
                            ) : null}
                        </View>

                        <View className="mb-6">
                            <View
                                className={`flex-row items-center rounded-2xl border px-4 ${errors.mobileNo
                                    ? "border-red-500 bg-red-50"
                                    : isFocused === "phone"
                                        ? "border-green-600 bg-white"
                                        : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <Ionicons
                                    name="call-outline"
                                    size={20}
                                    color={
                                        errors.mobileNo
                                            ? "#EF4444"
                                            : isFocused === "phone"
                                                ? "#16A34A"
                                                : "#9CA3AF"
                                    }
                                />

                                <TextInput
                                    className="flex-1 px-3 py-4 text-base font-semibold text-gray-900"
                                    placeholder=" Registered Mobile Number"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    value={mobileNo}
                                    onFocus={() => setIsFocused("phone")}
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
                            className="rounded-2xl bg-green-600 py-4 active:opacity-80"
                        >
                            <Text className="text-center text-base font-bold text-white">
                                {isLoading
                                    ? "Saving..."
                                    : editingId
                                        ? "Update User"
                                        : "Save User"}
                            </Text>
                        </Pressable>
                    </View>

                    {/* User List with Vertical Scroller */}
                    <View className="mt-6 rounded-3xl bg-white p-4 shadow-md">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View className="flex-1 pr-3">
                                <Text className="text-xl font-bold text-gray-900">
                                    User List
                                </Text>
                            </View>

                            <View className="rounded-full bg-green-100 px-3 py-1">
                                <Text className="text-xs font-bold text-green-600">
                                    {userList.length} Total
                                </Text>
                            </View>
                        </View>

                        <TableComponent<UserMasterRow>
                            columns={userColumns}
                            data={userList}
                            keyExtractor={(item) => item.id}
                            onActionPress={openActionMenu}
                            emptyText="No users found"
                            scrollBody={true}
                        />
                    </View>
                </ScrollView>

                <ThreeDotsActionMenu
                    visible={actionMenuVisible}
                    onClose={closeActionMenu}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}