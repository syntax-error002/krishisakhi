import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Leaf, TrendingUp, AlertCircle, Calendar } from 'lucide-react-native';
import { theme } from '../../src/theme';

export default function CropRotationScreen() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Custom Header */}
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
                    <Text style={styles.seasonLabel}>Kharif 2025</Text>
                    <TextInput style={styles.input} placeholder="e.g. Rice" />
                </View>
                <View style={styles.seasonInput}>
                    <Text style={styles.seasonLabel}>Rabi 2024</Text>
                    <TextInput style={styles.input} placeholder="e.g. Wheat" />
                </View>
                <View style={styles.seasonInput}>
                    <Text style={styles.seasonLabel}>Kharif 2024</Text>
                    <TextInput style={styles.input} placeholder="e.g. Cotton" />
                </View>

                <TouchableOpacity style={styles.calcButton}>
                    <Text style={styles.calcButtonText}>Calculate Optimal Sequence</Text>
                </TouchableOpacity>
            </View>

            {/* AI Analysis Result */}
            <Text style={styles.sectionTitle}>Soil Health Analysis</Text>
            <View style={styles.analysisCard}>
                <View style={styles.analysisRow}>
                    <View style={[styles.indicator, { backgroundColor: '#FF5252' }]} />
                    <Text style={styles.analysisText}>Nitrogen Depletion: <Text style={{ fontWeight: '700', color: '#D32F2F' }}>Critical (40% lower)</Text></Text>
                </View>
                <View style={styles.analysisRow}>
                    <View style={[styles.indicator, { backgroundColor: '#FFEB3B' }]} />
                    <Text style={styles.analysisText}>Phosphorus Level: <Text style={{ fontWeight: '700', color: '#FBC02D' }}>Moderate</Text></Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Recommended 2-Year Plan</Text>

            <View style={styles.timelineCard}>
                <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.planGradient}>
                    <View style={styles.planHeader}>
                        <Calendar color={theme.colors.primary} size={20} />
                        <Text style={styles.planTitle}>Rabi 2026: Chickpeas (Chana)</Text>
                    </View>
                    <Text style={styles.planReason}>Reason: Legumes fix nitrogen in soil, repairing damage from continuous Rice-Wheat cycles.</Text>
                    <View style={styles.profitBadge}>
                        <TrendingUp size={16} color="#388E3C" />
                        <Text style={styles.profitText}> Expected Profit: +18% vs Wheat</Text>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.timelineCard}>
                <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.planGradient}>
                    <View style={styles.planHeader}>
                        <Calendar color="#F57C00" size={20} />
                        <Text style={[styles.planTitle, { color: '#E65100' }]}>Kharif 2026: Pearl Millet</Text>
                    </View>
                    <Text style={styles.planReason}>Reason: Requires less water; breaks disease cycles native to Rice cultivation.</Text>
                    <View style={styles.profitBadge}>
                        <TrendingUp size={16} color="#388E3C" />
                        <Text style={styles.profitText}> Expected Profit: +12% vs Rice</Text>
                    </View>
                </LinearGradient>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.surface, ...theme.shadows.sm },
    backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    inputCard: { margin: theme.spacing.lg, backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.xl, ...theme.shadows.sm },
    inputTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    inputDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
    seasonInput: { marginBottom: theme.spacing.md },
    seasonLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
    input: { backgroundColor: theme.colors.inputBackground, borderRadius: theme.borderRadius.md, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: theme.colors.text },
    calcButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: theme.spacing.md },
    calcButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700' },
    sectionTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: theme.colors.text, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, marginTop: theme.spacing.md },
    analysisCard: { backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.lg, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, ...theme.shadows.sm, marginBottom: theme.spacing.md },
    analysisRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    indicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    analysisText: { fontSize: 14, color: theme.colors.text },
    timelineCard: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, borderRadius: theme.borderRadius.lg, overflow: 'hidden', ...theme.shadows.sm },
    planGradient: { padding: theme.spacing.lg },
    planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    planTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.primaryDark, marginLeft: 8 },
    planReason: { fontSize: 14, color: '#333', lineHeight: 22, marginBottom: 16 },
    profitBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full },
    profitText: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
});
