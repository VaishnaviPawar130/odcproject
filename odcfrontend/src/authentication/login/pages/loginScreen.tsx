import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { LoginRequestDto, loginSchema } from "../dto/login.dto";
import { useLogin } from "../hooks/useLogin";

export default function LoginScreen() {
    // Login hook
    const { login, isLoading, error } = useLogin();

    // Form data state
    const [formData, setFormData] = useState<LoginRequestDto>({
        phone: "",
        password: "",
    });

    // Validation errors state
    const [errors, setErrors] = useState<
        Partial<Record<keyof LoginRequestDto, string>>
    >({});

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);


    // Update form field
    function handleChange<K extends keyof LoginRequestDto>(
        key: K,
        value: LoginRequestDto[K]
    ) {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [key]: "",
        }));
    }


    // Handle login submit
    async function handleLogin() {
        const result = loginSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof LoginRequestDto, string>> = {};

            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof LoginRequestDto;

                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = issue.message;
                }
            });

            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        const response = await login(result.data);

        if (!response || !response.user || !response.token) {
            Alert.alert(
                "Login Failed",
                error || "Invalid phone number or password."
            );
            return;
        }

        // Save token and user
        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("loggedInUser", JSON.stringify(response.user));
        // Navigate to home
        router.replace("/(tabs)/home" as any);
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
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        paddingHorizontal: 20,
                        paddingVertical: 24,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Login card */}
                    <View className="rounded-2xl bg-white p-6 shadow-md">
                        <Text className="mb-8 text-center text-3xl font-bold text-gray-900">
                            Login
                        </Text>

                        <Text className="mb-2 text-base font-semibold text-gray-700">
                            Mobile No
                        </Text>

                        {/* Mobile number input */}
                        <TextInput
                            className="rounded-xl border bg-white px-4 py-3 text-base text-gray-900"
                            style={{
                                borderColor: errors.phone ? "#ef4444" : "#d1d5db",
                            }}
                            placeholder="Enter mobile number"
                            keyboardType="number-pad"
                            maxLength={10}
                            value={formData.phone}
                            onChangeText={(text) => handleChange("phone", text)}
                        />

                        {/* Mobile number error */}
                        {errors.phone ? (
                            <Text
                                className="mb-5 mt-1 text-sm"
                                style={{ color: "#ef4444" }}
                            >
                                {errors.phone}
                            </Text>
                        ) : (
                            <View className="mb-5" />
                        )}

                        <Text className="mb-2 text-base font-semibold text-gray-700">
                            Password
                        </Text>

                        {/* Password input */}
                        <View
                            className="flex-row items-center rounded-xl border bg-white px-4"
                            style={{
                                borderColor: errors.password ? "#ef4444" : "#d1d5db",
                            }}
                        >
                            <TextInput
                                className="flex-1 py-3 pr-3 text-base text-gray-900"
                                placeholder="Enter password"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={(text) => handleChange("password", text)}
                            />

                            {/* Show / hide password */}
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={22}
                                    color="#374151"
                                />
                            </Pressable>
                        </View>

                        {/* Password error */}
                        {errors.password ? (
                            <Text
                                className="mb-6 mt-1 text-sm"
                                style={{ color: "#ef4444" }}
                            >
                                {errors.password}
                            </Text>
                        ) : (
                            <View className="mb-6" />
                        )}

                        {/* Login button */}
                        <Pressable
                            onPress={handleLogin}
                            disabled={isLoading}
                            className={`rounded-xl py-4 ${isLoading ? "bg-blue-400" : "bg-blue-600"
                                }`}
                        >
                            <Text className="text-center text-base font-bold text-white">
                                {isLoading ? "Logging in..." : "Login"}
                            </Text>
                        </Pressable>

                        {/* Signup link */}
                        <View className="mt-5 flex-row justify-center">
                            <Text className="text-sm text-gray-600">
                                Don&apos;t have an account?{" "}
                            </Text>

                            <Pressable onPress={() => router.push("/auth/signup" as any)}>
                                <Text className="text-sm font-bold text-blue-600">
                                    Sign Up
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
