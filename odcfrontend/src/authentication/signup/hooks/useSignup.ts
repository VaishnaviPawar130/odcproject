import { useCallback, useState } from "react";

import { SignupRequestDto, SignupResponseDto } from "../dto/signup.dto";
import { SignupService } from "../services/Signup.service";

export function useSignup() {
    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    // Error message state
    const [error, setError] = useState<string | null>(null);
    // Signup response state
    const [data, setData] = useState<SignupResponseDto | null>(null);
    // Signup API call
    const signup = useCallback(async (payload: SignupRequestDto) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await SignupService.signup(payload);
            setData(response);
            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Signup failed.";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);
    // Reset signup state
    const reset = useCallback(() => {
        setError(null);
        setData(null);
    }, []);
    // Return signup data and actions
    return {
        signup,
        reset,
        isLoading,
        error,
        data,
    };
}