import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, ChevronRight, FileCheck, RefreshCcw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface MandiPrice {
  mandiName: string;
  minPrice: number;
  maxPrice: number;
  msp?: number;
  trend: 'up' | 'down' | 'stable';
}

interface BuyerListing {
  name: string;
  location: string;
  distanceKm: number;
  rating: number;
  lookingFor: string[];
  priceBand: string;
  notes: string;
}

interface MarketResponse {
  headline: string;
  mandiPrices: MandiPrice[];
  buyers: BuyerListing[];
}

export default function MarketScreen() {
  const { userProfile } = useAuth();
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('tomato');

  const location = userProfile?.location || 'Pune City';
  const mainCrop = userProfile?.mainCrops?.split(',')[0]?.trim() || 'tomato';

  useEffect(() => {
    fetchMarketData(mainCrop);
  }, [mainCrop]);

  const fetchMarketData = async (crop: string) => {
    setIsLoading(true);
    try {
      const data = await apiCall<MarketResponse>(API_ENDPOINTS.market, {
        method: 'POST',
        body: JSON.stringify({
          location: location,
          crop: crop,
          quantity: 500,
          unit: 'kg',
        }),
      });
      setMarketData(data);
    } catch (error: any) {
      console.error('Failed to fetch market data:', error);
      Alert.alert('Error', error.message || 'Failed to load market information.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBuyers = marketData?.buyers.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.location.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Direct Market</Text>
        <Text style={styles.subtitle}>
          {marketData?.headline || 'Sell directly to restaurants and kitchens. Zero middlemen.'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={theme.colors.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search buyers for ${selectedCrop}...`}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          onPress={() => fetchMarketData(selectedCrop)}
          style={styles.refreshButton}
          disabled={isLoading}
        >
          <RefreshCcw
            color={theme.colors.primary}
            size={20}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          />
        </TouchableOpacity>
      </View>

      {/* Mandi Prices Section */}
      {marketData?.mandiPrices && marketData.mandiPrices.length > 0 && (
        <View style={styles.mandiSection}>
          <Text style={styles.sectionTitle}>Mandi Prices</Text>
          {marketData.mandiPrices.map((mandi, index) => (
            <View key={index} style={styles.mandiCard}>
              <View style={styles.mandiHeader}>
                <Text style={styles.mandiName}>{mandi.mandiName}</Text>
                <View
                  style={[
                    styles.trendBadge,
                    {
                      backgroundColor:
                        mandi.trend === 'up'
                          ? '#E8F5E9'
                          : mandi.trend === 'down'
                          ? '#FFEBEE'
                          : '#FFF3E0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.trendText,
                      {
                        color:
                          mandi.trend === 'up'
                            ? '#388E3C'
                            : mandi.trend === 'down'
                            ? '#D32F2F'
                            : '#F57C00',
                      },
                    ]}
                  >
                    {mandi.trend === 'up' ? '↑' : mandi.trend === 'down' ? '↓' : '→'} {mandi.trend}
                  </Text>
                </View>
              </View>
              <Text style={styles.priceRange}>
                ₹{mandi.minPrice.toFixed(2)} - ₹{mandi.maxPrice.toFixed(2)} / kg
              </Text>
              {mandi.msp && (
                <Text style={styles.mspText}>MSP: ₹{mandi.msp.toFixed(2)} / kg</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.postHarvestCard}>
        <LinearGradient colors={['#FFF3E0', '#FFCC80']} style={styles.postHarvestGradient}>
          <View style={styles.postHarvestContent}>
            <Text style={styles.postHarvestTitle}>Post Your Harvest</Text>
            <Text style={styles.postHarvestDesc}>
              Tell buyers what you'll harvest next month and secure a digital contract today.
            </Text>
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading buyers...</Text>
        </View>
      ) : filteredBuyers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No buyers found matching your search.</Text>
        </View>
      ) : (
        filteredBuyers.map((buyer, index) => (
          <View key={index} style={styles.buyerCard}>
            <View style={styles.buyerHeader}>
              <View>
                <Text style={styles.buyerName}>{buyer.name}</Text>
                <View style={styles.buyerLocationRow}>
                  <MapPin color={theme.colors.textSecondary} size={14} />
                  <Text style={styles.buyerLocation}>
                    {' '}
                    {buyer.distanceKm.toFixed(1)} km away • {buyer.location}
                  </Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Star color="#FBC02D" size={14} fill="#FBC02D" />
                <Text style={styles.ratingText}> {buyer.rating.toFixed(1)}</Text>
              </View>
            </View>

            <View style={styles.requirementBox}>
              <Text style={styles.requirementTitle}>Looking for:</Text>
              <View style={styles.tagContainer}>
                {buyer.lookingFor.map((item, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {buyer.notes && (
              <Text style={styles.buyerNotes}>{buyer.notes}</Text>
            )}

            <View style={styles.buyerFooter}>
              <Text style={styles.priceOffer}>{buyer.priceBand}</Text>
              <TouchableOpacity style={styles.connectButton}>
                <FileCheck color={theme.colors.surface} size={16} />
                <Text style={styles.connectButtonText}> Send Proposal</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

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
  refreshButton: { padding: 4, marginLeft: 8 },
  mandiSection: { marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.md },
  mandiCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  mandiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mandiName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.borderRadius.sm },
  trendText: { fontSize: 12, fontWeight: '600' },
  priceRange: { fontSize: 18, fontWeight: '700', color: theme.colors.primary, marginBottom: 4 },
  mspText: { fontSize: 12, color: theme.colors.textSecondary },
  postHarvestCard: { marginBottom: theme.spacing.xl, ...theme.shadows.sm },
  postHarvestGradient: { borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg },
  postHarvestContent: { justifyContent: 'center' },
  postHarvestTitle: { fontSize: theme.typography.h3.fontSize, fontWeight: '700', color: '#E65100', marginBottom: 8 },
  postHarvestDesc: { fontSize: theme.typography.bodySecondary.fontSize, color: '#EF6C00', marginBottom: theme.spacing.md, lineHeight: 20 },
  postHarvestButton: { backgroundColor: '#F57C00', paddingVertical: 12, paddingHorizontal: 24, borderRadius: theme.borderRadius.full, alignSelf: 'flex-start' },
  postHarvestButtonText: { color: theme.colors.surface, fontWeight: '700', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  seeAllText: { color: theme.colors.primary, fontWeight: '600', fontSize: 14 },
  loadingContainer: { padding: theme.spacing.xl, alignItems: 'center' },
  loadingText: { marginTop: theme.spacing.md, color: theme.colors.textSecondary },
  emptyContainer: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary },
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
  buyerNotes: { fontSize: 12, color: theme.colors.textSecondary, fontStyle: 'italic', marginBottom: theme.spacing.sm },
  buyerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.background, paddingTop: theme.spacing.sm },
  priceOffer: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  connectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.borderRadius.full },
  connectButtonText: { color: theme.colors.surface, fontWeight: '600', fontSize: 14 },
});
