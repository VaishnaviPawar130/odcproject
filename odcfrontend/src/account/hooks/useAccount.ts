import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import type { LoggedInUserDto } from "../dto/account.dto";
import { AccountService } from "../services/Account.service";

export function useAccount() {
    // User state
    const [user, setUser] = useState<LoggedInUserDto | null>(null);

    // Token state
    const [token, setToken] = useState<string | null>(null);

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // Load user and token
    const loadAccount = useCallback(async () => {
        setIsLoading(true);

        try {
            const loggedInUser = await AccountService.getLoggedInUser();
            const authToken = await AccountService.getAuthToken();

            setUser(loggedInUser);
            setToken(authToken);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign out user
    const signOut = useCallback(async () => {
        await AccountService.signOut();
        setUser(null);
        setToken(null);

        router.replace("/auth/login" as any);
    }, []);

    // Load account on mount

    useEffect(() => {
        loadAccount();
    }, [loadAccount]);

    return {
        user,
        token,
        isLoading,
        loadAccount,
        signOut,
    };
}