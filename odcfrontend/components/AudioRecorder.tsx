import { Audio } from "expo-av";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
// Component props
type Props = {
    onRecordingComplete: (uri: string) => void;
    initialAudioUri?: string;
};

export default function AudioRecorder({
    onRecordingComplete,
    initialAudioUri = "",
}: Props) {

    // Recording state
    const [recording, setRecording] = useState<Audio.Recording | null>(null);

    // Saved audio URI
    const [recordedUri, setRecordedUri] = useState(initialAudioUri);

    // Audio play state
    const [isPlaying, setIsPlaying] = useState(false);

    // Start recording audio
    async function startRecording() {
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

    // Stop recording audio
    async function stopRecording() {
        try {
            if (!recording) return;

            await recording.stopAndUnloadAsync();

            const uri = recording.getURI();

            setRecording(null);

            if (uri) {
                setRecordedUri(uri);
                onRecordingComplete(uri);
            }
        } catch (error) {
            Alert.alert("Error", "Unable to stop recording.");
        }
    }

    // Play recorded audio
    async function playRecording() {
        try {
            if (!recordedUri) return;

            setIsPlaying(true);

            const { sound } = await Audio.Sound.createAsync({
                uri: recordedUri,
            });

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlaying(false);
                    sound.unloadAsync();
                }
            });

            await sound.playAsync();
        } catch (error) {
            setIsPlaying(false);
            Alert.alert("Error", "Unable to play recording.");
        }
    }

    // Remove recorded audio
    function removeRecording() {
        setRecordedUri("");
        onRecordingComplete("");
    }

    return (
        <View className="mb-5">
            <Text className="mb-2 text-sm font-bold text-gray-700">
                Audio Recording
            </Text>

            {/* Show record button if no audio exists */}
            {!recordedUri ? (
                <Pressable
                    onPress={recording ? stopRecording : startRecording}
                    className={`rounded-xl px-4 py-4 ${recording ? "bg-red-600" : "bg-blue-600"
                        }`}
                >
                    <Text className="text-center text-sm font-bold text-white">
                        {recording ? "Stop Recording" : "Start Recording"}
                    </Text>
                </Pressable>
            ) : (

                // Show audio actions after recording
                <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <Text className="mb-3 text-sm font-semibold text-gray-700">
                        Audio recorded successfully
                    </Text>

                    <View className="flex-row gap-3">
                        {/* Play button */}
                        <Pressable
                            onPress={playRecording}
                            className="flex-1 rounded-xl bg-green-600 px-4 py-3"
                        >
                            <Text className="text-center text-sm font-bold text-white">
                                {isPlaying ? "Playing..." : "Play"}
                            </Text>
                        </Pressable>

                        {/* Remove button */}
                        <Pressable
                            onPress={removeRecording}
                            className="flex-1 rounded-xl bg-red-600 px-4 py-3"
                        >
                            <Text className="text-center text-sm font-bold text-white">
                                Remove
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}