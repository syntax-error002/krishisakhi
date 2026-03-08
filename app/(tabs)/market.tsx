import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, ChevronRight, FileCheck, RefreshCcw, PlusCircle } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface MandiPrice {
  id?: string;
  mandiName: string;
  minPrice: number;
  maxPrice: number;
  msp?: number;
  trend: 'up' | 'down' | 'stable';
}

interface BuyerListing {
  id?: string;
  name: string;
  location: string;
  distanceKm: number;
  rating: number;
  lookingFor: string[];
  priceBand: string;
  notes: string;
}

export default function MarketScreen() {
  const { userProfile } = useAuth();
  const [buyers, setBuyers] = useState<BuyerListing[]>([]);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postCrop, setPostCrop] = useState('');
  const [postQuantity, setPostQuantity] = useState('');
  const [postPrice, setPostPrice] = useState('');

  // Buy request state
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const location = userProfile?.location || 'Pune City';

  useEffect(() => {
    fetchMarketData();
  }, []);

  const seedMarketData = async () => {
    const defaultMandi: any[] = [
      { mandiName: 'Pune APMC', minPrice: 22, maxPrice: 28, msp: 20, trend: 'up' },
      { mandiName: 'Nashik APMC', minPrice: 20, maxPrice: 25, trend: 'stable' },
    ];

    const defaultBuyers: any[] = [
      {
        name: 'FreshFarm Grocers',
        location: 'Kothrud, Pune',
        distanceKm: 12.5,
        rating: 4.8,
        lookingFor: ['Tomato', 'Onion'],
        priceBand: '₹25-28/kg',
        notes: 'Looking for organic grade A tomatoes. Immediate payment.'
      },
      {
        name: 'Reliance Smart',
        location: 'Viman Nagar, Pune',
        distanceKm: 22.0,
        rating: 4.5,
        lookingFor: ['Potato', 'Tomato'],
        priceBand: '₹22-25/kg',
        notes: 'Need minimum 500kg per drop.'
      }
    ];

    try {
      for (const mandi of defaultMandi) {
        await addDoc(collection(db, 'mandi_prices'), mandi);
      }
      for (const buyer of defaultBuyers) {
        await addDoc(collection(db, 'market_listings'), buyer);
      }
    } catch (e) {
      console.log('Seeding error', e);
    }
  };

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const buyerSnap = await getDocs(collection(db, 'market_listings'));
      const mandiSnap = await getDocs(collection(db, 'mandi_prices'));

      if (buyerSnap.empty || mandiSnap.empty) {
        await seedMarketData();
        fetchMarketData(); // Re-fetch
        return;
      }

      const buyersData: BuyerListing[] = [];
      buyerSnap.forEach(doc => buyersData.push({ id: doc.id, ...doc.data() } as BuyerListing));
      buyersData.sort((a, b) => b.rating - a.rating); // Sort by rating
      setBuyers(buyersData);

      const mandiData: MandiPrice[] = [];
      mandiSnap.forEach(doc => mandiData.push({ id: doc.id, ...doc.data() } as MandiPrice));
      setMandiPrices(mandiData);
    } catch (error: any) {
      console.error('Failed to fetch market data:', error);
      Alert.alert('Error', error.message || 'Failed to load market information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!postCrop || !postQuantity || !postPrice) {
      Alert.alert('Error', 'Please fill in all details.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'market_listings'), {
        userId: userProfile?.uid || '',
        name: userProfile?.name || 'Local Farmer (Self)',
        location: location,
        distanceKm: 0.1,
        rating: 5.0,
        lookingFor: [postCrop],
        priceBand: `₹${postPrice}/kg`,
        notes: `Offering ${postQuantity}kg. Ready for immediate sale.`,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setPostCrop('');
      setPostQuantity('');
      setPostPrice('');
      fetchMarketData(); // Refresh list
      Alert.alert('Success', 'Your harvest listing is now active!');
    } catch (error: any) {
      console.error('Listing failed:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Send a crop buy request to a listing ──────────────────────────────────
  const handleSendBuyRequest = async (buyer: BuyerListing) => {
    if (buyingId) return; // prevent double-tap
    setBuyingId(buyer.id || buyer.name);
    try {
      const { user } = useAuth(); // Need to ensure we use the actual auth user
      await addDoc(collection(db, 'buy_requests'), {
        buyerName: buyer.name,
        buyerId: buyer.id || '',
        buyerLocation: buyer.location,
        cropsWanted: buyer.lookingFor,
        priceBand: buyer.priceBand,
        farmerName: userProfile?.name || 'Farmer',
        farmerId: user?.uid || '',
        farmerLocation: location,
        message: `${userProfile?.name || 'A farmer'} is interested in selling ${buyer.lookingFor.join(', ')} to you. Please contact them.`,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      Alert.alert(
        '✅ Request Sent!',
        `Your interest has been sent to ${buyer.name}. They will contact you soon.`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send buy request.');
    } finally {
      setBuyingId(null);
    }
  };

  const filteredBuyers = buyers.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.lookingFor.some(crop => crop.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Direct Market</Text>
          <Text style={styles.subtitle}>
            Sell directly to restaurants and kitchens. Zero middlemen.
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Search color={theme.colors.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search buyers or crops..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={fetchMarketData}
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
        {mandiPrices.length > 0 && (
          <View style={styles.mandiSection}>
            <Text style={styles.sectionTitle}>Mandi Prices</Text>
            {mandiPrices.map((mandi, index) => (
              <View key={mandi.id || index} style={styles.mandiCard}>
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
              <TouchableOpacity style={styles.postHarvestButton} onPress={() => setShowModal(true)}>
                <PlusCircle color={theme.colors.surface} size={16} />
                <Text style={styles.postHarvestButtonText}> Create Listing</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Matches for You</Text>
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
            <View key={buyer.id || index} style={styles.buyerCard}>
              <View style={styles.buyerHeader}>
                <View style={{ flex: 1 }}>
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
                <TouchableOpacity
                  style={[styles.connectButton, buyingId === (buyer.id || buyer.name) && { opacity: 0.6 }]}
                  onPress={() => handleSendBuyRequest(buyer)}
                  disabled={buyingId === (buyer.id || buyer.name)}
                >
                  {buyingId === (buyer.id || buyer.name) ? (
                    <ActivityIndicator color={theme.colors.surface} size="small" />
                  ) : (
                    <>
                      <FileCheck color={theme.colors.surface} size={16} />
                      <Text style={styles.connectButtonText}> Send Buy Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Listing Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Harvest Listing</Text>
            <Text style={styles.modalDesc}>Post your expected harvest directly to nearby buyers.</Text>

            <Text style={styles.inputLabel}>Crop Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tomato, Onion, Wheat"
              placeholderTextColor="#999"
              value={postCrop}
              onChangeText={setPostCrop}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Quantity (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 500"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={postQuantity}
                  onChangeText={setPostQuantity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Target Price/kg (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 25"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={postPrice}
                  onChangeText={setPostPrice}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)} disabled={isSubmitting}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateListing} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.surface} />
                ) : (
                  <Text style={styles.submitBtnText}>Post Listing</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ... styles remain mostly the same ...
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
  postHarvestButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F57C00', paddingVertical: 12, paddingHorizontal: 20, borderRadius: theme.borderRadius.full, alignSelf: 'flex-start' },
  postHarvestButtonText: { color: theme.colors.surface, fontWeight: '700', fontSize: 14, marginLeft: 6 },
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 16 },
  submitBtn: {
    backgroundColor: '#F57C00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.md,
    marginLeft: 12,
  },
  submitBtnText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16 },
});
