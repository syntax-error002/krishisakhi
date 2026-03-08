import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Bot, User, RefreshCcw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface Message {
  id: number;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

interface ChatResponse {
  answer: string;
  quickTips: string[];
  followUpSuggestions: string[];
}

export default function ChatbotScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: 'Namaste! I am Krishi AI, your personal farming assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const mainCrop = userProfile?.mainCrops?.split(',')[0]?.trim() || undefined;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiCall<ChatResponse>(API_ENDPOINTS.chat, {
        method: 'POST',
        body: JSON.stringify({
          question: userMessage.text,
          crop: mainCrop,
          language: 'en',
        }),
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Add quick tips as separate messages if available
      if (response.quickTips && response.quickTips.length > 0) {
        const tipsMessage: Message = {
          id: Date.now() + 2,
          type: 'bot',
          text: `💡 Quick Tips:\n${response.quickTips.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, tipsMessage]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Krishi AI</Text>
          <Text style={styles.headerStatus}>
            {isLoading ? 'Thinking...' : 'Online • 24/7 Support'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageWrapper, msg.type === 'user' ? styles.messageUser : styles.messageBot]}
          >
            {msg.type === 'bot' && (
              <View style={styles.botAvatar}>
                <Bot color={theme.colors.surface} size={16} />
              </View>
            )}
            <View style={[styles.bubble, msg.type === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              <Text
                style={[styles.bubbleText, msg.type === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot]}
              >
                {msg.text}
              </Text>
            </View>
            {msg.type === 'user' && (
              <View style={styles.userAvatar}>
                <User color={theme.colors.surface} size={16} />
              </View>
            )}
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageWrapper, styles.messageBot]}>
            <View style={styles.botAvatar}>
              <Bot color={theme.colors.surface} size={16} />
            </View>
            <View style={[styles.bubble, styles.bubbleBot]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a farming question..."
          placeholderTextColor={theme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          <Send color={theme.colors.surface} size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
    zIndex: 10,
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
  headerTitleGroup: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  headerStatus: { fontSize: 12, color: theme.colors.success, marginTop: 2 },
  chatArea: { flex: 1, backgroundColor: '#F0F4F2' },
  messageWrapper: { flexDirection: 'row', marginBottom: theme.spacing.lg, alignItems: 'flex-end' },
  messageUser: { justifyContent: 'flex-end' },
  messageBot: { justifyContent: 'flex-start' },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  bubble: { maxWidth: '80%', padding: 16, borderRadius: 20 },
  bubbleUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, ...theme.shadows.sm },
  bubbleText: {},
  bubbleTextUser: { color: theme.colors.surface, fontSize: 15, lineHeight: 22 },
  bubbleTextBot: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
  inputArea: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    maxHeight: 100,
    fontSize: 16,
    color: theme.colors.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
