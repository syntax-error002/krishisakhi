import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, CheckCircle, Clock, RefreshCcw, ExternalLink, BookOpen, X } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface GovScheme {
  id?: string;
  name: string;
  description: string;
  tag: string;
  status: 'eligible' | 'pending' | 'warning';
  estimatedBenefitPerYear: number;
  priorityRank: number;
  link?: string;
  requiredDocuments: string[];
}

export default function GovSchemesScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Expert booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingScheme, setBookingScheme] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingPhone, setBookingPhone] = useState(userProfile?.phone || '');
  const [isBooking, setIsBooking] = useState(false);

  const location = userProfile?.location || 'Pune, MH';
  const farmSize = parseFloat(userProfile?.farmSize || '2');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const seedSchemes = async () => {
    const defaultSchemes: any[] = [
      {
        name: 'PM-Kisan Samman Nidhi',
        description: 'Direct income support of ₹6,000 per year for all landholding farmers across India.',
        tag: 'Income Support',
        status: 'eligible',
        estimatedBenefitPerYear: 6000,
        priorityRank: 1,
        link: 'https://pmkisan.gov.in',
        requiredDocuments: ['Aadhar Card', 'Bank Account', 'Land Record'],
      },
      {
        name: 'Pradhan Mantri Fasal Bima Yojana',
        description: 'Crop insurance scheme mitigating risk of crop failure due to natural calamities, pests and diseases.',
        tag: 'Insurance',
        status: 'pending',
        estimatedBenefitPerYear: 15000,
        priorityRank: 2,
        link: 'https://pmfby.gov.in',
        requiredDocuments: ['Aadhar Card', 'Sowing Certificate'],
      },
      {
        name: 'Soil Health Card Scheme',
        description: 'Provides information on soil nutrient status and recommendations on dosage of nutrients for farms.',
        tag: 'Soil Health',
        status: 'warning',
        estimatedBenefitPerYear: 2000,
        priorityRank: 3,
        link: 'https://soilhealth.dac.gov.in',
        requiredDocuments: ['Land Record'],
      },
      {
        name: 'Kisan Credit Card (KCC)',
        description: 'Short-term credit for farmers to meet agricultural and allied activities needs at subsidised interest rates.',
        tag: 'Credit & Loan',
        status: 'eligible',
        estimatedBenefitPerYear: 30000,
        priorityRank: 4,
        link: 'https://www.nabard.org/content1.aspx?id=572',
        requiredDocuments: ['Aadhar Card', 'Land Record', 'Bank Passbook'],
      },
      {
        name: 'PM Krishi Sinchai Yojana',
        description: 'Irrigation scheme providing water to every farm and improving water use efficiency (Har Khet Ko Pani).',
        tag: 'Irrigation',
        status: 'eligible',
        estimatedBenefitPerYear: 20000,
        priorityRank: 5,
        link: 'https://pmksy.gov.in',
        requiredDocuments: ['Aadhar Card', 'Land Record'],
      },
    ];

    try {
      for (const scheme of defaultSchemes) {
        await addDoc(collection(db, 'gov_schemes'), scheme);
      }
    } catch (e) {
      console.log('Seeding error', e);
    }
  };

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'gov_schemes'));
      if (snapshot.empty) {
        await seedSchemes();
        fetchSchemes();
        return;
      }
      
      const data: GovScheme[] = [];
      const defaultLinks: Record<string, string> = {
        'PM-Kisan Samman Nidhi': 'https://pmkisan.gov.in',
        'Pradhan Mantri Fasal Bima Yojana': 'https://pmfby.gov.in',
        'Soil Health Card Scheme': 'https://soilhealth.dac.gov.in',
        'Kisan Credit Card (KCC)': 'https://www.nabard.org/content1.aspx?id=572',
        'PM Krishi Sinchai Yojana': 'https://pmksy.gov.in',
      };

      // Map docs to objects and handle missing links auto-correction
      for (const doc of snapshot.docs) {
        const item = doc.data() as any;
        const schemeId = doc.id;
        
        // If link is missing but we know the official one, update it back to Firestore
        if (!item.link && defaultLinks[item.name]) {
          try {
            const { updateDoc, doc: fireDoc } = await import('firebase/firestore');
            await updateDoc(fireDoc(db, 'gov_schemes', schemeId), { link: defaultLinks[item.name] });
            item.link = defaultLinks[item.name];
          } catch (e) {
            console.log('Update error for', item.name, e);
          }
        }
        
        data.push({ id: schemeId, ...item } as GovScheme);
      }

      data.sort((a, b) => a.priorityRank - b.priorityRank);
      setSchemes(data);
    } catch (error: any) {
      console.error('Failed to fetch schemes:', error);
      Alert.alert('Error', error.message || 'Failed to load government schemes.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Open official scheme website ─────────────────────────────────────────
  const handleVisitSite = (url?: string) => {
    if (!url) {
      Alert.alert('No Link', 'Official link not available for this scheme.');
      return;
    }
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open the link. Please try again.')
    );
  };

  // ── Book Expert Guide session ────────────────────────────────────────────
  const openBookingModal = (schemeName: string) => {
    setBookingScheme(schemeName);
    setBookingDate('');
    setBookingTime('');
    setBookingPhone(userProfile?.phone || '');
    setShowBookingModal(true);
  };

  const handleBookExpert = async () => {
    if (!bookingDate || !bookingTime || !bookingPhone) {
      Alert.alert('Missing Info', 'Please fill in date, time and your phone number.');
      return;
    }
    setIsBooking(true);
    try {
      await addDoc(collection(db, 'expert_bookings'), {
        farmerName: userProfile?.name || 'Farmer',
        userId: user?.uid || '',
        farmerPhone: bookingPhone,
        farmerLocation: location,
        topic: bookingScheme,
        preferredDate: bookingDate,
        preferredTime: bookingTime,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setShowBookingModal(false);
      Alert.alert(
        '✅ Session Booked!',
        `An expert guide will call you at ${bookingPhone} on ${bookingDate} around ${bookingTime} regarding "${bookingScheme}".`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not book session. Try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const filteredSchemes = schemes.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: GovScheme['status']) =>
    status === 'eligible' ? theme.colors.success : status === 'pending' ? '#F57C00' : theme.colors.error;

  const statusLabel = (status: GovScheme['status']) =>
    status === 'eligible' ? 'Eligible ✓' : status === 'pending' ? 'Pending Review' : 'Action Needed';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scheme Radar</Text>
          <TouchableOpacity onPress={fetchSchemes} style={styles.refreshButton}>
            <RefreshCcw color={theme.colors.text} size={20} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search color={theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subsidies..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Filter color={theme.colors.surface} size={18} />
          </TouchableOpacity>
        </View>

        {/* Book Expert Banner */}
        <TouchableOpacity style={styles.expertBanner} onPress={() => openBookingModal('General Farm Advisory')}>
          <View style={styles.expertBannerLeft}>
            <BookOpen color="#fff" size={24} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.expertBannerTitle}>Book a Free Expert Guide Session</Text>
            <Text style={styles.expertBannerDesc}>Get 1-on-1 govt scheme guidance from a KVK expert</Text>
          </View>
          <Text style={styles.expertBannerArrow}>→</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading schemes...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Eligibility Profile</Text>
            <View style={styles.profileCard}>
              <Text style={styles.profileText}>
                Based on your profile ({farmSize} Acres, {location}), you are eligible for{' '}
                <Text style={{ fontWeight: '800', color: theme.colors.primary }}>
                  {schemes.filter(s => s.status === 'eligible').length} Govt. Schemes
                </Text>.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Top Schemes for You</Text>

            {filteredSchemes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No schemes found matching your search.</Text>
              </View>
            ) : (
              filteredSchemes.map((scheme, index) => (
                <View key={scheme.id || index} style={styles.schemeCard}>
                  {/* Header row */}
                  <View style={styles.schemeHeader}>
                    <Text style={styles.schemeName}>{scheme.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor(scheme.status) + '20', borderColor: statusColor(scheme.status) + '50' }]}>
                      <Text style={[styles.statusLabel, { color: statusColor(scheme.status) }]}>
                        {statusLabel(scheme.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.schemeDesc}>{scheme.description}</Text>

                  <View style={styles.benefitRow}>
                    <Text style={styles.benefitText}>
                      💰 ₹{scheme.estimatedBenefitPerYear.toLocaleString()}/year
                    </Text>
                    <Text style={styles.priorityText}>Priority #{scheme.priorityRank}</Text>
                  </View>

                  {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
                    <View style={styles.documentsContainer}>
                      <Text style={styles.documentsTitle}>Required Documents:</Text>
                      <Text style={styles.documentsList}>
                        {scheme.requiredDocuments.map(d => `• ${d}`).join('  ')}
                      </Text>
                    </View>
                  )}

                  {/* Action buttons row */}
                  <View style={styles.actionRow}>
                    {/* Visit official site */}
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.visitBtn]}
                      onPress={() => handleVisitSite(scheme.link)}
                    >
                      <ExternalLink color={theme.colors.primary} size={15} />
                      <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>Visit Site</Text>
                    </TouchableOpacity>

                    {/* Book expert */}
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.bookBtn]}
                      onPress={() => openBookingModal(scheme.name)}
                    >
                      <BookOpen color="#fff" size={15} />
                      <Text style={[styles.actionBtnText, { color: '#fff' }]}>Book Guide</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Expert Booking Modal ──────────────────────────────────────────── */}
      <Modal visible={showBookingModal} animationType="slide" transparent onRequestClose={() => setShowBookingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📅 Book Expert Guide</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)} style={styles.modalClose}>
                <X color={theme.colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Topic: <Text style={{ fontWeight: '700', color: theme.colors.text }}>{bookingScheme}</Text>
            </Text>

            <Text style={styles.inputLabel}>Preferred Date (e.g. 12 March 2026)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 12 March 2026"
              placeholderTextColor="#999"
              value={bookingDate}
              onChangeText={setBookingDate}
            />

            <Text style={styles.inputLabel}>Preferred Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:00 AM"
              placeholderTextColor="#999"
              value={bookingTime}
              onChangeText={setBookingTime}
            />

            <Text style={styles.inputLabel}>Your Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91..."
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={bookingPhone}
              onChangeText={setBookingPhone}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBookingModal(false)} disabled={isBooking}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleBookExpert} disabled={isBooking}>
                {isBooking
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>Confirm Booking</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface, ...theme.shadows.sm,
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: theme.colors.background },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  refreshButton: { padding: 8 },

  searchBar: {
    margin: theme.spacing.lg, flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full,
    paddingLeft: 16, paddingRight: 4, paddingVertical: 4, ...theme.shadows.sm,
  },
  searchInput: { flex: 1, height: 40, paddingHorizontal: 12, color: theme.colors.text },
  filterBtn: {
    backgroundColor: theme.colors.primary, width: 40, height: 40,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },

  expertBanner: {
    marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg,
    backgroundColor: '#1B8F4C', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#1B8F4C', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  expertBannerLeft: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  expertBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 3 },
  expertBannerDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  expertBannerArrow: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 8 },

  loadingContainer: { padding: theme.spacing.xl, alignItems: 'center' },
  loadingText: { marginTop: theme.spacing.md, color: theme.colors.textSecondary },

  sectionTitle: {
    fontSize: 18, fontWeight: '700', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  profileCard: {
    marginHorizontal: theme.spacing.lg, backgroundColor: '#E8F5E9', padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  profileText: { fontSize: 14, color: '#2E7D32', lineHeight: 22 },

  schemeCard: {
    marginHorizontal: theme.spacing.lg, backgroundColor: theme.colors.surface,
    borderRadius: 20, padding: theme.spacing.md, marginBottom: theme.spacing.md,
    ...theme.shadows.sm, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  schemeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  schemeName: { fontSize: 15, fontWeight: '800', color: theme.colors.text, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  statusLabel: { fontSize: 10, fontWeight: '700' },

  schemeDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12, lineHeight: 19 },
  benefitRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.colors.background,
  },
  benefitText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  priorityText: { fontSize: 12, color: theme.colors.textSecondary },

  documentsContainer: {
    backgroundColor: theme.colors.background, padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm, marginBottom: 12,
  },
  documentsTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 4 },
  documentsList: { fontSize: 12, color: theme.colors.text, lineHeight: 18 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 14,
  },
  visitBtn: { borderWidth: 1.5, borderColor: theme.colors.primary, backgroundColor: 'transparent' },
  bookBtn: { backgroundColor: theme.colors.primary },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  emptyContainer: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  modalClose: { padding: 4 },
  modalDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  input: {
    backgroundColor: theme.colors.inputBackground, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: theme.colors.text, marginBottom: 14,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 10 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 15 },
  submitBtn: {
    backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 14,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
