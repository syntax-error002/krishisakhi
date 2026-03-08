import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, Keyboard, Modal, FlatList, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CloudRain, RefreshCcw, AlertTriangle, ChevronDown, Search, X, CheckCircle, Calendar, Check } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';

// ── Crop list ──────────────────────────────────────────────────────────────
const CROPS = [
    { key: 'wheat', label: 'Wheat', emoji: '🌾', season: 'Rabi' },
    { key: 'rice', label: 'Rice', emoji: '🍚', season: 'Kharif' },
    { key: 'maize', label: 'Maize (Corn)', emoji: '🌽', season: 'Both' },
    { key: 'soybean', label: 'Soybean', emoji: '🫘', season: 'Kharif' },
    { key: 'cotton', label: 'Cotton', emoji: '☁️', season: 'Kharif' },
    { key: 'sugarcane', label: 'Sugarcane', emoji: '🎋', season: 'Kharif' },
    { key: 'chickpea', label: 'Chickpea (Chana)', emoji: '🫛', season: 'Rabi' },
    { key: 'pigeon_pea', label: 'Pigeon Pea (Tur)', emoji: '🟤', season: 'Kharif' },
    { key: 'mustard', label: 'Mustard', emoji: '🌻', season: 'Rabi' },
    { key: 'groundnut', label: 'Groundnut', emoji: '🥜', season: 'Kharif' },
    { key: 'sorghum', label: 'Sorghum (Jowar)', emoji: '🌾', season: 'Kharif' },
    { key: 'pearl_millet', label: 'Pearl Millet (Bajra)', emoji: '🌿', season: 'Kharif' },
    { key: 'barley', label: 'Barley', emoji: '🌾', season: 'Rabi' },
    { key: 'tomato', label: 'Tomato', emoji: '🍅', season: 'Rabi' },
    { key: 'potato', label: 'Potato', emoji: '🥔', season: 'Rabi' },
    { key: 'onion', label: 'Onion', emoji: '🧅', season: 'Rabi' },
    { key: 'turmeric', label: 'Turmeric', emoji: '🟡', season: 'Kharif' },
];

// ── Scenario list ─────────────────────────────────────────────────────────
const SCENARIOS = [
    { key: 'drought_30', label: '-30% Rainfall (Moderate Drought)', icon: '☀️', type: 'drought', severity: 0.55 },
    { key: 'drought_50', label: '-50% Rainfall (Severe Drought)', icon: '🔥', type: 'drought', severity: 0.35 },
    { key: 'flood_40', label: '+40% Rainfall (Flood Risk)', icon: '🌧️', type: 'flood', severity: 0.60 },
    { key: 'flood_extreme', label: 'Extreme Flooding (Waterlogging)', icon: '🌊', type: 'flood', severity: 0.45 },
    { key: 'heatwave', label: 'Heatwave (+5°C Above Normal)', icon: '🌡️', type: 'heat', severity: 0.50 },
    { key: 'late_monsoon', label: 'Late Monsoon (2 Week Delay)', icon: '⏳', type: 'late_rain', severity: 0.65 },
    { key: 'early_frost', label: 'Early Frost (Rabi Season)', icon: '❄️', type: 'frost', severity: 0.55 },
    { key: 'pest', label: 'Pest Outbreak (Locust / Borer)', icon: '🦗', type: 'pest', severity: 0.50 },
];

// ── Crop simulation engine ─────────────────────────────────────────────────
function simulate(cropKey: string, scenarioKey: string, acres: number) {
    const cropDefaults: Record<string, { yield: number; price: number; waterSensitive?: boolean; heatSensitive?: boolean; frostSensitive?: boolean }> = {
        wheat: { yield: 1500, price: 25, heatSensitive: true, frostSensitive: false },
        rice: { yield: 2200, price: 22, waterSensitive: false },
        maize: { yield: 1800, price: 20 },
        soybean: { yield: 1000, price: 45, waterSensitive: true },
        cotton: { yield: 600, price: 65, waterSensitive: true },
        sugarcane: { yield: 30000, price: 3.5 },
        chickpea: { yield: 700, price: 55, waterSensitive: true },
        pigeon_pea: { yield: 800, price: 58 },
        mustard: { yield: 700, price: 50, heatSensitive: true },
        groundnut: { yield: 1000, price: 55, waterSensitive: true },
        sorghum: { yield: 900, price: 22 },
        pearl_millet: { yield: 800, price: 22 },
        barley: { yield: 1200, price: 20, heatSensitive: true },
        tomato: { yield: 6000, price: 18, waterSensitive: true, heatSensitive: true },
        potato: { yield: 8000, price: 12, frostSensitive: true },
        onion: { yield: 5000, price: 20, waterSensitive: true },
        turmeric: { yield: 3000, price: 70 },
    };

    const scenario = SCENARIOS.find(s => s.key === scenarioKey)!;
    const crop = cropDefaults[cropKey] || { yield: 2000, price: 25 };

    const base = crop.yield * crop.price * acres;
    let retainPct = scenario.severity;

    // Adjust based on crop traits
    if (scenario.type === 'drought') {
        if (cropKey === 'sorghum' || cropKey === 'pearl_millet' || cropKey === 'groundnut') retainPct += 0.20;
        if (cropKey === 'rice' || cropKey === 'sugarcane') retainPct -= 0.15;
    }
    if (scenario.type === 'flood') {
        if (cropKey === 'rice' || cropKey === 'sugarcane') retainPct += 0.20;
        if (cropKey === 'cotton' || cropKey === 'soybean' || cropKey === 'chickpea') retainPct -= 0.15;
    }
    if (scenario.type === 'heat' && crop.heatSensitive) retainPct -= 0.12;
    if (scenario.type === 'frost' && crop.frostSensitive) retainPct -= 0.15;
    if (scenario.type === 'pest') retainPct -= 0.08;

    retainPct = Math.max(0.1, Math.min(0.95, retainPct));
    const revised = base * retainPct;
    const lossPct = Math.round((1 - retainPct) * 100);

    // Alternatives based on scenario type
    const alternatives: Array<{ name: string; reason: string; resistance: string; profit: number }> = [];
    if (scenario.type === 'drought') {
        alternatives.push(
            { name: 'Pearl Millet (Bajra)', reason: 'Requires 60% less water than rice, deep root system.', resistance: '🌵 High Drought Resistance', profit: acres * 800 * 22 },
            { name: 'Sorghum (Jowar)', reason: 'Survives prolonged dry spells on sparse rainfall.', resistance: '🌵 High Drought Resistance', profit: acres * 900 * 22 },
        );
    } else if (scenario.type === 'flood') {
        alternatives.push(
            { name: 'Paddy (Swarna Sub1)', reason: 'Survives complete submergence for up to 2 weeks.', resistance: '🌊 Flood Tolerant Variety', profit: acres * 2000 * 22 },
            { name: 'Jute', reason: 'Thrives in waterlogged high-humidity conditions.', resistance: '🌊 Flood Tolerant', profit: acres * 1500 * 40 },
        );
    } else if (scenario.type === 'heat') {
        alternatives.push(
            { name: 'Cowpea', reason: 'Heat-tolerant legume, handles temperatures up to 45°C.', resistance: '🔥 Heat Tolerant', profit: acres * 700 * 48 },
            { name: 'Sorghum', reason: 'C4 photosynthesis — efficient even in high heat.', resistance: '🔥 Heat Tolerant', profit: acres * 900 * 22 },
        );
    } else if (scenario.type === 'frost') {
        alternatives.push(
            { name: 'Mustard', reason: 'Tolerates mild frost and short winters.', resistance: '❄️ Frost Hardy', profit: acres * 700 * 50 },
            { name: 'Spinach / Methi', reason: 'Cool-season crops that perform well under cold stress.', resistance: '❄️ Cold Season', profit: acres * 1500 * 30 },
        );
    } else if (scenario.type === 'pest') {
        alternatives.push(
            { name: 'Bitter Gourd', reason: 'Natural pest repellent compounds reduce infestation.', resistance: '🦗 Low Pest Attraction', profit: acres * 4000 * 20 },
            { name: 'Marigold (intercrop)', reason: 'Intercropping with marigold repels nematodes and borers.', resistance: '🌸 Companion Plant Shield', profit: acres * 300 * 80 },
        );
    } else {
        alternatives.push(
            { name: 'Chickpea', reason: 'Resilient legume, adaptable to late-start conditions.', resistance: '⏳ Delay Tolerant', profit: acres * 700 * 55 },
            { name: 'Mustard', reason: 'Short-duration 90-day crop, fits compressed schedule.', resistance: '⏳ Short Duration', profit: acres * 700 * 50 },
        );
    }

    return { base, revised, lossPct, retainPct: Math.round(retainPct * 100), alternatives };
}


// ── Searchable Crop Picker Modal ──────────────────────────────────────────
function CropPickerModal({
    visible, selectedKey, onSelect, onClose,
}: { visible: boolean; selectedKey: string; onSelect: (key: string) => void; onClose: () => void }) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() =>
        CROPS.filter(c => c.label.toLowerCase().includes(query.toLowerCase())), [query]
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={modal.overlay}>
                <View style={modal.sheet}>
                    {/* Handle */}
                    <View style={modal.handle} />
                    <Text style={modal.sheetTitle}>Select Crop</Text>

                    {/* Search */}
                    <View style={modal.searchRow}>
                        <Search color={theme.colors.textSecondary} size={16} style={{ marginRight: 8 }} />
                        <TextInput
                            style={modal.searchInput}
                            placeholder="Search crops…"
                            placeholderTextColor="#aaa"
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery('')}>
                                <X color="#aaa" size={16} />
                            </Pressable>
                        )}
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={item => item.key}
                        renderItem={({ item }) => (
                            <Pressable
                                style={[modal.cropRow, item.key === selectedKey && modal.cropRowSelected]}
                                onPress={() => { onSelect(item.key); onClose(); setQuery(''); }}
                            >
                                <Text style={modal.cropEmoji}>{item.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[modal.cropLabel, item.key === selectedKey && { color: theme.colors.primary }]}>
                                        {item.label}
                                    </Text>
                                    <Text style={modal.cropSeason}>{item.season} crop</Text>
                                </View>
                                {item.key === selectedKey && <CheckCircle color={theme.colors.primary} size={20} />}
                            </Pressable>
                        )}
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: 380 }}
                    />

                    <TouchableOpacity style={modal.closeBtn} onPress={() => { onClose(); setQuery(''); }}>
                        <Text style={modal.closeBtnText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const modal = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 14 },
    searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 15, color: theme.colors.text },
    cropRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, marginBottom: 2 },
    cropRowSelected: { backgroundColor: theme.colors.primary + '14' },
    cropEmoji: { fontSize: 24, marginRight: 12 },
    cropLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    cropSeason: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    closeBtn: { backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
    closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});


// ── Main Screen ───────────────────────────────────────────────────────────
export default function PlannerScreen() {
    const [landSize, setLandSize] = useState('5');
    const [selectedCropKey, setSelectedCropKey] = useState('wheat');
    const [selectedScenarioKey, setSelectedScenarioKey] = useState('drought_30');
    const [cropPickerVisible, setCropPickerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [isAccepting, setIsAccepting] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    const selectedCrop = CROPS.find(c => c.key === selectedCropKey)!;
    const selectedScenario = SCENARIOS.find(s => s.key === selectedScenarioKey)!;

    const runSimulation = () => {
        if (!landSize || isNaN(parseFloat(landSize))) {
            Alert.alert('Missing Info', 'Please enter a valid land size.');
            return;
        }
        Keyboard.dismiss();
        setIsLoading(true);
        setResults(null);
        setTimeout(() => {
            const res = simulate(selectedCropKey, selectedScenarioKey, parseFloat(landSize));
            setResults(res);
            setIsLoading(false);
        }, 1200);
    };

    const handleAcceptPlan = async (altName: string) => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to save your farming plan.');
            return;
        }

        setIsAccepting(altName);
        try {
            const taskTemplates = [
                { name: `Sow ${altName}`, daysOffset: 1, desc: 'Proper seed treatment and sowing in prepared soil.' },
                { name: 'Initial Irrigation', daysOffset: 3, desc: 'Light watering to aid germination.' },
                { name: 'First Fertilizer Dose', daysOffset: 25, desc: 'N-P-K application based on soil health card.' },
                { name: 'Weeding & Inter-culture', daysOffset: 45, desc: 'Remove weeds to prevent nutrient competition.' },
                { name: 'Pest Monitoring', daysOffset: 60, desc: 'Check for early signs of infestation.' },
                { name: `Harvest ${altName}`, daysOffset: 120, desc: 'Final crop harvesting at physiological maturity.' },
            ];

            const now = new Date();
            for (const template of taskTemplates) {
                const dueDate = new Date(now);
                dueDate.setDate(now.getDate() + template.daysOffset);

                await addDoc(collection(db, 'farming_tasks'), {
                    userId: user.uid,
                    cropName: altName,
                    taskName: template.name,
                    description: template.desc,
                    dueDate: dueDate,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                });
            }

            Alert.alert(
                'Plan Activated! 🎉',
                `A personalized farming calendar for ${altName} has been generated. Check your profile for details.`,
                [
                    { text: 'View Calendar', onPress: () => router.push('/calendar') },
                    { text: 'OK' }
                ]
            );
        } catch (error: any) {
            console.error('Accept plan error:', error);
            Alert.alert('Error', 'Failed to generate your calendar. Please try again.');
        } finally {
            setIsAccepting(null);
        }
    };

    return (
        <>
            <CropPickerModal
                visible={cropPickerVisible}
                selectedKey={selectedCropKey}
                onSelect={setSelectedCropKey}
                onClose={() => setCropPickerVisible(false)}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Climate Planner</Text>
                    <Text style={styles.subtitle}>Simulate "what if" climate scenarios and discover resilient alternatives.</Text>
                </View>

                {/* ── Input Card ─── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>⚙️ Run Scenario</Text>

                    {/* Land Size */}
                    <Text style={styles.label}>Land Size (Acres)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5"
                        keyboardType="numeric"
                        value={landSize}
                        onChangeText={setLandSize}
                        placeholderTextColor="#aaa"
                    />

                    {/* Crop picker */}
                    <Text style={styles.label}>Current Crop</Text>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setCropPickerVisible(true)}>
                        <Text style={styles.dropdownBtnEmoji}>{selectedCrop.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.dropdownBtnLabel}>{selectedCrop.label}</Text>
                            <Text style={styles.dropdownBtnSub}>{selectedCrop.season} crop</Text>
                        </View>
                        <ChevronDown color={theme.colors.textSecondary} size={20} />
                    </TouchableOpacity>

                    {/* Scenario grid */}
                    <Text style={styles.label}>Climate Scenario</Text>
                    <View style={styles.scenarioGrid}>
                        {SCENARIOS.map(s => (
                            <TouchableOpacity
                                key={s.key}
                                style={[styles.scenarioChip, selectedScenarioKey === s.key && styles.scenarioChipActive]}
                                onPress={() => setSelectedScenarioKey(s.key)}
                            >
                                <Text style={styles.scenarioIcon}>{s.icon}</Text>
                                <Text style={[styles.scenarioLabel, selectedScenarioKey === s.key && styles.scenarioLabelActive]}>
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Run button */}
                    <TouchableOpacity style={[styles.runBtn, isLoading && { opacity: 0.6 }]} onPress={runSimulation} disabled={isLoading}>
                        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.runGradient}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <RefreshCcw color="#fff" size={18} style={{ marginRight: 8 }} />
                                    <Text style={styles.runBtnText}>Run Simulation</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ── Results ─── */}
                {results && (
                    <View>
                        <Text style={styles.sectionTitle}>📊 Impact Report</Text>

                        <View style={styles.dangerCard}>
                            <View style={styles.dangerHeader}>
                                <AlertTriangle color={theme.colors.error} size={22} />
                                <Text style={styles.dangerTitle}>{results.lossPct}% Yield Loss Projected</Text>
                            </View>
                            <View style={styles.incomeRow}>
                                <View style={styles.incomeBox}>
                                    <Text style={styles.incomeLabel}>Expected Income</Text>
                                    <Text style={styles.incomeValue}>₹{results.base.toLocaleString()}</Text>
                                </View>
                                <View style={[styles.incomeBox, { backgroundColor: '#FFEBEE' }]}>
                                    <Text style={styles.incomeLabel}>Revised Income</Text>
                                    <Text style={[styles.incomeValue, { color: theme.colors.error }]}>₹{Math.round(results.revised).toLocaleString()}</Text>
                                </View>
                            </View>
                            <View style={styles.retainBar}>
                                <View style={[styles.retainFill, { width: `${results.retainPct}%` as any }]} />
                            </View>
                            <Text style={styles.retainLabel}>{results.retainPct}% income retained under this scenario</Text>
                        </View>

                        <Text style={styles.sectionTitle}>🌿 Resilient Alternatives</Text>
                        {results.alternatives.map((alt: any, i: number) => (
                            <View key={i} style={styles.altCard}>
                                <Text style={styles.altName}>{alt.name}</Text>
                                <Text style={styles.altDesc}>{alt.reason}</Text>
                                <View style={styles.altFooter}>
                                    <View style={styles.resistanceBadge}>
                                        <Text style={styles.resistanceText}>{alt.resistance}</Text>
                                    </View>
                                    <Text style={styles.altProfit}>₹{Math.round(alt.profit).toLocaleString()}</Text>
                                </View>
                                
                                <TouchableOpacity 
                                    style={[styles.acceptBtn, isAccepting === alt.name && { opacity: 0.7 }]}
                                    onPress={() => handleAcceptPlan(alt.name)}
                                    disabled={!!isAccepting}
                                >
                                    {isAccepting === alt.name ? (
                                        <ActivityIndicator color={theme.colors.primary} size="small" />
                                    ) : (
                                        <>
                                            <Calendar color={theme.colors.primary} size={16} style={{ marginRight: 6 }} />
                                            <Text style={styles.acceptBtnText}>Accept & Generate Calendar</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg },
    header: { marginTop: 60, marginBottom: theme.spacing.xl },
    title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },

    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, marginBottom: theme.spacing.xl, ...theme.shadows.md },
    cardTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.lg },
    label: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: theme.colors.inputBackground, borderRadius: theme.borderRadius.md, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },

    dropdownBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.inputBackground, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, paddingVertical: 12 },
    dropdownBtnEmoji: { fontSize: 22, marginRight: 12 },
    dropdownBtnLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    dropdownBtnSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },

    scenarioGrid: { gap: 8, marginBottom: 4 },
    scenarioChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.background, marginBottom: 6 },
    scenarioChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '12' },
    scenarioIcon: { fontSize: 18, marginRight: 10 },
    scenarioLabel: { fontSize: 13, color: theme.colors.text, fontWeight: '500', flex: 1 },
    scenarioLabelActive: { color: theme.colors.primary, fontWeight: '700' },

    runBtn: { marginTop: theme.spacing.md, borderRadius: theme.borderRadius.md, overflow: 'hidden' },
    runGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    runBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    sectionTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.md },
    dangerCard: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFCDD2', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
    dangerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    dangerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.error, marginLeft: 8 },

    incomeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    incomeBox: { flex: 1, backgroundColor: '#F1F8E9', borderRadius: 12, padding: 12 },
    incomeLabel: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600', marginBottom: 4 },
    incomeValue: { fontSize: 18, fontWeight: '800', color: '#2E7D32' },

    retainBar: { height: 8, backgroundColor: '#FFCDD2', borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
    retainFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
    retainLabel: { fontSize: 12, color: theme.colors.textSecondary, fontStyle: 'italic' },

    altCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border },
    altName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
    altDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12, lineHeight: 20 },
    altFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    resistanceBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    resistanceText: { color: '#1565C0', fontSize: 12, fontWeight: '600' },
    altProfit: { fontSize: 16, fontWeight: '800', color: theme.colors.success },
    acceptBtn: {
        marginTop: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary + '08',
    },
    acceptBtnText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});
