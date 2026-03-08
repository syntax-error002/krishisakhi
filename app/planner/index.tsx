import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CloudRain, RefreshCcw, AlertTriangle } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { Picker } from '@react-native-picker/picker';

// Update this to your local machine's IP address if testing on a physical device
const API_URL = "http://127.0.0.1:8000/api/climate/simulate";

export default function PlannerScreen() {
    const [landSize, setLandSize] = useState('5');
    const [currentCrop, setCurrentCrop] = useState('wheat');
    const [scenario, setScenario] = useState('-30% Rainfall (Drought)');

    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const runSimulation = async () => {
        if (!landSize || !currentCrop) {
            Alert.alert("Missing Info", "Please provide land size and current crop.");
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setResults(null);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    landSize: parseFloat(landSize),
                    currentCrop: currentCrop,
                    scenario: scenario
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Connection Error", "Could not connect to the Krishi backend engine.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Climate Planner</Text>
                <Text style={styles.subtitle}>Simulate weather impacts on your yield & income powered by AI.</Text>
            </View>

            {/* Input Form */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Run "What If" Scenario</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Land Size (Acres)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5"
                        keyboardType="numeric"
                        value={landSize}
                        onChangeText={setLandSize}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Current Crop</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Wheat"
                        value={currentCrop}
                        onChangeText={setCurrentCrop}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Scenario</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={scenario}
                            onValueChange={(itemValue) => setScenario(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="-30% Rainfall (Drought)" value="-30% Rainfall (Drought)" />
                            <Picker.Item label="+40% Rainfall (Flood Risk)" value="+40% Rainfall (Flood Risk)" />
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity style={styles.simulateButton} onPress={runSimulation} disabled={isLoading}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                        style={styles.simulateGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={theme.colors.surface} />
                        ) : (
                            <>
                                <RefreshCcw color={theme.colors.surface} size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.simulateButtonText}>Run Simulation</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Dynamic Results Rendering */}
            {results && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.sectionTitle}>Simulation Results</Text>

                    <View style={styles.dangerCard}>
                        <View style={styles.dangerHeader}>
                            <AlertTriangle color={theme.colors.error} size={24} />
                            <Text style={styles.dangerTitle}>Impact Detected</Text>
                        </View>
                        <Text style={styles.dangerText}>
                            Based on local simulations, your yield is expected to drop to <Text style={{ fontWeight: '700' }}>{results.revisedYieldPercent}%</Text> of normal.
                            {"\n\n"}
                            Original Expected Income: <Text style={{ fontWeight: '700' }}>₹{results.originalExpectedIncome.toLocaleString()}</Text>
                            {"\n"}
                            Revised Simulated Income: <Text style={{ fontWeight: '700' }}>₹{results.revisedIncome.toLocaleString()}</Text>
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>AI Recommended Alternatives</Text>

                    {results.alternativeCrops.map((alt: any, index: number) => (
                        <View key={index} style={styles.altCropCard}>
                            <View style={styles.altCropInfo}>
                                <Text style={styles.altCropName}>{alt.name}</Text>
                                <Text style={styles.altCropDesc}>{alt.reason}</Text>
                                <View style={styles.badgeRow}>
                                    <View style={styles.resistanceBadge}>
                                        <Text style={styles.resistanceText}>{alt.resistance}</Text>
                                    </View>
                                    <Text style={styles.altCropProfit}>Est. Profit: ₹{alt.profitMargin.toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

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
    pickerContainer: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.inputBackground, overflow: 'hidden' },
    picker: { height: 50, width: '100%' },
    simulateButton: { marginTop: theme.spacing.sm, borderRadius: theme.borderRadius.md, overflow: 'hidden' },
    simulateGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    simulateButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '700' },
    resultsContainer: { animation: 'fadeIn 0.5s ease-in-out' },
    sectionTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.md },
    dangerCard: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
    dangerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    dangerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.error, marginLeft: 8 },
    dangerText: { fontSize: 14, color: '#C62828', lineHeight: 22 },
    altCropCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, flexDirection: 'column', ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border },
    altCropInfo: { flex: 1 },
    altCropName: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
    altCropDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 20 },
    badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resistanceBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    resistanceText: { color: '#1565C0', fontSize: 12, fontWeight: '600' },
    altCropProfit: { fontSize: 15, fontWeight: '800', color: theme.colors.success },
});
