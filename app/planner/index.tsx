import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CloudRain, TrendingDown, RefreshCcw, AlertTriangle } from 'lucide-react-native';
import { theme } from '../../src/theme';

export default function PlannerScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Climate Planner</Text>
                <Text style={styles.subtitle}>Simulate weather impacts on your yield & income.</Text>
            </View>

            {/* Input Form */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Run "What If" Scenario</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Land Size (Acres)</Text>
                    <TextInput style={styles.input} placeholder="e.g. 5" keyboardType="numeric" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Current Crop</Text>
                    <TextInput style={styles.input} placeholder="e.g. Wheat" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Scenario</Text>
                    <View style={styles.scenarioSelector}>
                        <View style={styles.scenarioIcon}><CloudRain size={20} color={theme.colors.surface} /></View>
                        <Text style={styles.scenarioText}>-30% Rainfall (Drought)</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.simulateButton}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                        style={styles.simulateGradient}
                    >
                        <RefreshCcw color={theme.colors.surface} size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.simulateButtonText}>Run Simulation</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Simulation Results Placeholder */}
            <Text style={styles.sectionTitle}>Simulation Results</Text>

            <View style={styles.dangerCard}>
                <View style={styles.dangerHeader}>
                    <AlertTriangle color={theme.colors.error} size={24} />
                    <Text style={styles.dangerTitle}>High Risk Detected</Text>
                </View>
                <Text style={styles.dangerText}>
                    If rainfall is 30% below normal, your wheat yield is expected to drop by 45%, leading to an estimated income loss of <Text style={{ fontWeight: '700' }}>₹42,000</Text>.
                </Text>
            </View>

            {/* Alternative Crops */}
            <Text style={styles.sectionTitle}>Recommended Alternatives</Text>

            <View style={styles.altCropCard}>
                <View style={styles.altCropInfo}>
                    <Text style={styles.altCropName}>Sorghum (Jowar)</Text>
                    <Text style={styles.altCropDesc}>Highly drought resistant. Requires 40% less water than wheat.</Text>
                    <Text style={styles.altCropProfit}>Est. Profit: ₹55,000</Text>
                </View>
                <TouchableOpacity style={styles.switchButton}>
                    <Text style={styles.switchButtonText}>Switch Plan</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.altCropCard}>
                <View style={styles.altCropInfo}>
                    <Text style={styles.altCropName}>Pearl Millet (Bajra)</Text>
                    <Text style={styles.altCropDesc}>Matures quickly in dry conditions. High market demand.</Text>
                    <Text style={styles.altCropProfit}>Est. Profit: ₹48,000</Text>
                </View>
                <TouchableOpacity style={styles.switchButton}>
                    <Text style={styles.switchButtonText}>Switch Plan</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg },
    header: { marginTop: 60, marginBottom: theme.spacing.xl },
    title: { fontSize: theme.typography.h1.fontSize, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
    subtitle: { fontSize: theme.typography.body.fontSize, color: theme.colors.textSecondary, lineHeight: 24 },
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, marginBottom: theme.spacing.xl, ...theme.shadows.md },
    cardTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.lg },
    inputGroup: { marginBottom: theme.spacing.md },
    inputLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8 },
    input: { backgroundColor: theme.colors.inputBackground, paddingHorizontal: 16, paddingVertical: 12, borderRadius: theme.borderRadius.md, fontSize: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
    scenarioSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 12, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: '#FFE0B2' },
    scenarioIcon: { backgroundColor: '#F57C00', padding: 8, borderRadius: 8, marginRight: 12 },
    scenarioText: { fontSize: 16, fontWeight: '600', color: '#E65100' },
    simulateButton: { marginTop: theme.spacing.sm, borderRadius: theme.borderRadius.md, overflow: 'hidden' },
    simulateGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    simulateButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700' },
    sectionTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.md },
    dangerCard: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
    dangerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    dangerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.error, marginLeft: 8 },
    dangerText: { fontSize: 14, color: '#C62828', lineHeight: 22 },
    altCropCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border },
    altCropInfo: { flex: 1, marginRight: theme.spacing.md },
    altCropName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    altCropDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8, lineHeight: 18 },
    altCropProfit: { fontSize: 14, fontWeight: '700', color: theme.colors.success },
    switchButton: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.borderRadius.full },
    switchButtonText: { color: theme.colors.surface, fontWeight: '600', fontSize: 14 },
});
