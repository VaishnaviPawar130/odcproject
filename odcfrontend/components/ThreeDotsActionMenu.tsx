

import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text } from "react-native";

// Props for action menu
type ThreeDotsActionMenuProps = {
    visible: boolean;
    onClose: () => void;
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function ThreeDotsActionMenu({
    visible,
    onClose,
    onView,
    onEdit,
    onDelete,
}: ThreeDotsActionMenuProps) {
    // Handle view action
    function handleView() {
        onClose();
        onView?.();
    }
    // Handle edit action
    function handleEdit() {
        onClose();
        onEdit?.();
    }
    // Handle delete action
    function handleDelete() {
        onClose();
        onDelete?.();
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Close menu on outside press */}
            <Pressable
                onPress={onClose}
                className="flex-1 justify-center bg-black/30 px-8"
            >
                {/* Menu card */}
                <Pressable className="rounded-3xl bg-white p-4 shadow-xl">
                    {/* Menu title */}
                    <Text
                        allowFontScaling={false}
                        numberOfLines={1}
                        className="mb-3 text-base font-bold text-gray-900"
                    >
                        Actions
                    </Text>
                    {/* View option */}
                    {onView && (
                        <Pressable
                            onPress={handleView}
                            className="flex-row items-center rounded-2xl px-4 py-4 active:bg-gray-100"
                        >
                            <Ionicons name="eye-outline" size={21} color="#2563EB" />

                            <Text
                                allowFontScaling={false}
                                numberOfLines={1}
                                className="ml-3 text-base font-semibold text-gray-800"
                            >
                                View
                            </Text>
                        </Pressable>
                    )}
                    {/* Edit option */}

                    {onEdit && (
                        <Pressable
                            onPress={handleEdit}
                            className="flex-row items-center rounded-2xl px-4 py-4 active:bg-gray-100"
                        >
                            <Ionicons name="create-outline" size={21} color="#16A34A" />

                            <Text
                                allowFontScaling={false}
                                numberOfLines={1}
                                className="ml-3 text-base font-semibold text-gray-800"
                            >
                                Edit
                            </Text>
                        </Pressable>
                    )}
                    {/* Delete option */}

                    {onDelete && (
                        <Pressable
                            onPress={handleDelete}
                            className="flex-row items-center rounded-2xl px-4 py-4 active:bg-red-50"
                        >
                            <Ionicons name="trash-outline" size={21} color="#DC2626" />

                            <Text
                                allowFontScaling={false}
                                numberOfLines={1}
                                className="ml-3 text-base font-semibold text-red-600"
                            >
                                Delete
                            </Text>
                        </Pressable>
                    )}
                    {/* Cancel button */}

                    <Pressable
                        onPress={onClose}
                        className="mt-2 rounded-2xl bg-gray-100 py-3 active:bg-gray-200"
                    >
                        <Text
                            allowFontScaling={false}
                            numberOfLines={1}
                            className="text-center text-sm font-bold text-gray-700"
                        >
                            Cancel
                        </Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}