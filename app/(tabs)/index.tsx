import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Easing, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CloudRain, CloudSun, Sprout, Users, Landmark, ChevronRight, RefreshCw } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidityPercent: number;
  rainChancePercent: number;
  recommendation: string;
}

// ── Animated feature card with spring press ───────────────────────────────────
function FeatureCard({
  iconBg, icon, title, desc, onPress, delay = 0,
}: {
  iconBg: string; icon: React.ReactNode; title: string; desc: string;
  onPress: () => void; delay?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }, { scale }] }}>
      <Pressable style={styles.featureCard} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
        <View style={[styles.featureIconBg, { backgroundColor: iconBg }]}>{icon}</View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDesc}>{desc}</Text>
        </View>
        <ChevronRight color={theme.colors.textSecondary} size={20} />
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const displayName = userProfile?.name || 'Farmer';
  const initials = displayName.substring(0, 2).toUpperCase();
  const location = userProfile?.location || 'Pune, MH';
  const mainCrop = userProfile?.mainCrops?.split(',')[0] || 'wheat';

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const weatherFade = useRef(new Animated.Value(0)).current;
  const bannerFade = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(headerSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.timing(weatherFade, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(bannerFade, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    fetchWeather();
  }, [location, mainCrop]);

  const fetchWeather = () => {
    setLoadingWeather(true);
    setTimeout(() => {
      setWeatherData({ location, temperature: 28, condition: 'Clear', humidityPercent: 65, rainChancePercent: 12, recommendation: 'Good day for soil preparation and light watering.' });
      setLoadingWeather(false);
    }, 1000);
  };

  const onAvatarIn = () => Animated.spring(avatarScale, { toValue: 0.9, useNativeDriver: true, speed: 40 }).start();
  const onAvatarOut = () => Animated.spring(avatarScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

      {/* ── Sticky Header (outside ScrollView so it doesn't scroll) ─────────── */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top + 12, opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.username}>{displayName} 🌱</Text>
        </View>
        <Pressable onPressIn={onAvatarIn} onPressOut={onAvatarOut} onPress={() => router.push('/profile' as any)}>
          <Animated.View style={[styles.profileBadge, { transform: [{ scale: avatarScale }] }]}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16 }}>

        {/* ── Weather Card ─────────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: weatherFade }}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.weatherCard}
          >
            <View style={styles.weatherHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.weatherTitle}>Current Weather</Text>
                <Text style={styles.weatherLocation}>
                  {loadingWeather ? 'Loading…' : weatherData?.location || location}
                </Text>
              </View>
              <TouchableOpacity onPress={fetchWeather} style={{ padding: 4 }}>
                <RefreshCw color="#fff" size={20} style={{ opacity: loadingWeather ? 0.4 : 1 }} />
              </TouchableOpacity>
              <CloudSun color="#fff" size={32} style={{ marginLeft: 8 }} />
            </View>

            {loadingWeather ? (
              <View style={styles.weatherLoading}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <View style={styles.weatherDetails}>
                <Text style={styles.temperature}>{Math.round(weatherData?.temperature || 28)}°C</Text>
                <View style={styles.weatherDivider} />
                <View style={styles.weatherExtra}>
                  <View style={styles.weatherRow}>
                    <CloudRain color="#fff" size={16} />
                    <Text style={styles.weatherText}> {weatherData?.rainChancePercent || 0}% rain</Text>
                  </View>
                  <Text style={styles.weatherText}>Humidity: {weatherData?.humidityPercent || 0}%</Text>
                  <Text style={[styles.weatherText, { marginTop: 6, fontSize: 12, opacity: 0.9 }]}>
                    {weatherData?.condition || 'Clear'}
                  </Text>
                </View>
              </View>
            )}

            {weatherData?.recommendation && (
              <View style={styles.weatherAdvisory}>
                <Text style={styles.weatherAdvisoryText}>💬 {weatherData.recommendation}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ── Mandi Banner ─────────────────────────────────────────────────── */}
        <Animated.View style={[styles.bannerContainer, { opacity: bannerFade }]}>
          <LinearGradient colors={['#FFF8E1', '#FFECB3']} style={styles.banner}>
            <Text style={styles.bannerTitle}>📊 Mandi Prices Updating</Text>
            <Text style={styles.bannerDesc}>
              {mainCrop.charAt(0).toUpperCase() + mainCrop.slice(1)} prices in your local mandi are updating in real-time.
            </Text>
            <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/market' as any)}>
              <Text style={styles.bannerButtonText}>Check Rates →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* ── Farm Intelligence ─────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Farm Intelligence</Text>
        <FeatureCard
          iconBg="#F3E5F5" icon={<Sprout color="#7B1FA2" size={28} />}
          title="Crop Rotation Engine"
          desc="Rebuild soil health with an AI-optimized 2-year sequence."
          onPress={() => router.push('/crop-rotation' as any)}
          delay={0}
        />

        <Text style={styles.sectionTitle}>Community &amp; Growth</Text>
        <FeatureCard
          iconBg="#E8F5E9" icon={<Users color="#388E3C" size={28} />}
          title="Neighbor Mentorship"
          desc="Connect with the top 5% most successful farmers nearby."
          onPress={() => router.push('/mentorship' as any)}
          delay={60}
        />
        <FeatureCard
          iconBg="#FFF3E0" icon={<Landmark color="#F57C00" size={28} />}
          title="Govt. Scheme Radar"
          desc="View active subsidies tailored to your profile."
          onPress={() => router.push('/gov-schemes' as any)}
          delay={120}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },

  // ── Sticky Header ──────────────────────────────────────────────────────────
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 16,
    backgroundColor: theme.colors.surface,
    // Curved bottom edges
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    // Green accent border
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.primary + '55',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 99,
  },

  greeting: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 2 },
  username: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  profileBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  profileInitials: { color: '#fff', fontWeight: '800', fontSize: 18 },

  // ── Weather ────────────────────────────────────────────────────────────────
  weatherCard: { borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, marginBottom: theme.spacing.md, ...theme.shadows.md },
  weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  weatherTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  weatherLocation: { color: '#fff', fontSize: 17, fontWeight: '700' },
  weatherLoading: { paddingVertical: 20, alignItems: 'center' },
  weatherDetails: { flexDirection: 'row', alignItems: 'center' },
  temperature: { color: '#fff', fontSize: 52, fontWeight: '800' },
  weatherDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: theme.spacing.md },
  weatherExtra: { flex: 1 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  weatherText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },
  weatherAdvisory: { marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  weatherAdvisoryText: { color: 'rgba(255,255,255,0.95)', fontSize: 12, lineHeight: 18, fontStyle: 'italic' },

  // ── Banner ─────────────────────────────────────────────────────────────────
  bannerContainer: { marginBottom: theme.spacing.xl },
  banner: { borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#F57C00', marginBottom: 4 },
  bannerDesc: { fontSize: 13, color: '#E65100', marginBottom: theme.spacing.md, lineHeight: 18 },
  bannerButton: { backgroundColor: '#FF9800', paddingHorizontal: theme.spacing.md, paddingVertical: 8, borderRadius: theme.borderRadius.full, alignSelf: 'flex-start' },
  bannerButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.md, marginTop: theme.spacing.sm },

  // ── Feature Card ───────────────────────────────────────────────────────────
  featureCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md, borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md, ...theme.shadows.sm,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
  },
  featureIconBg: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  featureTextContainer: { flex: 1, marginRight: 8 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
});
