import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LoggedInUserDto } from "../dto/account.dto";

export class AccountService {

    // Get logged-in user data
    static async getLoggedInUser(): Promise<LoggedInUserDto | null> {
        const storedUser = await AsyncStorage.getItem("loggedInUser");

        if (!storedUser) {
            return null;
        }

        return JSON.parse(storedUser) as LoggedInUserDto;
    }

    // Get saved auth token
    static async getAuthToken(): Promise<string | null> {
        return await AsyncStorage.getItem("authToken");
    }

    // Clear user session
    static async signOut(): Promise<void> {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("loggedInUser");
    }
}