// import { Stack } from "expo-router";
// import { Platform, Text, TextInput } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import "../global.css";

// const appFontFamily = Platform.select({
//   android: "Roboto",
//   ios: "System",
//   default: undefined,
// });

// (Text as any).defaultProps = {
//   ...(Text as any).defaultProps,
//   allowFontScaling: false,
//   maxFontSizeMultiplier: 1,
//   style: [
//     (Text as any).defaultProps?.style,
//     appFontFamily ? { fontFamily: appFontFamily } : null,
//   ],
// };

// (TextInput as any).defaultProps = {
//   ...(TextInput as any).defaultProps,
//   allowFontScaling: false,
//   maxFontSizeMultiplier: 1,
//   style: [
//     (TextInput as any).defaultProps?.style,
//     appFontFamily ? { fontFamily: appFontFamily } : null,
//   ],
// };

// export default function RootLayout() {
//   return (
//     <SafeAreaProvider>
//       <Stack screenOptions={{ headerShown: false }} />
//     </SafeAreaProvider>
//   );
// }

import InternetStatus from "@/components/InternetStatus";
import { Stack } from "expo-router";
import { Platform, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

const appFontFamily = Platform.select({
  android: "Roboto",
  ios: "System",
  default: undefined,
});

(Text as any).defaultProps = {
  ...(Text as any).defaultProps,
  allowFontScaling: false,
  maxFontSizeMultiplier: 1,
  style: [
    (Text as any).defaultProps?.style,
    appFontFamily ? { fontFamily: appFontFamily } : null,
  ],
};

(TextInput as any).defaultProps = {
  ...(TextInput as any).defaultProps,
  allowFontScaling: false,
  maxFontSizeMultiplier: 1,
  style: [
    (TextInput as any).defaultProps?.style,
    appFontFamily ? { fontFamily: appFontFamily } : null,
  ],
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View className="flex-1">
        <InternetStatus />

        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaProvider>
  );
}