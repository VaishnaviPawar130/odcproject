import TableComponent, {
    type AppTableColumn,
} from "@/components/TableComponent";
import ThreeDotsActionMenu from "@/components/ThreeDotsActionMenu";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
    courierEntrySchema,
    type CourierEntryFormValues,
    type CourierEntryRow,
    type CourierRow,
} from "@/src/courierEntries/dto/courierEntry.dto";

import { CourierEntryService } from "@/src/courierEntries/services/CourierEntry.service";

export default function CourierEntries() {
    // State for form fields
    const [selectedCourier, setSelectedCourier] = useState("");
    const [showCourierDropdown, setShowCourierDropdown] = useState(false);
    const [boxQuantity, setBoxQuantity] = useState("");
    const [collectedBy, setCollectedBy] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // State for validation errors
    const [errors, setErrors] = useState<
        Partial<Record<keyof CourierEntryFormValues, string>>
    >({});

    // State for table data
    const [courierList, setCourierList] = useState<CourierRow[]>([]);
    const [entries, setEntries] = useState<CourierEntryRow[]>([]);

    // State for selected row
    const [selectedEntry, setSelectedEntry] = useState<CourierEntryRow | null>(
        null
    );

    // Modal visibility states
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    // State for edit mode
    const [editingId, setEditingId] = useState<string | null>(null);

    const [recordingModalVisible, setRecordingModalVisible] = useState(false);
    // Audio recording states
    const [recordingEntry, setRecordingEntry] = useState<CourierEntryRow | null>(
        null
    );
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadInitialData();
        }, [])
    );
    // Load courier list and entries
    async function loadInitialData() {
        try {
            const [couriers, entriesResponse] = await Promise.all([
                CourierEntryService.getCourierList(),
                CourierEntryService.getEntries(),
            ]);

            setCourierList(couriers);
            setEntries(entriesResponse.data);

            if (!phoneNumber) {
                const AsyncStorage =
                    require("@react-native-async-storage/async-storage").default;

                const storedUser = await AsyncStorage.getItem("loggedInUser");

                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setPhoneNumber(user.phone);
                }
            }
        } catch (error: any) {
            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load courier data."
            );
        }
    }

    // Reset form fields
    async function resetForm() {
        setSelectedCourier("");
        setShowCourierDropdown(false);
        setBoxQuantity("");
        setCollectedBy("");
        setEditingId(null);
        setErrors({});

        const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;

        const storedUser = await AsyncStorage.getItem("loggedInUser");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setPhoneNumber(user.phone);
        } else {
            setPhoneNumber("");
        }
    }

    // Clear error for selected field
    function clearFieldError(fieldName: keyof CourierEntryFormValues) {
        setErrors((prev) => ({
            ...prev,
            [fieldName]: "",
        }));
    }

    // Open action menu
    function openActionMenu(entry: CourierEntryRow) {
        setSelectedEntry(entry);
        setActionMenuVisible(true);
    }

    function closeActionMenu() {
        setActionMenuVisible(false);
    }

    // Open audio recording modal
    function openRecordingModal(entry: CourierEntryRow) {
        const latestEntry = entries.find((item) => item.id === entry.id) || entry;

        setRecordingEntry(latestEntry);
        setRecordingModalVisible(true);
    }

    // Start audio recording
    async function startRowRecording() {
        try {
            const permission = await Audio.requestPermissionsAsync();

            if (!permission.granted) {
                Alert.alert("Permission Required", "Please allow microphone access.");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
        } catch (error) {
            Alert.alert("Error", "Unable to start recording.");
        }
    }

    // Stop and save audio recording
    async function stopRowRecording() {
        try {
            if (!recording || !recordingEntry) return;

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (!uri) {
                Alert.alert("Error", "Audio recording not found.");
                return;
            }

            // Optimistic local update (instant)
            const optimisticEntry: CourierEntryRow = {
                ...recordingEntry,
                audioUri: uri,
            };

            setEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry.id === recordingEntry.id ? optimisticEntry : entry
                )
            );
            setRecordingEntry(optimisticEntry);

            if (selectedEntry?.id === recordingEntry.id) {
                setSelectedEntry(optimisticEntry);
            }

            // Persist to backend
            const response = await CourierEntryService.updateEntryAudio(
                recordingEntry.id,
                uri
            );

            const syncedEntry: CourierEntryRow = {
                ...response.data,

                audioUri: response.data.audioUri || uri,
            };

            setEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry.id === recordingEntry.id ? syncedEntry : entry
                )
            );
            setRecordingEntry(syncedEntry);

            if (selectedEntry?.id === recordingEntry.id) {
                setSelectedEntry(syncedEntry);
            }

            Alert.alert("Success", "Audio recorded and uploaded successfully.");
        } catch (error: any) {
            setRecording(null);
            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                error?.message ||
                "Unable to save audio recording."
            );
        }
    }


    // Play saved audio
    async function playAudio(audioUri?: string) {
        try {
            if (!audioUri) {
                Alert.alert("No Audio", "No audio recording available.");
                return;
            }

            setIsPlayingAudio(true);

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });

            let sound: Audio.Sound | null = null;

            try {
                const result = await Audio.Sound.createAsync({
                    uri: audioUri,
                });
                sound = result.sound;
            } catch {
                // Retry once without cache-busting query params for stricter media loaders.
                const fallbackUri = audioUri.split("?")[0];
                const result = await Audio.Sound.createAsync({
                    uri: fallbackUri,
                });
                sound = result.sound;
            }

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlayingAudio(false);
                    sound.unloadAsync();
                }
            });

            await sound.playAsync();
        } catch (error) {
            setIsPlayingAudio(false);
            Alert.alert("Error", "Unable to play audio.");
        }
    }

    // Open camera and upload photo
    async function openCamera(entryId: string) {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                Alert.alert("Permission Required", "Please allow camera permission.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.7,
                base64: true,
            });

            const asset = result.assets?.[0];

            if (result.canceled || !asset?.base64) {
                return;
            }

            const imageBase64 = asset.base64;

            const response = await CourierEntryService.updateEntryPhoto(
                entryId,
                imageBase64
            );

            setEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry.id === entryId
                        ? {
                            ...response.data,
                            audioUri: entry.audioUri || response.data.audioUri,
                        }
                        : entry
                )
            );
        } catch (error: any) {
            Alert.alert(
                "Action Failed",
                error?.response?.data?.message ||
                error?.message ||
                "Could not launch camera or upload the photo. Please try again."
            );
        }
    }

    // Save or update courier entry
    async function handleSubmit() {
        const payload: CourierEntryFormValues = {
            courierName: selectedCourier,
            boxQuantity,
            collectedBy,
            phoneNumber,
        };

        const result = courierEntrySchema.safeParse(payload);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof CourierEntryFormValues, string>> =
                {};

            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof CourierEntryFormValues;

                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = issue.message;
                }
            });

            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        try {
            if (editingId) {
                const oldEntry = entries.find((entry) => entry.id === editingId);

                const response = await CourierEntryService.updateEntry(
                    editingId,
                    result.data
                );

                const updatedEntry: CourierEntryRow = {
                    ...response.data,
                    audioUri: oldEntry?.audioUri || response.data.audioUri,
                };

                setEntries((prevEntries) =>
                    prevEntries.map((entry) =>
                        entry.id === editingId ? updatedEntry : entry
                    )
                );

                Alert.alert("Success", response.message);
            } else {
                const response = await CourierEntryService.createEntry(result.data);

                setEntries((prevEntries) => [response.data, ...prevEntries]);

                Alert.alert("Success", response.message);
            }

            resetForm();
        } catch (error: any) {
            Alert.alert(
                "Action Failed",
                error?.response?.data?.message ||
                error?.message ||
                "Unable to save courier entry."
            );
        }
    }

    // View selected entry
    function handleViewEntry() {
        if (!selectedEntry) return;

        const latestEntry =
            entries.find((entry) => entry.id === selectedEntry.id) || selectedEntry;

        setSelectedEntry(latestEntry);
        setActionMenuVisible(false);
        setViewModalVisible(true);
    }

    // Edit selected entry
    function handleEditEntry() {
        if (!selectedEntry) return;

        const latestEntry =
            entries.find((entry) => entry.id === selectedEntry.id) || selectedEntry;

        setActionMenuVisible(false);

        setSelectedEntry(latestEntry);
        setSelectedCourier(latestEntry.courierName);
        setBoxQuantity(latestEntry.boxQuantity);
        setPhoneNumber(latestEntry.phoneNumber);
        setCollectedBy(latestEntry.collectedBy);
        setEditingId(latestEntry.id);
        setErrors({});
    }

    // Delete selected entry
    function handleDeleteEntry() {
        if (!selectedEntry) return;

        setActionMenuVisible(false);

        Alert.alert(
            "Delete Entry",
            "Are you sure you want to delete this entry?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await CourierEntryService.deleteEntry(
                                selectedEntry.id
                            );

                            setEntries(response.data);

                            if (editingId === selectedEntry.id) {
                                resetForm();
                            }

                            setSelectedEntry(null);
                        } catch (error: any) {
                            Alert.alert(
                                "Delete Failed",
                                error?.response?.data?.message ||
                                error?.message ||
                                "Unable to delete entry."
                            );
                        }
                    },
                },
            ]
        );
    }

    const entryColumns: AppTableColumn<CourierEntryRow>[] = [
        {
            key: "courierName",
            title: "Courier",
            flex: 1.5,
            render: (entry) => (
                <View className="pr-2">
                    <Text
                        className="text-sm font-bold text-gray-900"
                        numberOfLines={1}
                    >
                        {entry.courierName}
                    </Text>

                    <Text className="mt-1 text-xs text-gray-500" numberOfLines={1}>
                        {entry.collectedBy}
                    </Text>
                </View>
            ),
        },
        {
            key: "boxQuantity",
            title: "Qty",
            width: 50,
            align: "center",
            render: (entry) => (
                <Text className="text-sm font-bold text-gray-900">
                    {entry.boxQuantity}
                </Text>
            ),
        },
        {
            key: "audio",
            title: "Mic",
            width: 50,
            align: "center",
            render: (entry) => (
                <Pressable
                    onPress={() => openRecordingModal(entry)}
                    className={
                        entry.audioUri
                            ? "h-8 w-8 items-center justify-center rounded-full bg-green-100"
                            : "h-8 w-8 items-center justify-center rounded-full bg-red-100"
                    }
                >
                    <Ionicons
                        name={entry.audioUri ? "mic" : "mic-outline"}
                        size={17}
                        color={entry.audioUri ? "#16A34A" : "#DC2626"}
                    />
                </Pressable>
            ),
        },
        {
            key: "photo",
            title: "Photo",
            width: 60,
            align: "center",
            render: (entry) => (
                <Pressable
                    onPress={() => openCamera(entry.id)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-blue-100"
                >
                    {entry.photoUri ? (
                        <Image
                            source={{ uri: entry.photoUri }}
                            className="h-8 w-8 rounded-full"
                        />
                    ) : (
                        <Ionicons name="camera-outline" size={17} color="#2563EB" />
                    )}
                </Pressable>
            ),
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: 120,
                    }}
                >
                    <View className="mb-4 rounded-3xl bg-white px-5 py-4 shadow-md">
                        <View className="flex-row items-center">
                            <View
                                className="mr-4 items-center justify-center rounded-2xl bg-blue-100"
                                style={{ height: 52, width: 52 }}
                            >
                                <Ionicons name="cube-outline" size={28} color="#2563EB" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-2xl font-extrabold text-gray-900">
                                    Courier Details
                                </Text>

                                <Text className="mt-1 text-sm font-medium text-gray-500">
                                    Add and manage daily courier entries
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="rounded-2xl bg-white p-4 shadow-md">
                        <Text className="mb-2 text-sm font-bold text-gray-700">
                            Select Courier
                        </Text>

                        <Pressable
                            onPress={() => setShowCourierDropdown(!showCourierDropdown)}
                            className="mb-1 flex-row items-center justify-between rounded-xl border bg-white px-4 py-3"
                            style={{
                                borderColor: errors.courierName
                                    ? "#ef4444"
                                    : "#d1d5db",
                            }}
                        >
                            <Text
                                className={
                                    selectedCourier
                                        ? "text-sm text-gray-900"
                                        : "text-sm text-gray-400"
                                }
                            >
                                {selectedCourier || "Select courier"}
                            </Text>

                            <Ionicons
                                name={
                                    showCourierDropdown
                                        ? "chevron-up-outline"
                                        : "chevron-down-outline"
                                }
                                size={22}
                                color="#6B7280"
                            />
                        </Pressable>

                        {errors.courierName ? (
                            <Text
                                className="mb-3 mt-1 text-sm"
                                style={{ color: "#ef4444" }}
                            >
                                {errors.courierName}
                            </Text>
                        ) : (
                            <View className="mb-3" />
                        )}

                        {showCourierDropdown && (
                            <View className="mb-4 rounded-xl border border-gray-200 bg-gray-50">
                                {courierList.map((courier, index) => (
                                    <Pressable
                                        key={courier.id}
                                        onPress={() => {
                                            setSelectedCourier(courier.name);
                                            setShowCourierDropdown(false);
                                            clearFieldError("courierName");
                                        }}
                                        className={
                                            index === courierList.length - 1
                                                ? "px-4 py-3"
                                                : "border-b border-gray-200 px-4 py-3"
                                        }
                                    >
                                        <Text className="text-sm text-gray-800">
                                            {courier.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <Text className="mb-2 text-sm font-bold text-gray-700">
                            Quantity of Box
                        </Text>

                        <TextInput
                            className="mb-1 rounded-xl border bg-white px-4 py-3 text-sm text-gray-900"
                            style={{
                                borderColor: errors.boxQuantity
                                    ? "#ef4444"
                                    : "#d1d5db",
                            }}
                            placeholder="Enter quantity of box"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            value={boxQuantity}
                            onChangeText={(text) => {
                                setBoxQuantity(text);
                                clearFieldError("boxQuantity");
                            }}
                        />

                        {errors.boxQuantity ? (
                            <Text
                                className="mb-3 mt-1 text-sm"
                                style={{ color: "#ef4444" }}
                            >
                                {errors.boxQuantity}
                            </Text>
                        ) : (
                            <View className="mb-3" />
                        )}

                        <Text className="mb-2 text-sm font-bold text-gray-700">
                            Collected By
                        </Text>

                        <TextInput
                            className="mb-1 rounded-xl border bg-white px-4 py-3 text-sm text-gray-900"
                            style={{
                                borderColor: errors.collectedBy
                                    ? "#ef4444"
                                    : "#d1d5db",
                            }}
                            placeholder="Enter collected by name"
                            placeholderTextColor="#9CA3AF"
                            value={collectedBy}
                            onChangeText={(text) => {
                                setCollectedBy(text);
                                clearFieldError("collectedBy");
                            }}
                        />

                        {errors.collectedBy ? (
                            <Text
                                className="mb-3 mt-1 text-sm"
                                style={{ color: "#ef4444" }}
                            >
                                {errors.collectedBy}
                            </Text>
                        ) : (
                            <View className="mb-3" />
                        )}

                        <Text className="mb-2 text-sm font-bold text-gray-700">
                            Phone Number
                        </Text>

                        <TextInput
                            className="mb-1 rounded-xl border bg-white px-4 py-3 text-sm text-gray-900"
                            style={{
                                borderColor: errors.phoneNumber
                                    ? "#ef4444"
                                    : "#d1d5db",
                            }}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            maxLength={10}
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                clearFieldError("phoneNumber");
                            }}
                        />

                        {errors.phoneNumber ? (
                            <Text
                                className="mb-4 mt-1 text-sm"
                                style={{ color: "#ef4444" }}
                            >
                                {errors.phoneNumber}
                            </Text>
                        ) : (
                            <View className="mb-4" />
                        )}

                        <Pressable
                            onPress={handleSubmit}
                            className="rounded-xl bg-blue-600 py-4 active:opacity-80"
                        >
                            <Text className="text-center text-sm font-bold text-white">
                                {editingId ? "Update" : "Save"}
                            </Text>
                        </Pressable>
                    </View>

                    <View className="mb-8 mt-4 rounded-3xl bg-white p-3 shadow-md">
                        <View className="mb-3 flex-row items-center justify-between">
                            <View className="flex-1 pr-3">
                                <Text className="text-2xl font-extrabold text-gray-900">
                                    Recent Entries
                                </Text>
                            </View>
                        </View>

                        <TableComponent<CourierEntryRow>
                            columns={entryColumns}
                            data={entries.slice(0, 6)}
                            keyExtractor={(entry) => entry.id.toString()}
                            onActionPress={openActionMenu}
                            emptyText="No courier entries found"
                            scrollBody={true}
                        />
                    </View>

                    <ThreeDotsActionMenu
                        visible={actionMenuVisible}
                        onClose={closeActionMenu}
                        onView={handleViewEntry}
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                    />

                    <Modal
                        visible={recordingModalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => {
                            if (recording) {
                                Alert.alert("Recording Active", "Please stop recording first.");
                                return;
                            }

                            setRecordingModalVisible(false);
                        }}
                    >
                        <View className="flex-1 items-center justify-center bg-slate-950/60 px-5">
                            <View className="w-full rounded-[28px] bg-white p-5 shadow-2xl">
                                {/* Header */}
                                <View className="mb-4 flex-row items-start justify-between">
                                    <View className="flex-1 pr-3">
                                        <Text className="text-xl font-extrabold text-slate-900">
                                            Voice Note
                                        </Text>

                                        <Text className="mt-1 text-sm text-slate-500">
                                            Attach audio to this courier entry
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() => {
                                            if (recording) {
                                                Alert.alert(
                                                    "Recording Active",
                                                    "Please stop recording first."
                                                );
                                                return;
                                            }

                                            setRecordingModalVisible(false);
                                        }}
                                        className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                                    >
                                        <Ionicons name="close" size={20} color="#334155" />
                                    </Pressable>
                                </View>

                                {/* Entry Summary */}
                                <View className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-3">
                                    <View className="flex-row items-center">
                                        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-blue-600">
                                            <Ionicons name="cube-outline" size={22} color="#ffffff" />
                                        </View>

                                        <View className="flex-1">
                                            <Text className="text-[11px] font-bold uppercase tracking-wide text-blue-500">
                                                Courier
                                            </Text>

                                            <Text className="mt-0.5 text-base font-bold text-slate-900">
                                                {recordingEntry?.courierName || "-"}
                                            </Text>
                                        </View>

                                        <View className="items-end">
                                            <Text className="text-[11px] font-bold uppercase tracking-wide text-blue-500">
                                                Qty
                                            </Text>

                                            <Text className="mt-0.5 text-base font-bold text-slate-900">
                                                {recordingEntry?.boxQuantity || "-"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="mt-3 border-t border-blue-100 pt-3">
                                        <Text className="text-[11px] font-bold uppercase tracking-wide text-blue-500">
                                            Collected By
                                        </Text>

                                        <Text className="mt-0.5 text-sm font-semibold text-slate-800">
                                            {recordingEntry?.collectedBy || "-"}
                                        </Text>
                                    </View>
                                </View>

                                {/* Status Box */}
                                <View
                                    className={`mb-4 flex-row items-center rounded-2xl border px-4 py-3 ${recording
                                        ? "border-amber-200 bg-amber-50"
                                        : recordingEntry?.audioUri
                                            ? "border-emerald-200 bg-emerald-50"
                                            : "border-slate-200 bg-slate-50"
                                        }`}
                                >
                                    <View
                                        className={`mr-3 h-12 w-12 items-center justify-center rounded-full ${recording
                                            ? "bg-amber-500"
                                            : recordingEntry?.audioUri
                                                ? "bg-emerald-600"
                                                : "bg-slate-800"
                                            }`}
                                    >
                                        <Ionicons
                                            name={
                                                recording
                                                    ? "radio-button-on"
                                                    : recordingEntry?.audioUri
                                                        ? "checkmark"
                                                        : "mic"
                                            }
                                            size={24}
                                            color="#ffffff"
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <Text
                                            className={`text-sm font-extrabold ${recording
                                                ? "text-amber-700"
                                                : recordingEntry?.audioUri
                                                    ? "text-emerald-700"
                                                    : "text-slate-900"
                                                }`}
                                        >
                                            {recording
                                                ? "Recording..."
                                                : recordingEntry?.audioUri
                                                    ? "Audio saved"
                                                    : "Ready to record"}
                                        </Text>

                                        <Text className="mt-0.5 text-xs leading-4 text-slate-500">
                                            {recording
                                                ? "Tap stop when done."
                                                : recordingEntry?.audioUri
                                                    ? "Play it or record again."
                                                    : "Tap start to capture voice note."}
                                        </Text>
                                    </View>
                                </View>

                                {/* Buttons */}
                                <View className="flex-row gap-3">
                                    <Pressable
                                        onPress={recording ? stopRowRecording : startRowRecording}
                                        className={`flex-1 flex-row items-center justify-center rounded-2xl py-3.5 ${recording ? "bg-amber-500" : "bg-blue-600"
                                            }`}
                                    >
                                        <Ionicons
                                            name={recording ? "stop-circle-outline" : "mic-outline"}
                                            size={19}
                                            color="#ffffff"
                                        />

                                        <Text className="ml-2 text-sm font-bold text-white">
                                            {recording ? "Stop" : "Record"}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => playAudio(recordingEntry?.audioUri)}
                                        disabled={!recordingEntry?.audioUri || recording !== null}
                                        className={`flex-1 flex-row items-center justify-center rounded-2xl py-3.5 ${!recordingEntry?.audioUri || recording !== null
                                            ? "bg-slate-200"
                                            : "bg-emerald-600"
                                            }`}
                                    >
                                        <Ionicons
                                            name="play-circle-outline"
                                            size={19}
                                            color={
                                                !recordingEntry?.audioUri || recording !== null
                                                    ? "#94A3B8"
                                                    : "#ffffff"
                                            }
                                        />

                                        <Text
                                            className={`ml-2 text-sm font-bold ${!recordingEntry?.audioUri || recording !== null
                                                ? "text-slate-400"
                                                : "text-white"
                                                }`}
                                        >
                                            {isPlayingAudio ? "Playing" : "Play"}
                                        </Text>
                                    </Pressable>
                                </View>

                                <Text className="mt-4 text-center text-[11px] text-slate-400">
                                    Audio is saved to server and can be played later.
                                </Text>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={viewModalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setViewModalVisible(false)}
                    >
                        <View className="flex-1 items-center justify-center bg-black/50 px-5">
                            <View className="max-h-[85%] w-full rounded-3xl bg-white p-5 shadow-xl">
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View className="mb-5 flex-row items-start justify-between">
                                        <View className="flex-1 pr-3">
                                            <Text className="text-xl font-bold text-gray-900">
                                                Courier Entry Details
                                            </Text>

                                            <Text className="mt-1 text-sm text-gray-500">
                                                Complete courier collection information
                                            </Text>
                                        </View>

                                        <Pressable
                                            onPress={() => setViewModalVisible(false)}
                                            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:opacity-70"
                                        >
                                            <Ionicons
                                                name="close"
                                                size={21}
                                                color="#374151"
                                            />
                                        </Pressable>
                                    </View>

                                    <View className="mb-5 items-center">
                                        {selectedEntry?.photoUri ? (
                                            <Image
                                                source={{ uri: selectedEntry.photoUri }}
                                                className="h-40 w-40 rounded-2xl bg-gray-100"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                                                <Ionicons
                                                    name="image-outline"
                                                    size={38}
                                                    color="#9CA3AF"
                                                />

                                                <Text className="mt-2 text-center text-sm font-semibold text-gray-400">
                                                    No image available
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2">
                                        <View className="border-b border-gray-200 py-3">
                                            <Text className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                Courier Name
                                            </Text>

                                            <Text className="mt-1 text-base font-bold text-gray-900">
                                                {selectedEntry?.courierName}
                                            </Text>
                                        </View>

                                        <View className="flex-row border-b border-gray-200 py-3">
                                            <View className="flex-1 pr-3">
                                                <Text className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                    Box Quantity
                                                </Text>

                                                <Text className="mt-1 text-base font-bold text-gray-900">
                                                    {selectedEntry?.boxQuantity} Boxes
                                                </Text>
                                            </View>

                                            <View className="flex-1 pl-3">
                                                <Text className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                    Phone Number
                                                </Text>

                                                <Text className="mt-1 text-base font-bold text-gray-900">
                                                    {selectedEntry?.phoneNumber}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="border-b border-gray-200 py-3">
                                            <Text className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                Collected By
                                            </Text>

                                            <Text className="mt-1 text-base font-bold text-gray-900">
                                                {selectedEntry?.collectedBy}
                                            </Text>
                                        </View>

                                        <View className="py-3">
                                            <Text className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                Audio Recording
                                            </Text>

                                            <Pressable
                                                onPress={() =>
                                                    playAudio(selectedEntry?.audioUri)
                                                }
                                                className={
                                                    selectedEntry?.audioUri
                                                        ? "mt-2 flex-row items-center justify-center rounded-xl bg-emerald-600 px-4 py-3"
                                                        : "mt-2 flex-row items-center justify-center rounded-xl bg-gray-300 px-4 py-3"
                                                }
                                            >
                                                <Ionicons
                                                    name={
                                                        selectedEntry?.audioUri
                                                            ? "play-circle-outline"
                                                            : "mic-outline"
                                                    }
                                                    size={18}
                                                    color="#ffffff"
                                                />

                                                <Text className="ml-2 text-sm font-bold text-white">
                                                    {selectedEntry?.audioUri
                                                        ? isPlayingAudio
                                                            ? "Playing..."
                                                            : "Play Audio"
                                                        : "No Audio Available"}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
