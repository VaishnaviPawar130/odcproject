import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAccount } from "@/src/account/hooks/useAccount";

export default function Account() {
    // Get user data and logout function
    const { user, signOut } = useAccount();

    return (
        <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={["top"]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 112 }}
            >
                {/* Profile Header */}
                <View className="border-b border-gray-100 bg-white px-6 pb-12 pt-6 shadow-sm">
                    <View className="items-center justify-center">
                        {/* Profile image box */}
                        <View className="h-32 w-32 items-center justify-center rounded-[40px] border-2 border-indigo-50 bg-white shadow-xl shadow-indigo-100">
                            <Ionicons name="person-outline" size={50} color="#4F46E5" />
                            {/* Camera icon */}
                            <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-600 shadow-md">
                                <Ionicons name="camera" size={16} color="white" />
                            </View>
                        </View>
                        {/* User name */}
                        <View className="mt-8">
                            <Text className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
                                {user?.name || "User Name"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Settings Menu Block */}
                <View className="mt-10 px-6">
                    <Text className="mb-5 ml-2 text-[10px] font-black uppercase tracking-[2px] text-gray-400">
                        Preferences & Legal
                    </Text>

                    <View className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
                        {/* Privacy Policy */}
                        <Pressable
                            onPress={() => router.push("/(tabs)/account/privacyPolicy")}
                            className="flex-row items-center justify-between border-b border-gray-50 p-5 active:bg-blue-50/30"
                        >
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
                                    <Ionicons
                                        name="shield-checkmark-outline"
                                        size={20}
                                        color="#3B82F6"
                                    />
                                </View>

                                <Text className="ml-4 text-base font-semibold text-gray-800">
                                    Privacy Policy
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                        </Pressable>

                        {/* Terms and Conditions */}
                        <Pressable
                            onPress={() => router.push("/(tabs)/account/termsConditions")}
                            className="flex-row items-center justify-between p-5 active:bg-emerald-50/30"
                        >
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                                    <Ionicons
                                        name="document-text-outline"
                                        size={20}
                                        color="#10B981"
                                    />
                                </View>

                                <Text className="ml-4 text-base font-semibold text-gray-800">
                                    Terms & Conditions
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                        </Pressable>
                    </View>
                </View>

                {/* Sign Out */}
                <View className="mt-16 items-center pb-24">
                    <Pressable
                        onPress={signOut}
                        className="flex-row items-center rounded-full border border-red-100 bg-red-50 px-8 py-3 active:bg-red-100"
                    >
                        <Ionicons name="log-out-outline" size={18} color="#EF4444" />

                        <Text className="ml-2 text-sm font-bold text-red-600">
                            Sign Out
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
