import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, Calendar, RefreshCcw, Leaf, Info } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

// ── Config: Use your deployed Render URL ────────────────────────────────────
const ROTATION_API = 'https://krishisakhi-n4zi.onrender.com';

interface RotationPlan {
  seasonName: string;
  crop: string;
  reason: string;
  fullReasons: string[];
  expectedProfitChangePercent: number;
  estimatedIncomePerAcre: number;
  soilImpact: string;
  waterNeed: string;
  score: number;
}

interface RotationResponse {
  soilSummary: string;
  nitrogenScore: number;
  phosphorusScore: number;
  potassiumScore: number;
  diseasePressureScore: number;
  rotationPlan: RotationPlan[];
}

export default function CropRotationScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [season1, setSeason1] = useState('Rice');
  const [season2, setSeason2] = useState('Wheat');
  const [season3, setSeason3] = useState('Cotton');
  const [isLoading, setIsLoading] = useState(false);
  const [rotationData, setRotationData] = useState<RotationResponse | null>(null);

  const farmSize = parseFloat(userProfile?.farmSize || '2');
  const location = userProfile?.location || 'Pune, MH';

  const calculateRotation = async () => {
    const crops = [season3, season2, season1].filter(Boolean); // oldest to newest
    if (crops.length < 1) {
      Alert.alert('Missing Info', 'Please enter at least 1 recent crop.');
      return;
    }

    setIsLoading(true);
    setRotationData(null);

    try {
      const res = await fetch(`${ROTATION_API}/api/rotation/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentSeasons: crops,
          farmSize,
          location,
          scenario: null,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: RotationResponse = await res.json();
      setRotationData(data);
    } catch (error: any) {
      console.error('Rotation API error:', error);
      Alert.alert(
        'Connection Error',
        'Could not reach the AI engine. Make sure the backend is running.\n\n' + error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Rotation AI</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Input Card */}
      <View style={styles.inputCard}>
        <View style={styles.inputCardHeader}>
          <Leaf color={theme.colors.primary} size={20} />
          <Text style={styles.inputTitle}>Your Recent Harvests</Text>
        </View>
        <Text style={styles.inputDesc}>
          Enter the crops you've grown recently — the AI will analyse your soil and recommend the optimal next sequence.
        </Text>

        <Text style={styles.seasonLabel}>Kharif 2023 (Oldest)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Cotton, Rice, Soybean"
          placeholderTextColor="#aaa"
          value={season3}
          onChangeText={setSeason3}
        />

        <Text style={styles.seasonLabel}>Rabi 2024</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Wheat, Chickpea, Mustard"
          placeholderTextColor="#aaa"
          value={season2}
          onChangeText={setSeason2}
        />

        <Text style={styles.seasonLabel}>Kharif 2024 (Most Recent)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rice, Maize, Pigeon Pea"
          placeholderTextColor="#aaa"
          value={season1}
          onChangeText={setSeason1}
        />

        <TouchableOpacity
          style={[styles.calcButton, isLoading && { opacity: 0.6 }]}
          onPress={calculateRotation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <>
              <RefreshCcw color={theme.colors.surface} size={18} style={{ marginRight: 8 }} />
              <Text style={styles.calcButtonText}>Run AI Rotation Engine</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {rotationData && (
        <>
          {/* Soil Analysis */}
          <Text style={styles.sectionTitle}>🧪 Soil Health Analysis</Text>
          <View style={styles.analysisCard}>
            {[
              { label: 'Nitrogen', value: rotationData.nitrogenScore, inverted: false },
              { label: 'Phosphorus', value: rotationData.phosphorusScore, inverted: false },
              { label: 'Potassium', value: rotationData.potassiumScore, inverted: false },
              { label: 'Disease Pressure', value: rotationData.diseasePressureScore, inverted: true },
            ].map(({ label, value, inverted }) => {
              const bad = inverted ? value > 60 : value < 40;
              const mid = inverted ? value > 40 : value < 70;
              const color = bad ? '#FF5252' : mid ? '#FFEB3B' : '#4CAF50';
              const status = bad ? (inverted ? 'High' : 'Critical') : mid ? 'Moderate' : inverted ? 'Low' : 'Good';

              return (
                <View key={label} style={styles.analysisRow}>
                  <View style={[styles.indicator, { backgroundColor: color }]} />
                  <Text style={styles.analysisText}>
                    {label}:{' '}
                    <Text style={{ fontWeight: '700', color }}>{status} ({value}%)</Text>
                  </Text>
                </View>
              );
            })}
            <Text style={styles.soilSummary}>{rotationData.soilSummary}</Text>
          </View>

          {/* 2-Year Rotation Plan */}
          <Text style={styles.sectionTitle}>🌱 AI-Recommended Rotation Plan</Text>
          {rotationData.rotationPlan.map((plan, index) => (
            <View key={index} style={styles.timelineCard}>
              <LinearGradient
                colors={index % 2 === 0 ? ['#E8F5E9', '#C8E6C9'] : ['#FFF3E0', '#FFE0B2']}
                style={styles.planGradient}
              >
                <View style={styles.planHeader}>
                  <Calendar color={theme.colors.primary} size={20} />
                  <Text style={styles.planTitle}>
                    {plan.seasonName}: {plan.crop}
                  </Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{plan.score}/100</Text>
                  </View>
                </View>

                {/* Primary reason */}
                <Text style={styles.planReason}>{plan.reason}</Text>

                {/* All reasons */}
                {plan.fullReasons.slice(1).map((r, i) => (
                  <View key={i} style={styles.reasonRow}>
                    <Info color="#5D8A00" size={12} style={{ marginTop: 1 }} />
                    <Text style={styles.reasonText}> {r}</Text>
                  </View>
                ))}

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statChip}>
                    <Text style={styles.statLabel}>Soil Impact</Text>
                    <Text style={styles.statValue}>{plan.soilImpact}</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statLabel}>Water Need</Text>
                    <Text style={[styles.statValue, { textTransform: 'capitalize' }]}>{plan.waterNeed}</Text>
                  </View>
                </View>

                <View style={styles.profitBadge}>
                  <TrendingUp size={16} color="#388E3C" />
                  <Text style={styles.profitText}>
                    {plan.expectedProfitChangePercent > 0 ? '+' : ''}{plan.expectedProfitChangePercent.toFixed(1)}% vs current pattern
                    {'  •  '}~₹{plan.estimatedIncomePerAcre.toLocaleString()}/acre
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
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
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },

  inputCard: {
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  inputCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  inputTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginLeft: 8 },
  inputDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg, lineHeight: 20 },
  seasonLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 4,
  },
  calcButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  calcButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700' },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  analysisCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.md,
  },
  analysisRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  indicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  analysisText: { fontSize: 14, color: theme.colors.text },
  soilSummary: {
    marginTop: 14,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    paddingTop: 12,
  },

  timelineCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  planGradient: { padding: theme.spacing.lg },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.primaryDark, marginLeft: 8, flex: 1 },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  planReason: { fontSize: 14, color: '#333', lineHeight: 22, marginBottom: 8 },
  reasonRow: { flexDirection: 'row', marginBottom: 4 },
  reasonText: { fontSize: 12, color: '#555', lineHeight: 18, flex: 1 },

  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    padding: 8,
    flex: 1,
  },
  statLabel: { fontSize: 10, color: '#666', fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 12, color: '#333', fontWeight: '700' },

  profitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  profitText: { fontSize: 13, fontWeight: '700', color: '#1B5E20', marginLeft: 6 },
});
