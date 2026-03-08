import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';
import { theme } from '../../src/theme';

export default function ChatbotScreen() {
    const router = useRouter();

    const messages = [
        { id: 1, type: 'bot', text: 'Namaste Ramesh! I am Krishi AI, your personal farming assistant. How can I help you today?' },
        { id: 2, type: 'user', text: 'My tomatoes have black spots on the bottom. What should I do?' },
        { id: 3, type: 'bot', text: 'That sounds like Blossom End Rot, caused by calcium deficiency and uneven watering. Try applying a calcium spray and ensure consistent soil moisture. Would you like me to show a scan option to confirm?' },
    ];

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleGroup}>
                    <Text style={styles.headerTitle}>Krishi AI</Text>
                    <Text style={styles.headerStatus}>Online • 24/7 Support</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: theme.spacing.lg }}>
                {messages.map((msg) => (
                    <View key={msg.id} style={[styles.messageWrapper, msg.type === 'user' ? styles.messageUser : styles.messageBot]}>
                        {msg.type === 'bot' && (
                            <View style={styles.botAvatar}>
                                <Bot color={theme.colors.surface} size={16} />
                            </View>
                        )}
                        <View style={[styles.bubble, msg.type === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                            <Text style={[styles.bubbleText, msg.type === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot]}>
                                {msg.text}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Ask a farming question..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Send color={theme.colors.surface} size={20} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.surface, ...theme.shadows.sm, zIndex: 10 },
    backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
    headerTitleGroup: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
    headerStatus: { fontSize: 12, color: theme.colors.success, marginTop: 2 },
    chatArea: { flex: 1, backgroundColor: '#F0F4F2' },
    messageWrapper: { flexDirection: 'row', marginBottom: theme.spacing.lg, alignItems: 'flex-end' },
    messageUser: { justifyContent: 'flex-end' },
    messageBot: { justifyContent: 'flex-start' },
    botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
    bubble: { maxWidth: '80%', padding: 16, borderRadius: 20 },
    bubbleUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
    bubbleBot: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, ...theme.shadows.sm },
    bubbleText: {},
    bubbleTextUser: { color: theme.colors.surface, fontSize: 15, lineHeight: 22 },
    bubbleTextBot: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
    inputArea: { flexDirection: 'row', padding: theme.spacing.md, backgroundColor: theme.colors.surface, alignItems: 'center', ...theme.shadows.md },
    textInput: { flex: 1, backgroundColor: theme.colors.background, borderRadius: 24, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, maxHeight: 100, fontSize: 16, color: theme.colors.text },
    sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
});
