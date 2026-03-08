import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CloudRain, CloudSun, Sprout, TrendingUp, Handshake, Users, Landmark, ChevronRight, RefreshCw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidityPercent: number;
  rainChancePercent: number;
  recommendation: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const displayName = userProfile?.name || 'Farmer';
  const initials = displayName.substring(0, 2).toUpperCase();
  const location = userProfile?.location || 'Pune, MH';
  const mainCrop = userProfile?.mainCrops?.split(',')[0] || 'wheat';

  useEffect(() => {
    fetchWeather();
  }, [location, mainCrop]);

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const data = await apiCall<WeatherData>(API_ENDPOINTS.weather, {
        method: 'POST',
        body: JSON.stringify({
          location: location,
          farmSize: parseFloat(userProfile?.farmSize || '5'),
          mainCrop: mainCrop,
        }),
      });
      setWeatherData(data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Fallback to default data
      setWeatherData({
        location: location,
        temperature: 28,
        condition: 'Clear',
        humidityPercent: 65,
        rainChancePercent: 12,
        recommendation: 'Weather data unavailable. Check local conditions.',
      });
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.username}>{displayName}</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge} onPress={() => router.push('/profile' as any)}>
          <Text style={styles.profileInitials}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* Weather Widget - Now with Real Data */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.weatherCard}
      >
        <View style={styles.weatherHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.weatherTitle}>Current Weather</Text>
            <Text style={styles.weatherLocation}>
              {loadingWeather ? 'Loading...' : weatherData?.location || location}
            </Text>
          </View>
          <TouchableOpacity onPress={fetchWeather} style={{ padding: 4 }}>
            <RefreshCw 
              color={theme.colors.surface} 
              size={20} 
              style={{ opacity: loadingWeather ? 0.5 : 1 }}
            />
          </TouchableOpacity>
          <CloudSun color={theme.colors.surface} size={32} style={{ marginLeft: 8 }} />
        </View>
        {loadingWeather ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator color={theme.colors.surface} />
          </View>
        ) : (
          <View style={styles.weatherDetails}>
            <Text style={styles.temperature}>{Math.round(weatherData?.temperature || 28)}°C</Text>
            <View style={styles.weatherDivider} />
            <View style={styles.weatherExtra}>
              <View style={styles.weatherRow}>
                <CloudRain color={theme.colors.surface} size={16} />
                <Text style={styles.weatherText}>
                  {weatherData?.rainChancePercent || 0}% Chance of rain
                </Text>
              </View>
              <Text style={styles.weatherText}>
                Humidity: {weatherData?.humidityPercent || 0}%
              </Text>
              <Text style={[styles.weatherText, { marginTop: 8, fontSize: 12, opacity: 0.9 }]}>
                {weatherData?.condition || 'Clear'}
              </Text>
            </View>
          </View>
        )}
        {weatherData?.recommendation && (
          <View style={styles.weatherAdvisory}>
            <Text style={styles.weatherAdvisoryText}>{weatherData.recommendation}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Recommended Action */}
      <View style={styles.bannerContainer}>
        <LinearGradient colors={['#FFF8E1', '#FFECB3']} style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Mandi Prices Updating</Text>
            <Text style={styles.bannerDesc}>
              {mainCrop.charAt(0).toUpperCase() + mainCrop.slice(1)} prices in your local mandi are updating in real-time.
            </Text>
            <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/market' as any)}>
              <Text style={styles.bannerButtonText}>Check Rates</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Main Feature Hub */}
      <Text style={styles.sectionTitle}>Farm Intelligence</Text>

      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/planner' as any)}>
        <View style={[styles.featureIconBg, { backgroundColor: '#E3F2FD' }]}>
          <TrendingUp color="#1976D2" size={28} />
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>Climate Scenario Planner</Text>
          <Text style={styles.featureDesc}>Simulate "what if" weather impacts and see alternative crops.</Text>
        </View>
        <ChevronRight color={theme.colors.textSecondary} size={20} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/crop-rotation' as any)}>
        <View style={[styles.featureIconBg, { backgroundColor: '#F3E5F5' }]}>
          <Sprout color="#7B1FA2" size={28} />
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>Crop Rotation Engine</Text>
          <Text style={styles.featureDesc}>Rebuild soil health with an optimized 2-year sequence.</Text>
        </View>
        <ChevronRight color={theme.colors.textSecondary} size={20} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Community & Growth</Text>

      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/mentorship' as any)}>
        <View style={[styles.featureIconBg, { backgroundColor: '#E8F5E9' }]}>
          <Users color="#388E3C" size={28} />
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>Neighbor Mentorship</Text>
          <Text style={styles.featureDesc}>Connect with the top 5% most successful farmers nearby.</Text>
        </View>
        <ChevronRight color={theme.colors.textSecondary} size={20} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/gov-schemes' as any)}>
        <View style={[styles.featureIconBg, { backgroundColor: '#FFF3E0' }]}>
          <Landmark color="#F57C00" size={28} />
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>Govt. Scheme Radar</Text>
          <Text style={styles.featureDesc}>View active subsidies tailored to your profile.</Text>
        </View>
        <ChevronRight color={theme.colors.textSecondary} size={20} />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  username: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
  },
  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 18,
  },
  weatherCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  weatherTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  weatherLocation: {
    color: theme.colors.surface,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
  },
  weatherLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  weatherDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    color: theme.colors.surface,
    fontSize: 48,
    fontWeight: '700',
  },
  weatherDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: theme.spacing.md,
  },
  weatherExtra: {
    flex: 1,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weatherText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '500',
  },
  weatherAdvisory: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  weatherAdvisoryText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  bannerContainer: {
    marginBottom: theme.spacing.xl,
  },
  banner: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  bannerContent: {
    alignItems: 'flex-start',
  },
  bannerTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  bannerButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  bannerButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
    fontSize: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  featureIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
