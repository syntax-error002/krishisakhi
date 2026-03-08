import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Leaf, TrendingUp, AlertCircle, Calendar, RefreshCcw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface RotationPlan {
  seasonName: string;
  crop: string;
  reason: string;
  expectedProfitChangePercent: number;
  soilImpact: string;
}

interface RotationResponse {
  soilSummary: string;
  nitrogenScore: number;
  phosphorusScore: number;
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

  const location = userProfile?.location || 'Pune, MH';
  const farmSize = parseFloat(userProfile?.farmSize || '5');

  const calculateRotation = async () => {
    if (!season1 || !season2) {
      Alert.alert('Missing Info', 'Please provide at least 2 recent seasons.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiCall<RotationResponse>(API_ENDPOINTS.cropRotation, {
        method: 'POST',
        body: JSON.stringify({
          location: location,
          farmSize: farmSize,
          recentSeasons: [
            { seasonName: 'Kharif 2024', crop: season1 },
            { seasonName: 'Rabi 2024', crop: season2 },
            ...(season3 ? [{ seasonName: 'Kharif 2023', crop: season3 }] : []),
          ],
          soilConcern: null,
        }),
      });
      setRotationData(data);
    } catch (error: any) {
      console.error('Rotation calculation failed:', error);
      Alert.alert('Error', error.message || 'Failed to calculate rotation plan.');
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

      <View style={styles.inputCard}>
        <Text style={styles.inputTitle}>Your Recent Harvests</Text>
        <Text style={styles.inputDesc}>Tell us what you grew for the last 3 seasons.</Text>

        <View style={styles.seasonInput}>
          <Text style={styles.seasonLabel}>Kharif 2024</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rice"
            value={season1}
            onChangeText={setSeason1}
          />
        </View>
        <View style={styles.seasonInput}>
          <Text style={styles.seasonLabel}>Rabi 2024</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Wheat"
            value={season2}
            onChangeText={setSeason2}
          />
        </View>
        <View style={styles.seasonInput}>
          <Text style={styles.seasonLabel}>Kharif 2023</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Cotton (optional)"
            value={season3}
            onChangeText={setSeason3}
          />
        </View>

        <TouchableOpacity
          style={styles.calcButton}
          onPress={calculateRotation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <>
              <RefreshCcw color={theme.colors.surface} size={18} style={{ marginRight: 8 }} />
              <Text style={styles.calcButtonText}>Calculate Optimal Sequence</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* AI Analysis Result */}
      {rotationData && (
        <>
          <Text style={styles.sectionTitle}>Soil Health Analysis</Text>
          <View style={styles.analysisCard}>
            <View style={styles.analysisRow}>
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      rotationData.nitrogenScore < 40
                        ? '#FF5252'
                        : rotationData.nitrogenScore < 70
                        ? '#FFEB3B'
                        : '#4CAF50',
                  },
                ]}
              />
              <Text style={styles.analysisText}>
                Nitrogen Level:{' '}
                <Text style={{ fontWeight: '700', color: '#D32F2F' }}>
                  {rotationData.nitrogenScore < 40
                    ? 'Critical'
                    : rotationData.nitrogenScore < 70
                    ? 'Moderate'
                    : 'Good'}{' '}
                  ({rotationData.nitrogenScore}%)
                </Text>
              </Text>
            </View>
            <View style={styles.analysisRow}>
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      rotationData.phosphorusScore < 40
                        ? '#FF5252'
                        : rotationData.phosphorusScore < 70
                        ? '#FFEB3B'
                        : '#4CAF50',
                  },
                ]}
              />
              <Text style={styles.analysisText}>
                Phosphorus Level:{' '}
                <Text style={{ fontWeight: '700', color: '#FBC02D' }}>
                  {rotationData.phosphorusScore < 40
                    ? 'Low'
                    : rotationData.phosphorusScore < 70
                    ? 'Moderate'
                    : 'Good'}{' '}
                  ({rotationData.phosphorusScore}%)
                </Text>
              </Text>
            </View>
            <View style={styles.analysisRow}>
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      rotationData.diseasePressureScore > 60
                        ? '#FF5252'
                        : rotationData.diseasePressureScore > 40
                        ? '#FFEB3B'
                        : '#4CAF50',
                  },
                ]}
              />
              <Text style={styles.analysisText}>
                Disease Pressure:{' '}
                <Text style={{ fontWeight: '700' }}>
                  {rotationData.diseasePressureScore > 60
                    ? 'High'
                    : rotationData.diseasePressureScore > 40
                    ? 'Moderate'
                    : 'Low'}{' '}
                  ({rotationData.diseasePressureScore}%)
                </Text>
              </Text>
            </View>
            <Text style={[styles.analysisText, { marginTop: 12, fontStyle: 'italic' }]}>
              {rotationData.soilSummary}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Recommended 2-Year Plan</Text>

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
                </View>
                <Text style={styles.planReason}>{plan.reason}</Text>
                <Text style={[styles.planReason, { marginTop: 8, fontSize: 13 }]}>
                  Soil Impact: {plan.soilImpact}
                </Text>
                <View style={styles.profitBadge}>
                  <TrendingUp size={16} color="#388E3C" />
                  <Text style={styles.profitText}>
                    Expected Profit: {plan.expectedProfitChangePercent > 0 ? '+' : ''}
                    {plan.expectedProfitChangePercent.toFixed(1)}% vs Current Pattern
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
  inputTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  inputDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  seasonInput: { marginBottom: theme.spacing.md },
  seasonLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontSize: theme.typography.h3.fontSize,
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
  analysisRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  indicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  analysisText: { fontSize: 14, color: theme.colors.text },
  timelineCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  planGradient: { padding: theme.spacing.lg },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.primaryDark, marginLeft: 8 },
  planReason: { fontSize: 14, color: '#333', lineHeight: 22, marginBottom: 16 },
  profitBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  profitText: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
});
