
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TableComponent, {
    type AppTableColumn,
} from "@/components/TableComponent";

import ThreeDotsActionMenu from "@/components/ThreeDotsActionMenu";

import {
    useHistory,
    formatDate,
} from "../../../src/history/hooks/useHistory";
import type {
    OptionRow,
    SelectPopupProps,
    HistoryRecord,
} from "../../../src/history/dto/history.dto";


// Reusable select popup
function SelectPopup({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
}: SelectPopupProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 items-center justify-center bg-black/40 px-6">
                <View className="w-full rounded-3xl bg-white p-4 shadow-xl">
                    {/* Popup header */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-base font-extrabold text-slate-900">
                            {title}
                        </Text>

                        <Pressable
                            onPress={onClose}
                            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                        >
                            <Ionicons name="close" size={20} color="#334155" />
                        </Pressable>
                    </View>

                    {/* Options list */}
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.value}
                        showsVerticalScrollIndicator
                        style={{ maxHeight: 310 }}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => {
                            const active = item.value === selectedValue;

                            return (
                                <Pressable
                                    onPress={() => {
                                        onSelect(item.value);
                                        onClose();
                                    }}
                                    className={`mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3 ${active
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 bg-white"
                                        }`}
                                >
                                    <Text
                                        className={`text-sm ${active
                                            ? "font-extrabold text-blue-700"
                                            : "font-semibold text-slate-700"
                                            }`}
                                    >
                                        {item.label}
                                    </Text>

                                    {active && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#2563eb"
                                        />
                                    )}
                                </Pressable>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}

export default function History() {
    // Get history data and filters

    const {
        filteredHistory,
        selectedMonth,
        selectedYear,
        filterMonth,
        filterYear,
        monthOptions,
        yearOptions,
        selectedMonthLabel,
        selectedYearLabel,
        setSelectedMonth,
        setSelectedYear,
        handleApplyFilter,
        handleClearFilter,
    } = useHistory();

    // Filter popup states
    const [monthPopupVisible, setMonthPopupVisible] = useState(false);
    const [yearPopupVisible, setYearPopupVisible] = useState(false);

    // Selected record state
    const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(
        null
    );

    // Modal states
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    // Audio play state
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Get proper photo URI
    function getPhotoUri(record: HistoryRecord | null) {
        if (!record) return "";

        const photo =
            record.photoUri ||
            record.photo ||
            record.image ||
            record.photoUrl ||
            record.imageBase64 ||
            record.photoBase64 ||
            record.base64 ||
            "";

        if (!photo) return "";

        if (photo.startsWith("http")) return photo;
        if (photo.startsWith("file://")) return photo;
        if (photo.startsWith("data:image")) return photo;

        return `data:image/jpeg;base64,${photo}`;
    }

    // Open action menu
    function openActionMenu(record: HistoryRecord) {
        setSelectedRecord(record);
        setActionMenuVisible(true);
    }

    // Close action menu
    function closeActionMenu() {
        setActionMenuVisible(false);
    }

    // View selected record
    function handleViewRecord() {
        if (!selectedRecord) return;

        console.log("Selected History Record:", selectedRecord);
        console.log("Selected Photo URI:", getPhotoUri(selectedRecord));

        setActionMenuVisible(false);
        setViewModalVisible(true);
    }

    // Play audio note
    async function playAudio(audioUri?: string) {
        try {
            if (!audioUri) {
                return;
            }

            setIsPlayingAudio(true);

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });

            let sound: Audio.Sound | null = null;

            try {
                const result = await Audio.Sound.createAsync({ uri: audioUri });
                sound = result.sound;
            } catch {
                const fallbackUri = audioUri.split("?")[0];
                const result = await Audio.Sound.createAsync({ uri: fallbackUri });
                sound = result.sound;
            }

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlayingAudio(false);
                    sound.unloadAsync();
                }
            });

            await sound.playAsync();
        } catch {
            setIsPlayingAudio(false);
        }
    }

    // Table columns
    const historyColumns: AppTableColumn<HistoryRecord>[] = [
        {
            key: "courierName",
            title: "Courier",
            flex: 1.5,
            render: (item) => (
                <View className="pr-2">
                    <Text
                        className="text-sm font-bold text-slate-900"
                        numberOfLines={1}
                    >
                        {item.courierName}
                    </Text>

                    <Text
                        className="mt-1 text-xs font-medium text-slate-500"
                        numberOfLines={1}
                    >
                        {item.collectedBy}
                    </Text>
                </View>
            ),
        },
        {
            key: "boxQuantity",
            title: "Qty",
            width: 55,
            align: "center",
            render: (item) => (
                <View className="rounded-full bg-blue-50 px-3 py-1">
                    <Text className="text-xs font-extrabold text-blue-700">
                        {item.boxQuantity}
                    </Text>
                </View>
            ),
        },
        {
            key: "date",
            title: "Date",
            width: 90,
            align: "right",
            render: (item) => (
                <Text
                    className="text-xs font-semibold text-slate-500"
                    numberOfLines={1}
                >
                    {formatDate(item.createdAt || item.date || "")}
                </Text>
            ),
        },
    ];

    // Table and selected photo data
    const tableData = filteredHistory as unknown as HistoryRecord[];
    const selectedPhotoUri = getPhotoUri(selectedRecord);

    return (
        <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 120,
                }}
            >
                {/* Page header */}
                <View className="mb-4 rounded-3xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
                    <View className="flex-row items-center">
                        <View
                            className="mr-4 items-center justify-center rounded-2xl bg-blue-100"
                            style={{ height: 52, width: 52 }}
                        >
                            <Ionicons name="time-outline" size={28} color="#2563EB" />
                        </View>

                        <View className="flex-1">
                            <Text className="text-2xl font-extrabold text-gray-900">
                                History
                            </Text>

                            <Text className="mt-1 text-sm font-medium text-gray-500">
                                View and filter previous courier records
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Filter card */}
                <View className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                    <View className="mb-4 flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm font-extrabold text-slate-900">
                                Filter Records
                            </Text>

                            <Text className="mt-1 text-xs font-medium text-slate-400">
                                Select month and year
                            </Text>
                        </View>

                        <Pressable
                            onPress={handleClearFilter}
                            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 active:opacity-80"
                        >
                            <Text className="text-xs font-extrabold text-blue-600">
                                Clear
                            </Text>
                        </Pressable>
                    </View>

                    {/* Month and year selectors */}
                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={() => setMonthPopupVisible(true)}
                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-90"
                        >
                            <Text className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                                Month
                            </Text>

                            <View className="mt-1 flex-row items-center justify-between">
                                <Text
                                    className="text-sm font-extrabold text-slate-900"
                                    numberOfLines={1}
                                >
                                    {selectedMonthLabel}
                                </Text>

                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color="#64748b"
                                />
                            </View>
                        </Pressable>

                        <Pressable
                            onPress={() => setYearPopupVisible(true)}
                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-90"
                        >
                            <Text className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                                Year
                            </Text>

                            <View className="mt-1 flex-row items-center justify-between">
                                <Text
                                    className="text-sm font-extrabold text-slate-900"
                                    numberOfLines={1}
                                >
                                    {selectedYearLabel}
                                </Text>

                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color="#64748b"
                                />
                            </View>
                        </Pressable>
                    </View>

                    {/* Apply filter button */}
                    <Pressable
                        onPress={handleApplyFilter}
                        className="mt-4 flex-row items-center justify-center rounded-2xl bg-blue-600 py-3.5 active:opacity-80"
                    >
                        <Ionicons name="search-outline" size={18} color="white" />

                        <Text className="ml-2 text-sm font-extrabold text-white">
                            Apply Filter
                        </Text>
                    </Pressable>
                </View>

                {/* Records count */}
                <View className="mb-2 flex-row items-center justify-between px-1">
                    <View className="flex-1 pr-3">
                        <Text className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Records
                        </Text>

                        <Text className="mt-1 text-xs font-medium text-slate-400">
                            {tableData.length} records found
                        </Text>
                    </View>

                    <View className="rounded-full border border-slate-200 bg-white px-3 py-2">
                        <Text className="text-[11px] font-bold text-slate-500">
                            {filterMonth === "All" ? "All Months" : filterMonth} /{" "}
                            {filterYear === "All" ? "All Years" : filterYear}
                        </Text>
                    </View>
                </View>


                {/* History table */}
                <View className="rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
                    <TableComponent<HistoryRecord>
                        columns={historyColumns}
                        data={tableData}
                        keyExtractor={(item) => item.id.toString()}
                        onActionPress={openActionMenu}
                        emptyText="No courier records found"
                        scrollBody={true}
                        maxBodyHeight={420}
                    />
                </View>

                {/* Month popup */}
                <SelectPopup
                    visible={monthPopupVisible}
                    title="Select Month"
                    options={monthOptions}
                    selectedValue={selectedMonth}
                    onSelect={setSelectedMonth}
                    onClose={() => setMonthPopupVisible(false)}
                />

                {/* Year popup */}
                <SelectPopup
                    visible={yearPopupVisible}
                    title="Select Year"
                    options={yearOptions}
                    selectedValue={selectedYear}
                    onSelect={setSelectedYear}
                    onClose={() => setYearPopupVisible(false)}
                />

                {/* Action menu */}
                <ThreeDotsActionMenu
                    visible={actionMenuVisible}
                    onClose={closeActionMenu}
                    onView={handleViewRecord}
                />
                {/* Record details modal */}
                <Modal
                    visible={viewModalVisible}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => setViewModalVisible(false)}
                >
                    <Pressable
                        onPress={() => setViewModalVisible(false)}
                        className="flex-1 items-center justify-center bg-slate-900/60 px-6"
                    >
                        <Pressable
                            onPress={(event) => event.stopPropagation()}
                            className="w-full overflow-hidden rounded-[32px] bg-white shadow-2xl"
                            style={{ maxHeight: "80%" }}
                        >
                            {/* Header Section */}
                            <View className="flex-row items-center justify-between bg-slate-50 px-6 py-5">
                                <View className="flex-row items-center">
                                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
                                        <Ionicons name="document-text" size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text className="text-lg font-black tracking-tight text-slate-900">
                                            Entry Details
                                        </Text>
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Shipment Record
                                        </Text>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={() => setViewModalVisible(false)}
                                    className="h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100 active:bg-slate-50"
                                >
                                    <Ionicons name="close" size={22} color="#64748b" />
                                </Pressable>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ padding: 24 }}
                            >
                                {/* Main Identity Card */}
                                <View className="mb-6 flex-row items-center rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
                                    <Pressable
                                        onPress={() => selectedPhotoUri && setImagePreviewVisible(true)}
                                        className="mr-4 shadow-sm"
                                    >
                                        {selectedPhotoUri ? (
                                            <Image
                                                source={{ uri: selectedPhotoUri }}
                                                className="h-20 w-20 rounded-2xl border-2 border-white bg-slate-200"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                                                <Ionicons name="image-outline" size={24} color="#94A3B8" />
                                            </View>
                                        )}
                                    </Pressable>

                                    <View className="flex-1">
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                            Courier Service
                                        </Text>
                                        <Text className="text-xl font-black leading-7 text-slate-900" numberOfLines={2}>
                                            {selectedRecord?.courierName || "N/A"}
                                        </Text>
                                        <View className="mt-2 self-start rounded-lg bg-blue-100 px-2 py-1">
                                            <Text className="text-[11px] font-bold text-blue-700">
                                                {selectedRecord?.boxQuantity || "0"} Boxes Received
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Info Grid */}
                                <View className="flex-row flex-wrap justify-between">
                                    {/* Collected By */}
                                    <View className="mb-5 w-[48%] rounded-2xl border border-slate-100 p-3">
                                        <View className="mb-1 flex-row items-center">
                                            <Ionicons name="person-circle-outline" size={16} color="#6366f1" />
                                            <Text className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient</Text>
                                        </View>
                                        <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                                            {selectedRecord?.collectedBy || "Not specified"}
                                        </Text>
                                    </View>

                                    {/* Phone Number */}
                                    <View className="mb-5 w-[48%] rounded-2xl border border-slate-100 p-3">
                                        <View className="mb-1 flex-row items-center">
                                            <Ionicons name="call-outline" size={16} color="#10b981" />
                                            <Text className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</Text>
                                        </View>
                                        <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                                            {selectedRecord?.phoneNumber || selectedRecord?.userMobileNo || "-"}
                                        </Text>
                                    </View>

                                    {/* Date */}
                                    <View className="mb-5 w-full rounded-2xl border border-slate-100 p-3">
                                        <View className="mb-1 flex-row items-center">
                                            <Ionicons name="calendar-outline" size={16} color="#f59e0b" />
                                            <Text className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Registration Date</Text>
                                        </View>
                                        <Text className="text-sm font-bold text-slate-900">
                                            {formatDate(selectedRecord?.createdAt || selectedRecord?.date || "")}
                                        </Text>
                                    </View>
                                </View>

                                {/* Audio Action Area */}
                                <View className="mt-2 rounded-2xl bg-slate-900 p-4 shadow-lg shadow-slate-300">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <View className={`h-8 w-8 items-center justify-center rounded-full ${selectedRecord?.audioUri ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                                                <Ionicons
                                                    name={selectedRecord?.audioUri ? "mic" : "mic-off"}
                                                    size={16}
                                                    color={selectedRecord?.audioUri ? "#10b981" : "#94a3b8"}
                                                />
                                            </View>
                                            <Text className="ml-3 text-sm font-bold text-white">Voice Note Attachment</Text>
                                        </View>

                                        <Pressable
                                            onPress={() => playAudio(selectedRecord?.audioUri)}
                                            disabled={!selectedRecord?.audioUri}
                                            className={`flex-row items-center rounded-xl px-4 py-2 ${selectedRecord?.audioUri ? "bg-blue-600 active:bg-blue-700" : "bg-slate-800"
                                                }`}
                                        >
                                            <Ionicons
                                                name={isPlayingAudio ? "stop-circle" : "play-circle"}
                                                size={18}
                                                color="white"
                                            />
                                            <Text className="ml-2 text-xs font-black text-white">
                                                {selectedRecord?.audioUri ? (isPlayingAudio ? "Stop" : "Listen") : "N/A"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>

                                <Text className="mt-8 text-center text-[10px] font-bold uppercase tracking-[2px] text-slate-300">
                                    End of Record
                                </Text>
                            </ScrollView>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* Image preview modal */}
                <Modal
                    visible={imagePreviewVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setImagePreviewVisible(false)}
                >
                    <View className="flex-1 items-center justify-center bg-black/90 px-4">
                        <Pressable
                            onPress={() => setImagePreviewVisible(false)}
                            className="absolute right-5 top-12 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/20"
                        >
                            <Ionicons name="close" size={24} color="#ffffff" />
                        </Pressable>

                        {selectedPhotoUri ? (
                            <Image
                                source={{ uri: selectedPhotoUri }}
                                className="h-[78%] w-full rounded-2xl"
                                resizeMode="contain"
                            />
                        ) : null}
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}
