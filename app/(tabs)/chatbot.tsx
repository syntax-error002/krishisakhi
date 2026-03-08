import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

const GEMINI_API_KEY = 'AIzaSyAMBDkDMSIEAN8rHlLX5M27kE1cPKOM4FM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// ── System instruction injected at the start of every conversation ─────────
const SYSTEM_INSTRUCTION = `You are Krishi AI — the dedicated farming assistant inside the Krishi Sakhi app for Indian farmers.

STRICT RULES — follow without any exception:
1. You ONLY answer questions about: farming, agriculture, horticulture, animal husbandry, soil, crops, irrigation, pest/disease control, fertilisers, post-harvest, mandi prices, government farming schemes, weather impact on crops, and farm finance.
2. If the user asks ANYTHING outside these topics — including: your name, current time, programming languages (Java, Python, C++ etc.), movies, sports, jokes, general science, history, geography unrelated to farming — respond ONLY with this exact sentence, nothing more:
   "Mujhe sirf kheti-badi ke sawaalon ka jawab dene ke liye banaya gaya hai. Koi farming sawaal poochiye! 🌾"
3. Never reveal that you are powered by Google, Gemini, or any AI model. If asked, say only: "Main Krishi AI hoon — aapka kisan sahayak."
4. Do not introduce yourself unless the user directly asks who you are.

TOPICS YOU MUST HELP WITH:
- Crop selection, sowing dates, seed varieties, seed treatment
- Soil health: N-P-K, pH, organic matter, soil health card
- Irrigation: drip, sprinkler, flood, water scheduling
- Pest identification and safe pesticide advice
- Plant disease diagnosis and fungicide/biocontrol treatment
- Post-harvest: storage, drying, grading, cold chain
- Mandi prices, when to sell, eNAM, APMC, FPOs
- Crop rotation, intercropping, cover crops
- Climate impact on crops: drought, flood, frost, heatwave
- Govt. schemes: PM-KISAN, PMFBY, RKVY, Kisan Credit Card
- Organic and natural farming techniques
- Dairy, poultry, goat farming basics

TONE:
- Warm, simple, and patient — like a trusted local agronomist
- Hinglish is welcome (Hindi + English mix)
- Use numbered steps or bullet points for procedures
- When unsure, say: "Please apne nadzeeqi KVK (Krishi Vigyan Kendra) se verify karein."`;


interface Message {
  id: number;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

// Keeps the last N turns for context window
const MAX_HISTORY = 10;

export default function ChatbotScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: `Namaste! 🙏 Main hoon Krishi AI — aapka personal farming assistant.\n\nAap mujhse pooch sakte ho:\n• Crop selection & rotation\n• Soil health & nutrients\n• Pest & disease control\n• Govt. schemes & subsidies\n• Mandi prices & selling tips\n\nBataiye, main aapki kya madad kar sakta hoon?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const mainCrop = userProfile?.mainCrops?.split(',')[0]?.trim() || 'wheat';
  const location = userProfile?.location || 'India';

  // Conversation history for multi-turn context
  const historyRef = useRef<Array<{ role: string; parts: Array<{ text: string }> }>>([]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    const question = inputText.trim();
    if (!question || isLoading) return;

    const userMsg: Message = { id: Date.now(), type: 'user', text: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Add user turn to history
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', parts: [{ text: question }] },
    ].slice(-MAX_HISTORY);

    try {
      const body = {
        system_instruction: {
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nContext: The farmer's main crop is ${mainCrop} and they are located in ${location}.` }],
        },
        contents: historyRef.current,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      };

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || `HTTP ${res.status}`);
      }

      const reply = json.candidates?.[0]?.content?.parts?.[0]?.text
        ?? 'Sorry, I could not generate a response. Please try again.';

      // Add assistant turn to history
      historyRef.current = [
        ...historyRef.current,
        { role: 'model', parts: [{ text: reply }] },
      ].slice(-MAX_HISTORY);

      const botMsg: Message = { id: Date.now() + 1, type: 'bot', text: reply, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Gemini error:', err);
      const errMsg: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: '⚠️ Could not reach Krishi AI right now. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Krishi AI</Text>
          <Text style={styles.headerStatus}>{isLoading ? '🤔 Thinking…' : '🟢 Online • Powered by Gemini'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageWrapper, msg.type === 'user' ? styles.messageUser : styles.messageBot]}>
            {msg.type === 'bot' && (
              <View style={styles.botAvatar}>
                <Bot color="#fff" size={16} />
              </View>
            )}
            <View style={[styles.bubble, msg.type === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              <Text style={[styles.bubbleText, msg.type === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot]}>
                {msg.text}
              </Text>
            </View>
            {msg.type === 'user' && (
              <View style={styles.userAvatar}>
                <User color="#fff" size={16} />
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageWrapper, styles.messageBot]}>
            <View style={styles.botAvatar}>
              <Bot color="#fff" size={16} />
            </View>
            <View style={[styles.bubble, styles.bubbleBot, { paddingVertical: 16 }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask anything about farming…"
          placeholderTextColor={theme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (isLoading || !inputText.trim()) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          <Send color="#fff" size={20} />
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
  headerStatus: { fontSize: 11, color: theme.colors.success, marginTop: 2 },
  chatArea: { flex: 1, backgroundColor: '#F0F4F2' },
  messageWrapper: { flexDirection: 'row', marginBottom: theme.spacing.lg, alignItems: 'flex-end' },
  messageUser: { justifyContent: 'flex-end' },
  messageBot: { justifyContent: 'flex-start' },
  botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primaryDark, justifyContent: 'center', alignItems: 'center', marginLeft: 8, marginBottom: 4 },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  bubbleUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, ...theme.shadows.sm },
  bubbleText: {},
  bubbleTextUser: { color: '#fff', fontSize: 15, lineHeight: 22 },
  bubbleTextBot: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
  inputArea: { flexDirection: 'row', padding: theme.spacing.md, backgroundColor: theme.colors.surface, alignItems: 'center', ...theme.shadows.md },
  textInput: { flex: 1, backgroundColor: theme.colors.background, borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontSize: 15, color: theme.colors.text },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendButtonDisabled: { opacity: 0.4 },
});
