import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Easing, Pressable, Modal, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CloudRain, CloudSun, Sprout, Users, Landmark, ChevronRight,
  RefreshCw, Wind, Droplets, Leaf, TrendingUp, ShieldCheck, Zap,
} from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const { width: SCREEN_W } = Dimensions.get('window');

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidityPercent: number;
  rainChancePercent: number;
  recommendation: string;
  raw: any;
}

// ── Floating Orb background decoration ───────────────────────────────────────
function FloatingOrb({ color, size, x, y, delay }: {
  color: string; size: number; x: number; y: number; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: 0.15,
      transform: [{ translateY }],
    }} />
  );
}

// ── Glowing Particle ─────────────────────────────────────────────────────────
function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, { toValue: -70, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', bottom: 16, left: x,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: 'rgba(255,255,255,0.7)',
      opacity, transform: [{ translateY: y }],
    }} />
  );
}

// ── Shimmer Row (loading skeleton) ───────────────────────────────────────────
function ShimmerBar({ width, height = 12, radius = 6 }: { width: number | string; height?: number; radius?: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] });
  return (
    <Animated.View style={{ width: width as any, height, borderRadius: radius, backgroundColor: 'rgba(255,255,255,0.4)', opacity }} />
  );
}

// ── Animated Count-up Number ─────────────────────────────────────────────────
function CountUp({ target, suffix = '', style }: { target: number; suffix?: string; style?: any }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    let cur = 0;
    const step = () => {
      cur += Math.max(1, Math.round(target / 30));
      if (cur >= target) { setVal(target); return; }
      setVal(cur);
      setTimeout(step, 40);
    };
    setTimeout(step, 300);
  }, [target]);
  return <Text style={style}>{val}{suffix}</Text>;
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10 }),
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[wStyles.statChip, { opacity: fade, transform: [{ scale }] }]}>
      {icon}
      <Text style={wStyles.statChipVal}>{value}</Text>
      <Text style={wStyles.statChipLabel}>{label}</Text>
    </Animated.View>
  );
}

// ── Weather Card ─────────────────────────────────────────────────────────────
function WeatherCard({ data, loading, onRefresh }: {
  data: WeatherData | null; loading: boolean; onRefresh: () => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const bob = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 90 }),
      Animated.timing(cardFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
    // Bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -10, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    // Pulse ring
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulse, { toValue: 2.0, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spinRefresh = () => {
    spin.setValue(0);
    Animated.timing(spin, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    onRefresh();
  };
  const spinInterp = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const particles = [
    { x: 20, size: 5, delay: 0 }, { x: 60, size: 4, delay: 400 },
    { x: 110, size: 7, delay: 900 }, { x: 170, size: 5, delay: 200 },
    { x: 220, size: 4, delay: 700 }, { x: 270, size: 6, delay: 100 },
    { x: 310, size: 3, delay: 600 },
  ];

  const forecastDays = data?.raw?.forecast?.forecastday || [];
  const currentDetails = data?.raw?.current;

  return (
    <Animated.View style={{ opacity: cardFade, transform: [{ scale: cardScale }], marginBottom: 20 }}>
      <Pressable onPress={() => setModalVisible(true)}>
        <LinearGradient
          colors={['#0f5c2e', '#1B8F4C', '#26a85a', '#1B8F4C']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={wStyles.card}
        >
          {/* Orb decorations */}
          <FloatingOrb color="#fff" size={180} x={-60} y={-60} delay={0} />
          <FloatingOrb color="#a8ff78" size={100} x={SCREEN_W - 190} y={10} delay={1200} />

          {/* Floating particles */}
          {particles.map((p, i) => <Particle key={i} delay={p.delay} x={p.x} size={p.size} />)}

          {/* Glowing border line at top */}
          <View style={wStyles.glowBar} />

          {/* Top row */}
          <View style={wStyles.topRow}>
            <View>
              <Text style={wStyles.label}>🌿 CURRENT WEATHER</Text>
              <Text style={wStyles.location}>
                📍 {loading ? 'Locating…' : data?.location || 'India'}
              </Text>
            </View>
            <TouchableOpacity onPress={spinRefresh} style={wStyles.refreshBtn}>
              <Animated.View style={{ transform: [{ rotate: spinInterp }] }}>
                <RefreshCw color="rgba(255,255,255,0.9)" size={17} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 24, alignItems: 'flex-start', gap: 12 }}>
              <ShimmerBar width={100} height={72} radius={12} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <ShimmerBar width={90} height={30} radius={15} />
                <ShimmerBar width={90} height={30} radius={15} />
                <ShimmerBar width={80} height={30} radius={15} />
              </View>
            </View>
          ) : (
            <>
              {/* Main content */}
              <View style={wStyles.mainRow}>
                <View>
                  <CountUp target={Math.round(data?.temperature ?? 28)} suffix="°" style={wStyles.temperature} />
                  <Text style={wStyles.condition}>{data?.condition || 'Clear'}</Text>
                </View>
                {/* Icon with pulse + bob */}
                <View style={wStyles.iconContainer}>
                  <Animated.View style={[wStyles.pulseRing, { transform: [{ scale: pulse }], opacity: pulseOpacity }]} />
                  <Animated.View style={[wStyles.iconCircle, { transform: [{ translateY: bob }] }]}>
                    {(data?.rainChancePercent ?? 0) > 50
                      ? <CloudRain color="#fff" size={38} />
                      : <CloudSun color="#fff" size={38} />}
                  </Animated.View>
                </View>
              </View>

              {/* Stat chips */}
              <View style={wStyles.statsRow}>
                <StatChip icon={<CloudRain color="rgba(255,255,255,0.85)" size={13} />} value={`${data?.rainChancePercent}%`} label="Rain" />
                <StatChip icon={<Droplets color="rgba(255,255,255,0.85)" size={13} />} value={`${data?.humidityPercent}%`} label="Humidity" />
                <StatChip icon={<Wind color="rgba(255,255,255,0.85)" size={13} />} value={`${currentDetails?.wind_kph ?? 0}`} label="km/h" />
              </View>

              {data?.recommendation && (
                <View style={wStyles.advisory}>
                  <Text style={wStyles.advisoryText}>💬 {data.recommendation}</Text>
                </View>
              )}
              <Text style={wStyles.tapHint}>Tap for 3-day forecast →</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>

      {/* Weather Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <View style={modalStyles.headerRow}>
              <Text style={modalStyles.title}>📍 {data?.location || 'Location'}</Text>
              <Pressable onPress={() => setModalVisible(false)} style={modalStyles.closeBtn}>
                <Text style={modalStyles.closeBtnText}>✕</Text>
              </Pressable>
            </View>
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginVertical: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={modalStyles.mainTempRow}>
                  <Text style={modalStyles.mainTemp}>{Math.round(data?.temperature ?? 0)}°</Text>
                  <View style={{ marginLeft: 16 }}>
                    <Text style={modalStyles.mainCond}>{data?.condition}</Text>
                    <Text style={modalStyles.subCond}>Feels like {Math.round(currentDetails?.feelslike_c || data?.temperature || 0)}°</Text>
                  </View>
                </View>
                <View style={modalStyles.grid}>
                  <View style={modalStyles.gridItem}>
                    <Droplets color={theme.colors.primary} size={24} />
                    <Text style={modalStyles.gridLabel}>Humidity</Text>
                    <Text style={modalStyles.gridValue}>{data?.humidityPercent}%</Text>
                  </View>
                  <View style={modalStyles.gridItem}>
                    <CloudRain color={theme.colors.primary} size={24} />
                    <Text style={modalStyles.gridLabel}>Rain Chance</Text>
                    <Text style={modalStyles.gridValue}>{data?.rainChancePercent}%</Text>
                  </View>
                  <View style={modalStyles.gridItem}>
                    <Wind color={theme.colors.primary} size={24} />
                    <Text style={modalStyles.gridLabel}>Wind</Text>
                    <Text style={modalStyles.gridValue}>{currentDetails?.wind_kph ?? 0} km/h</Text>
                  </View>
                </View>
                <Text style={modalStyles.sectionTitle}>3-Day Forecast</Text>
                {forecastDays.map((day: any, idx: number) => {
                  const dateObj = new Date(day.date);
                  const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <View key={day.date} style={modalStyles.forecastRow}>
                      <Text style={modalStyles.forecastDay}>{dayName}</Text>
                      <View style={modalStyles.forecastIcon}>
                        {day.day.daily_chance_of_rain > 50 ? <CloudRain color="#555" size={20} /> : <CloudSun color="#555" size={20} />}
                      </View>
                      <Text style={modalStyles.forecastTemp}>
                        {Math.round(day.day.maxtemp_c)}° / {Math.round(day.day.mintemp_c)}°
                      </Text>
                    </View>
                  );
                })}
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

// ── Animated Stats Row ────────────────────────────────────────────────────────
function DashboardStats() {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const stats = [
    { icon: <Leaf color="#1B8F4C" size={20} />, value: 14, suffix: '', label: 'Crops Tracked', bg: '#E8F5E9' },
    { icon: <TrendingUp color="#F57C00" size={20} />, value: 87, suffix: '%', label: 'Yield Score', bg: '#FFF3E0' },
    { icon: <ShieldCheck color="#5C6BC0" size={20} />, value: 3, suffix: '', label: 'Active Schemes', bg: '#EDE7F6' },
  ];

  return (
    <Animated.View style={[statsRowStyle.row, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {stats.map((s, i) => (
        <View key={i} style={[statsRowStyle.card, { backgroundColor: s.bg }]}>
          <View style={statsRowStyle.iconWrap}>{s.icon}</View>
          <CountUp target={s.value} suffix={s.suffix} style={statsRowStyle.val} />
          <Text style={statsRowStyle.label}>{s.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const statsRowStyle = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  card: { flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', gap: 4 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  val: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  label: { fontSize: 10, color: '#555', fontWeight: '600', textAlign: 'center' },
});

// ── Animated Marquee Ticker ───────────────────────────────────────────────────
function CropTicker() {
  const translateX = useRef(new Animated.Value(0)).current;
  const items = ['🌾 Wheat ₹2,180/q', '🌽 Maize ₹1,940/q', '🫘 Soybean ₹4,420/q', '🌱 Sugarcane ₹315/q', '🍚 Rice ₹2,060/q', '🧅 Onion ₹1,250/q'];
  const text = items.join('    ·    ');
  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -(SCREEN_W * 2),
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  return (
    <View style={tickerStyle.wrapper}>
      <LinearGradient colors={['#FFF8E1', '#FFFDE7', '#FFF8E1']} style={tickerStyle.bg}>
        <View style={tickerStyle.badge}>
          <Zap color="#F57C00" size={12} />
          <Text style={tickerStyle.badgeText}>LIVE</Text>
        </View>
        <View style={tickerStyle.overflow}>
          <Animated.Text style={[tickerStyle.text, { transform: [{ translateX }] }]} numberOfLines={1}>
            {text}    {text}
          </Animated.Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const tickerStyle = StyleSheet.create({
  wrapper: { marginBottom: 20, borderRadius: 16, overflow: 'hidden', shadowColor: '#F57C00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  bg: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9800', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, marginRight: 10, gap: 3 },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  overflow: { flex: 1, overflow: 'hidden' },
  text: { fontSize: 12, fontWeight: '600', color: '#E65100', whiteSpace: 'nowrap' } as any,
});

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  iconBg, iconBorder, icon, title, desc, badge, onPress, delay = 0,
}: {
  iconBg: string; iconBorder: string; icon: React.ReactNode;
  title: string; desc: string; badge?: string;
  onPress: () => void; delay?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    // Subtle glow loop on the icon bg
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 1, duration: 1800, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.4, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }, { scale }], marginBottom: 14 }}>
      <Pressable
        style={[styles.featureCard, { borderLeftColor: iconBorder, borderLeftWidth: 3 }]}
        onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}
      >
        <Animated.View style={[styles.featureIconBg, { backgroundColor: iconBg, opacity: glowOpacity }]}
          pointerEvents="none"
        >
          <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 28, backgroundColor: iconBg }} />
        </Animated.View>
        <View style={[styles.featureIconBg, { backgroundColor: iconBg, position: 'absolute', left: 16 }]}>
          {icon}
        </View>
        <View style={styles.featureTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <Text style={styles.featureTitle}>{title}</Text>
            {badge && (
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.featureDesc}>{desc}</Text>
        </View>
        <ChevronRight color={theme.colors.textSecondary} size={20} />
      </Pressable>
    </Animated.View>
  );
}

// ── Section Header with animated underline ───────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  const lineW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(lineW, { toValue: 1, duration: 600, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, []);
  return (
    <View style={{ marginBottom: 14, marginTop: 6 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub && <Text style={styles.sectionSub}>{sub}</Text>}
      <Animated.View style={{
        height: 3, borderRadius: 2,
        backgroundColor: theme.colors.primary,
        width: lineW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '30%'] }),
        marginTop: 5,
      }} />
    </View>
  );
}



// ── Main Screen ───────────────────────────────────────────────────────────────
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
  const headerSlide = useRef(new Animated.Value(-24)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    // Blinking online dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    fetchWeather();
  }, [location, mainCrop]);

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
      if (!apiKey) throw new Error('No WeatherAPI key');
      let queryParam = encodeURIComponent(location);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          queryParam = `${loc.coords.latitude},${loc.coords.longitude}`;
        }
      } catch { }
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${queryParam}&days=3&aqi=no&alerts=no`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      const temp = json.current.temp_c;
      const cond = json.current.condition.text;
      const humi = json.current.humidity;
      const rain = json.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0;
      let rec = 'Good day for routine field work and pest monitoring.';
      if (rain > 50) rec = 'Heavy rain expected. Avoid spraying pesticides today.';
      if (temp > 35) rec = 'High heat alert. Ensure proper irrigation to prevent stress.';
      if (temp < 10) rec = 'Cold alert. Check sensitive crops for frost damage risk.';
      setWeatherData({ location: json.location.name, temperature: temp, condition: cond, humidityPercent: humi, rainChancePercent: rain, recommendation: rec, raw: json });
    } catch (err) {
      setWeatherData({ location, temperature: 28, condition: 'Clear', humidityPercent: 65, rainChancePercent: 12, recommendation: 'Good day for soil preparation and light watering.', raw: null });
    } finally {
      setLoadingWeather(false);
    }
  };

  const onAvatarIn = () => Animated.spring(avatarScale, { toValue: 0.88, useNativeDriver: true, speed: 40 }).start();
  const onAvatarOut = () => Animated.spring(avatarScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={{ flex: 1, backgroundColor: '#F4FAF6' }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top + 10, opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <LinearGradient colors={['#fff', '#F4FAF6']} style={StyleSheet.absoluteFill} />
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.username}>{displayName} 🌱</Text>
          <View style={styles.onlineBadge}>
            <Animated.View style={[styles.onlineDot, { opacity: dotAnim }]} />
            <Text style={styles.onlineText}>Krishi AI Online</Text>
          </View>
        </View>
        <Pressable onPressIn={onAvatarIn} onPressOut={onAvatarOut} onPress={() => router.push('/profile' as any)}>
          <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
            <LinearGradient colors={['#26a85a', '#0D6B38']} style={styles.profileBadge}>
              <Text style={styles.profileInitials}>{initials}</Text>
            </LinearGradient>
            <View style={styles.profileRing} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 40 }}
      >
        {/* ── Weather card ────────────────────────────────────────────────── */}
        <WeatherCard data={weatherData} loading={loadingWeather} onRefresh={fetchWeather} />

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <DashboardStats />

        {/* ── Live Crop Ticker ─────────────────────────────────────────────── */}
        <CropTicker />



        {/* ── Farm Intelligence ─────────────────────────────────────────────── */}
        <SectionHeader title="Farm Intelligence" sub="AI-powered insights for your farm" />
        <FeatureCard
          iconBg="#F3E5F5" iconBorder="#CE93D8"
          icon={<Sprout color="#7B1FA2" size={26} />}
          title="Crop Rotation Engine"
          desc="Rebuild soil health with an AI-optimized 2-year sequence."
          badge="AI"
          onPress={() => router.push('/crop-rotation' as any)}
          delay={0}
        />

        {/* ── Community & Growth ────────────────────────────────────────────── */}
        <SectionHeader title="Community & Growth" />
        <FeatureCard
          iconBg="#E8F5E9" iconBorder="#81C784"
          icon={<Users color="#388E3C" size={26} />}
          title="Neighbour Mentorship"
          desc="Connect with the top 5% most successful farmers nearby."
          onPress={() => router.push('/mentorship' as any)}
          delay={60}
        />
        <FeatureCard
          iconBg="#FFF3E0" iconBorder="#FFB74D"
          icon={<Landmark color="#F57C00" size={26} />}
          title="Govt. Scheme Radar"
          desc="View active subsidies and grants tailored to your profile."
          badge="New"
          onPress={() => router.push('/gov-schemes' as any)}
          delay={120}
        />
      </ScrollView>
    </View>
  );
}

// ── Style Sheets ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '85%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 16, fontWeight: '700', color: '#555' },
  mainTempRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  mainTemp: { fontSize: 64, fontWeight: '800', color: theme.colors.text },
  mainCond: { fontSize: 18, fontWeight: '700', color: theme.colors.textSecondary },
  subCond: { fontSize: 14, color: '#888', marginTop: 4 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  gridItem: { flex: 1, backgroundColor: '#F5F8F6', borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  gridLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 8, marginBottom: 4 },
  gridValue: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
  forecastRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  forecastDay: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },
  forecastIcon: { width: 40, alignItems: 'center' },
  forecastTemp: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text, textAlign: 'right' },
});

const wStyles = StyleSheet.create({
  card: {
    borderRadius: 28, padding: 22, overflow: 'hidden', minHeight: 210,
    shadowColor: '#0D6B38', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45, shadowRadius: 24, elevation: 16,
  },
  glowBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(168,255,120,0.6)', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  location: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 4 },
  refreshBtn: { padding: 9, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  mainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  temperature: { color: '#fff', fontSize: 76, fontWeight: '800', lineHeight: 80 },
  condition: { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '500', marginTop: 4 },
  iconContainer: { alignItems: 'center', justifyContent: 'center', width: 96, height: 96 },
  pulseRing: { position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)' },
  iconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statChip: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: 9, borderRadius: 16 },
  statChipVal: { color: '#fff', fontSize: 14, fontWeight: '800' },
  statChipLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600' },
  advisory: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 12, borderLeftWidth: 3, borderLeftColor: 'rgba(168,255,120,0.7)', marginBottom: 8 },
  advisoryText: { color: 'rgba(255,255,255,0.95)', fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
  tapHint: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'right', fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18 },
  stickyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16, overflow: 'hidden',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(27,143,76,0.18)',
    shadowColor: '#1B8F4C', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 7, zIndex: 99,
    backgroundColor: '#fff',
  },
  greeting: { fontSize: 12, color: '#6B7B6E', marginBottom: 1, fontWeight: '500' },
  username: { fontSize: 22, fontWeight: '800', color: '#0f2d1a' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#1B8F4C' },
  onlineText: { fontSize: 10, color: '#1B8F4C', fontWeight: '700', letterSpacing: 0.5 },
  profileBadge: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  profileInitials: { color: '#fff', fontWeight: '800', fontSize: 18 },
  profileRing: { position: 'absolute', width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(27,143,76,0.3)', top: -3, left: -3 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f2d1a' },
  sectionSub: { fontSize: 12, color: '#6B7B6E', marginTop: 2 },

  featureCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16, paddingRight: 14, paddingLeft: 80,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  featureIconBg: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    position: 'absolute', left: 16,
  },
  featureTextContainer: { flex: 1, marginRight: 8 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#0f2d1a' },
  featureDesc: { fontSize: 12, color: '#6B7B6E', lineHeight: 17, marginTop: 2 },
  featureBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  featureBadgeText: { fontSize: 9, fontWeight: '800', color: '#2E7D32', letterSpacing: 0.5 },

  quickPill: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    borderWidth: 1, borderColor: 'rgba(27,143,76,0.12)',
    minWidth: 72,
  },
  quickPillEmoji: { fontSize: 22, marginBottom: 4 },
  quickPillLabel: { fontSize: 10, fontWeight: '700', color: '#0f2d1a' },
});
