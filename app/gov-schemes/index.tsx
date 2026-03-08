import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, CheckCircle, Clock } from 'lucide-react-native';
import { theme } from '../../src/theme';

export default function GovSchemesScreen() {
    const router = useRouter();

    const schemes = [
        { name: 'PM-Kisan Samman Nidhi', desc: '₹6000/year income support for landholding farmers.', tag: 'Eligible', status: 'verified' },
        { name: 'Pradhan Mantri Fasal Bima', desc: 'Crop insurance scheme against natural calamities.', tag: 'Apply Now', status: 'pending' },
        { name: 'Kisan Credit Card (KCC)', desc: 'Short-term credit limits for agricultural expenses.', tag: 'Action Required', status: 'warning' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scheme Radar</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchBar}>
                <Search color={theme.colors.textSecondary} size={20} />
                <TextInput style={styles.searchInput} placeholder="Search subsidies..." />
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter color={theme.colors.surface} size={18} />
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Your Eligibility Profile</Text>
            <View style={styles.profileCard}>
                <Text style={styles.profileText}>Based on your profile (2 Acres, Pune, Wheat/Soybean), you are eligible for <Text style={{ fontWeight: '800', color: theme.colors.primary }}>6 Govt. Schemes</Text>.</Text>
            </View>

            <Text style={styles.sectionTitle}>Top Schemes for You</Text>

            {schemes.map((scheme, index) => (
                <View key={index} style={styles.schemeCard}>
                    <View style={styles.schemeHeader}>
                        <Text style={styles.schemeName}>{scheme.name}</Text>
                        {scheme.status === 'verified' && <CheckCircle color={theme.colors.success} size={20} />}
                        {scheme.status === 'pending' && <Clock color="#F57C00" size={20} />}
                        {scheme.status === 'warning' && <Clock color={theme.colors.error} size={20} />}
                    </View>
                    <Text style={styles.schemeDesc}>{scheme.desc}</Text>
                    <TouchableOpacity style={[styles.actionBtn, scheme.status === 'verified' ? { backgroundColor: theme.colors.background } : {}]}>
                        <Text style={[styles.actionBtnText, scheme.status === 'verified' ? { color: theme.colors.success } : {}]}>{scheme.tag}</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.surface, ...theme.shadows.sm },
    backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    searchBar: { margin: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, ...theme.shadows.sm },
    searchInput: { flex: 1, height: 40, paddingHorizontal: 12 },
    filterBtn: { backgroundColor: theme.colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
    profileCard: { marginHorizontal: theme.spacing.lg, backgroundColor: '#E8F5E9', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: '#C8E6C9' },
    profileText: { fontSize: 14, color: '#2E7D32', lineHeight: 22 },
    schemeCard: { marginHorizontal: theme.spacing.lg, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadows.sm },
    schemeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    schemeName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, flex: 1, marginRight: 8 },
    schemeDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 20 },
    actionBtn: { backgroundColor: theme.colors.primaryLight, paddingVertical: 10, borderRadius: theme.borderRadius.full, alignItems: 'center' },
    actionBtnText: { color: theme.colors.surface, fontWeight: '700', fontSize: 14 },
});
