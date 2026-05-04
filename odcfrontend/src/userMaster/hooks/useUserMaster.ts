import { useCallback, useEffect, useState } from "react";

import type {
    UserMasterFormValues,
    UserMasterRow,
} from "../dto/userMaster.dto";

import { UserMasterService } from "../services/UserMaster.service";
import { Alert } from "react-native";

export function useUserMaster() {
    // Users list state
    const [users, setUsers] = useState<UserMasterRow[]>([]);
    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    // Error state
    const [error, setError] = useState<string | null>(null);

    // Load all users
    const loadUserMasters = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserMasterService.getUserMasters();
            setUsers(response.data);
            return response;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to load users.";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create new user
    const createUserMaster = useCallback(
        async (payload: UserMasterFormValues) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await UserMasterService.createUserMaster(payload);
                setUsers((prev) => [response.data, ...prev]);
                return response;
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || "Failed to save user.";
                setError(message);
                Alert.alert("Error Creating User", message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );


    // Update existing user
    const updateUserMaster = useCallback(
        async (id: string, payload: UserMasterFormValues) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await UserMasterService.updateUserMaster(id, payload);

                setUsers((prev) =>
                    prev.map((item) => (item.id === id ? response.data : item))
                );

                return response;
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || "Failed to update user.";
                setError(message);
                Alert.alert("Error Updating User", message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Delete user
    const deleteUserMaster = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserMasterService.deleteUserMaster(id);
            setUsers(response.data);
            return response;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to delete user.";
            setError(message);
            Alert.alert("Error Deleting User", message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load users on mount
    useEffect(() => {
        loadUserMasters();
    }, [loadUserMasters]);

    // Return user data and actions
    return {
        users,
        setUsers,
        loadUserMasters,
        createUserMaster,
        updateUserMaster,
        deleteUserMaster,
        isLoading,
        error,
    };
}
