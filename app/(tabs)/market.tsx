import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, ChevronRight, FileCheck } from 'lucide-react-native';
import { theme } from '../../src/theme';

export default function MarketScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Direct Market</Text>
                <Text style={styles.subtitle}>Sell directly to restaurants and kitchens. Zero middlemen.</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search color={theme.colors.textSecondary} size={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search buyers for tomatoes, wheat..."
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View style={styles.postHarvestCard}>
                <LinearGradient
                    colors={['#FFF3E0', '#FFCC80']}
                    style={styles.postHarvestGradient}
                >
                    <View style={styles.postHarvestContent}>
                        <Text style={styles.postHarvestTitle}>Post Your Harvest</Text>
                        <Text style={styles.postHarvestDesc}>Tell buyers what you'll harvest next month and secure a digital contract today.</Text>
                        <TouchableOpacity style={styles.postHarvestButton}>
                            <Text style={styles.postHarvestButtonText}>Create Listing</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Matches for You</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Buyer Card 1 */}
            <View style={styles.buyerCard}>
                <View style={styles.buyerHeader}>
                    <View>
                        <Text style={styles.buyerName}>Green Leaf Cloud Kitchen</Text>
                        <View style={styles.buyerLocationRow}>
                            <MapPin color={theme.colors.textSecondary} size={14} />
                            <Text style={styles.buyerLocation}> 12 km away • Pune City</Text>
                        </View>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Star color="#FBC02D" size={14} fill="#FBC02D" />
                        <Text style={styles.ratingText}> 4.8</Text>
                    </View>
                </View>

                <View style={styles.requirementBox}>
                    <Text style={styles.requirementTitle}>Looking for:</Text>
                    <View style={styles.tagContainer}>
                        <View style={styles.tag}><Text style={styles.tagText}>Tomatoes (Grade A)</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>Onions</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>500 kg / week</Text></View>
                    </View>
                </View>

                <View style={styles.buyerFooter}>
                    <Text style={styles.priceOffer}>₹28 - ₹32 / kg</Text>
                    <TouchableOpacity style={styles.connectButton}>
                        <FileCheck color={theme.colors.surface} size={16} />
                        <Text style={styles.connectButtonText}> Send Proposal</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Buyer Card 2 */}
            <View style={styles.buyerCard}>
                <View style={styles.buyerHeader}>
                    <View>
                        <Text style={styles.buyerName}>Sunshine Mid-day Meals</Text>
                        <View style={styles.buyerLocationRow}>
                            <MapPin color={theme.colors.textSecondary} size={14} />
                            <Text style={styles.buyerLocation}> 8 km away • School District</Text>
                        </View>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Star color="#FBC02D" size={14} fill="#FBC02D" />
                        <Text style={styles.ratingText}> 4.9</Text>
                    </View>
                </View>

                <View style={styles.requirementBox}>
                    <Text style={styles.requirementTitle}>Looking for:</Text>
                    <View style={styles.tagContainer}>
                        <View style={styles.tag}><Text style={styles.tagText}>Wheat</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>Rice</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>2 Tons / month</Text></View>
                    </View>
                </View>

                <View style={styles.buyerFooter}>
                    <Text style={styles.priceOffer}>Govt. MSP + 5%</Text>
                    <TouchableOpacity style={styles.connectButton}>
                        <FileCheck color={theme.colors.surface} size={16} />
                        <Text style={styles.connectButtonText}> Send Proposal</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.lg },
    header: { marginTop: 60, marginBottom: theme.spacing.lg },
    title: { fontSize: theme.typography.h1.fontSize, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
    subtitle: { fontSize: theme.typography.body.fontSize, color: theme.colors.textSecondary, lineHeight: 24 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.full,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: 12,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 16, color: theme.colors.text },
    postHarvestCard: { marginBottom: theme.spacing.xl, ...theme.shadows.sm },
    postHarvestGradient: { borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg },
    postHarvestContent: { justifyContent: 'center' },
    postHarvestTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: '#E65100', marginBottom: 8 },
    postHarvestDesc: { fontSize: theme.typography.bodySecondary.fontSize, color: '#EF6C00', marginBottom: theme.spacing.md, lineHeight: 20 },
    postHarvestButton: { backgroundColor: '#F57C00', paddingVertical: 12, paddingHorizontal: 24, borderRadius: theme.borderRadius.full, alignSelf: 'flex-start' },
    postHarvestButtonText: { color: theme.colors.surface, fontWeight: '700', fontSize: 14 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    sectionTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: theme.colors.text },
    seeAllText: { color: theme.colors.primary, fontWeight: '600', fontSize: 14 },
    buyerCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadows.sm },
    buyerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
    buyerName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    buyerLocationRow: { flexDirection: 'row', alignItems: 'center' },
    buyerLocation: { fontSize: 12, color: theme.colors.textSecondary },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.borderRadius.sm },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#F57C00' },
    requirementBox: { backgroundColor: theme.colors.inputBackground, padding: theme.spacing.sm, borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.md },
    requirementTitle: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8, fontWeight: '600' },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { backgroundColor: theme.colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border },
    tagText: { fontSize: 12, color: theme.colors.primary, fontWeight: '500' },
    buyerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.background, paddingTop: theme.spacing.sm },
    priceOffer: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    connectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.borderRadius.full },
    connectButtonText: { color: theme.colors.surface, fontWeight: '600', fontSize: 14 },
});
