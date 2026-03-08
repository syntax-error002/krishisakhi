import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, CheckCircle, Clock, RefreshCcw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface GovScheme {
  name: string;
  description: string;
  tag: string;
  status: 'eligible' | 'pending' | 'warning';
  estimatedBenefitPerYear: number;
  priorityRank: number;
  link?: string;
  requiredDocuments: string[];
}

interface SchemesResponse {
  profileSummary: string;
  totalEligibleSchemes: number;
  topSchemes: GovScheme[];
}

export default function GovSchemesScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [profileSummary, setProfileSummary] = useState('');
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const location = userProfile?.location || 'Pune, MH';
  const farmSize = parseFloat(userProfile?.farmSize || '2');
  const mainCrops = userProfile?.mainCrops?.split(',').map((c) => c.trim()) || ['wheat', 'soybean'];
  const isSmallOrMarginal = farmSize <= 2;

  useEffect(() => {
    fetchSchemes();
  }, [location, farmSize, mainCrops]);

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const data = await apiCall<SchemesResponse>(API_ENDPOINTS.schemes, {
        method: 'POST',
        body: JSON.stringify({
          location: location,
          farmSize: farmSize,
          mainCrops: mainCrops,
          isSmallOrMarginal: isSmallOrMarginal,
        }),
      });
      setSchemes(data.topSchemes);
      setProfileSummary(data.profileSummary);
      setTotalSchemes(data.totalEligibleSchemes);
    } catch (error: any) {
      console.error('Failed to fetch schemes:', error);
      Alert.alert('Error', error.message || 'Failed to load government schemes.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(
    (scheme) =>
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheme Radar</Text>
        <TouchableOpacity onPress={fetchSchemes} style={styles.refreshButton}>
          <RefreshCcw color={theme.colors.text} size={20} />
        </TouchableOpacity>
      </View>

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
              {profileSummary || `Based on your profile (${farmSize} Acres, ${location}), you are eligible for `}
              <Text style={{ fontWeight: '800', color: theme.colors.primary }}>
                {totalSchemes} Govt. Schemes
              </Text>
              .
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Top Schemes for You</Text>

          {filteredSchemes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No schemes found matching your search.</Text>
            </View>
          ) : (
            filteredSchemes.map((scheme, index) => (
              <View key={index} style={styles.schemeCard}>
                <View style={styles.schemeHeader}>
                  <Text style={styles.schemeName}>{scheme.name}</Text>
                  {scheme.status === 'eligible' && <CheckCircle color={theme.colors.success} size={20} />}
                  {scheme.status === 'pending' && <Clock color="#F57C00" size={20} />}
                  {scheme.status === 'warning' && <Clock color={theme.colors.error} size={20} />}
                </View>
                <Text style={styles.schemeDesc}>{scheme.description}</Text>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitText}>
                    Estimated Benefit: ₹{scheme.estimatedBenefitPerYear.toLocaleString()}/year
                  </Text>
                  <Text style={styles.priorityText}>Priority #{scheme.priorityRank}</Text>
                </View>
                {scheme.requiredDocuments.length > 0 && (
                  <View style={styles.documentsContainer}>
                    <Text style={styles.documentsTitle}>Required Documents:</Text>
                    {scheme.requiredDocuments.map((doc, idx) => (
                      <Text key={idx} style={styles.documentItem}>
                        • {doc}
                      </Text>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    scheme.status === 'eligible' ? { backgroundColor: theme.colors.background } : {},
                  ]}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      scheme.status === 'eligible' ? { color: theme.colors.success } : {},
                    ]}
                  >
                    {scheme.tag}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
  refreshButton: { padding: 8 },
  searchBar: {
    margin: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    ...theme.shadows.sm,
  },
  searchInput: { flex: 1, height: 40, paddingHorizontal: 12 },
  filterBtn: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  profileCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: '#E8F5E9',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  profileText: { fontSize: 14, color: '#2E7D32', lineHeight: 22 },
  schemeCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  schemeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  schemeName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, flex: 1, marginRight: 8 },
  schemeDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  benefitText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
  priorityText: { fontSize: 12, color: theme.colors.textSecondary },
  documentsContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 12,
  },
  documentsTitle: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 },
  documentItem: { fontSize: 12, color: theme.colors.text, marginLeft: 8 },
  actionBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  actionBtnText: { color: theme.colors.surface, fontWeight: '700', fontSize: 14 },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
