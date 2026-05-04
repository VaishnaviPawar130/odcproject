
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
// Table column type
export type AppTableColumn<T> = {
    key: string;
    title: string;
    width?: number;
    flex?: number;
    align?: "left" | "center" | "right";
    render: (item: T, index: number) => ReactNode;
};
// Table props type
type AppTableProps<T> = {
    columns: AppTableColumn<T>[];
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    onActionPress?: (item: T) => void;
    emptyText?: string;

    scrollBody?: boolean;
    maxBodyHeight?: number;
};

export default function AppTable<T>({
    columns,
    data,
    keyExtractor,
    onActionPress,
    emptyText = "No records found",
    scrollBody = false,
    maxBodyHeight = 260,
}: AppTableProps<T>) {

    // Render table rows
    function renderRows() {
        if (data.length === 0) {
            return (
                <View className="items-center justify-center px-4 py-8">
                    <Text
                        allowFontScaling={false}
                        numberOfLines={1}
                        className="text-sm font-semibold text-gray-400"
                    >
                        {emptyText}
                    </Text>
                </View>
            );
        }

        return data.map((item, index) => (
            <View
                key={keyExtractor(item, index)}
                className={
                    index === data.length - 1
                        ? "flex-row items-center px-4"
                        : "flex-row items-center border-b border-gray-100 px-4"
                }
                style={{ minHeight: 56 }}
            >
                {/* Row columns */}

                {columns.map((column) => (
                    <View
                        key={column.key}
                        style={{
                            width: column.width,
                            flex: column.flex,
                            alignItems:
                                column.align === "center"
                                    ? "center"
                                    : column.align === "right"
                                        ? "flex-end"
                                        : "flex-start",
                        }}
                    >
                        {column.render(item, index)}
                    </View>
                ))}

                {/* Row action button */}
                {onActionPress && (
                    <Pressable
                        onPress={() => onActionPress(item)}
                        className="w-10 items-end"
                    >
                        <Ionicons
                            name="ellipsis-vertical"
                            size={20}
                            color="#9CA3AF"
                        />
                    </Pressable>
                )}
            </View>
        ));
    }

    return (
        <View className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            {/* Fixed Header */}
            <View
                className="flex-row items-center bg-gray-100 px-4"
                style={{ height: 44 }}
            >
                {/* Header columns */}
                {columns.map((column) => (
                    <Text
                        key={column.key}
                        allowFontScaling={false}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className={`text-xs font-bold uppercase text-gray-500 ${column.align === "center"
                            ? "text-center"
                            : column.align === "right"
                                ? "text-right"
                                : "text-left"
                            }`}
                        style={{
                            width: column.width,
                            flex: column.flex,
                        }}
                    >
                        {column.title}
                    </Text>
                ))}

                {/* Header action column */}
                {onActionPress && (
                    <Text
                        allowFontScaling={false}
                        numberOfLines={1}
                        className="w-10 text-right text-xs font-bold uppercase text-gray-500"
                    >
                        Act
                    </Text>
                )}
            </View>

            {/* Only Data Scrolls */}
            {scrollBody ? (
                <ScrollView
                    style={{ maxHeight: maxBodyHeight }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled
                >
                    {renderRows()}
                </ScrollView>
            ) : (
                <View>{renderRows()}</View>
            )}
        </View>
    );
}