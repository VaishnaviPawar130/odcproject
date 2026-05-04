import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { Animated, AppState, Text, View } from "react-native";

export default function InternetStatus() {
    // Internet status state
    const [hasInternet, setHasInternet] = useState<boolean | null>(null);
    // Message visibility state
    const [showMessage, setShowMessage] = useState(false);
    // Previous internet status
    const previousStatus = useRef<boolean | null>(null);
    // Timer reference
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Slide animation value
    const slideAnim = useRef(new Animated.Value(-80)).current;
    // Show internet status message
    const showStatusMessage = (status: boolean) => {
        setHasInternet(status);
        setShowMessage(true);

        // Slide message down
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Hide message after 3 seconds
        timerRef.current = setTimeout(() => {
            Animated.timing(slideAnim, {
                toValue: -80,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setShowMessage(false);
            });
        }, 3000);
    };

    // Update status only when changed
    const updateInternetStatus = (status: boolean) => {
        if (previousStatus.current === null) {
            previousStatus.current = status;
            showStatusMessage(status);
            return;
        }

        if (previousStatus.current !== status) {
            previousStatus.current = status;
            showStatusMessage(status);
        }
    };

    // Check current internet status
    const checkInternet = async () => {
        const state = await NetInfo.fetch();

        const internetAvailable =
            state.isConnected === true && state.isInternetReachable !== false;

        updateInternetStatus(internetAvailable);
    };

    useEffect(() => {
        // Initial internet check

        checkInternet();
        // Listen for internet status changes

        const unsubscribe = NetInfo.addEventListener((state) => {
            const internetAvailable =
                state.isConnected === true && state.isInternetReachable !== false;

            updateInternetStatus(internetAvailable);
        });

        // Recheck internet every 3 seconds
        const interval = setInterval(() => {
            checkInternet();
        }, 3000);

        // Recheck when app state changes
        const appStateSubscription = AppState.addEventListener("change", () => {
            checkInternet();
        });

        return () => {
            // Cleanup listeners and timers
            unsubscribe();
            clearInterval(interval);
            appStateSubscription.remove();

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // Hide component when message should not show
    if (!showMessage || hasInternet === null) {
        return null;
    }

    return (
        <Animated.View
            style={{
                transform: [{ translateY: slideAnim }],
                backgroundColor: hasInternet ? "#16a34a" : "#dc2626",
                marginHorizontal: 12,
                marginTop: 10,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.18,
                shadowRadius: 6,
                zIndex: 9999,
            }}
        >
            {/* Message content */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                {/* Warning icon text */}

                <Text
                    style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: "700",
                    }}
                >
                    {hasInternet ? "" : "!"}
                </Text>
                {/* Status text */}
                <Text
                    style={{
                        color: "white",
                        textAlign: "center",
                        fontWeight: "700",
                        fontSize: 14,
                    }}
                >
                    {hasInternet ? " Connected to internet" : "No internet connection"}
                </Text>
            </View>
        </Animated.View>
    );
}
