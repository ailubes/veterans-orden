import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight, Search, X, MapPin, Phone, Globe, GraduationCap, Briefcase, MessageCircle, ChevronDown } from 'lucide-react-native';
import { api } from '@/lib/api';
import { useAlert } from '@/components/ui/app-alert';

// ── Types ──────────────────────────────────────────────────────────────────

interface FormState {
  phone: string;
  additionalPhone: string;
  hasViber: boolean;
  hasWhatsapp: boolean;
  hasSignal: boolean;
  facebookUrl: string;
  education: string;
  profession: string;
  katottgCode: string;
  settlementName: string;
  hromadaName: string;
  raionName: string;
  oblastNameKatottg: string;
}

interface KatottgResult {
  code: string;
  name: string;
  hromada_name: string;
  raion_name: string;
  oblast_name: string;
  full_path: string;
}

const EDUCATION_OPTIONS = [
  { value: 'secondary', label: 'Середня' },
  { value: 'vocational', label: 'Професійна' },
  { value: 'higher', label: 'Вища' },
];

const MILITARY_RANK_LABELS: Record<string, string> = {
  soldier: 'Солдат', senior_soldier: 'Старший солдат',
  junior_sergeant: 'Молодший сержант', sergeant: 'Сержант',
  senior_sergeant: 'Старший сержант', master_sergeant: 'Головний сержант',
  staff_sergeant: 'Штаб-сержант', chief_sergeant: 'Майстер-сержант',
  junior_lieutenant: 'Молодший лейтенант', lieutenant: 'Лейтенант',
  senior_lieutenant: 'Старший лейтенант', captain: 'Капітан',
  major: 'Майор', lieutenant_colonel: 'Підполковник',
  colonel: 'Полковник', brigadier_general: 'Бригадний генерал',
  major_general: 'Генерал-майор', lieutenant_general: 'Генерал-лейтенант',
  general: 'Генерал', general_army: 'Генерал армії України',
};

// ── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ label, icon: Icon, color }: {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  color: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: `${color}18` }]}>
        <Icon color={color} size={16} />
      </View>
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

// ── Read-only field ────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <View style={styles.readOnlyField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.readOnlyValue, empty && styles.readOnlyEmpty]}>
        {empty ? 'Не вказано' : value}
      </Text>
    </View>
  );
}

// ── Messenger toggle ───────────────────────────────────────────────────────

function MessengerToggle({
  label, active, onToggle, color,
}: { label: string; active: boolean; onToggle: () => void; color: string }) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onToggle}
      style={[styles.messengerBtn, active && { borderColor: color, backgroundColor: `${color}15` }]}
    >
      {active && (
        <View style={[styles.messengerCheck, { backgroundColor: color }]}>
          <Check color="#fff" size={10} />
        </View>
      )}
      <Text style={[styles.messengerLabel, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Completion bar ─────────────────────────────────────────────────────────

function CompletionBar({ profile, form }: { profile: any; form: FormState }) {
  const fields = [
    profile?.patronymic,
    profile?.date_of_birth,
    form.phone,
    form.settlementName,
    form.profession,
    form.education,
    form.facebookUrl || form.hasViber || form.hasWhatsapp || form.hasSignal,
  ];
  const filled = fields.filter(Boolean).length;
  const total = fields.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <View style={styles.completionWrap}>
      <View style={styles.completionRow}>
        <Text style={styles.completionLabel}>Заповненість профілю</Text>
        <Text style={styles.completionPct}>{pct}%</Text>
      </View>
      <View style={styles.completionBar}>
        <View style={[styles.completionFill, { width: `${pct}%` as any }]} />
      </View>
      {pct < 80 && (
        <Text style={styles.completionHint}>
          Повний профіль допомагає нам знайти для вас кращі можливості для реінтеграції
        </Text>
      )}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function ProfileEditScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const { data: profile, isLoading } = useQuery({ queryKey: ['me'], queryFn: api.me.get });

  const [form, setForm] = useState<FormState | null>(null);
  const [settlementSearch, setSettlementSearch] = useState('');
  const [settlementResults, setSettlementResults] = useState<KatottgResult[]>([]);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise form once profile loads
  useEffect(() => {
    if (profile && !form) {
      setForm({
        phone: profile.phone || '',
        additionalPhone: profile.additional_phone || '',
        hasViber: profile.has_viber || false,
        hasWhatsapp: profile.has_whatsapp || false,
        hasSignal: profile.has_signal || false,
        facebookUrl: profile.facebook_url || '',
        education: profile.education || '',
        profession: profile.profession || '',
        katottgCode: profile.katottg_code || '',
        settlementName: profile.settlement_name || '',
        hromadaName: profile.hromada_name || '',
        raionName: profile.raion_name || '',
        oblastNameKatottg: profile.oblast_name_katottg || '',
      });
    }
  }, [profile]);

  // Debounced katottg search
  useEffect(() => {
    if (!settlementModalOpen) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (settlementSearch.length < 2) {
      setSettlementResults([]);
      return;
    }
    setSettlementLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const { results } = await api.katottg.search(settlementSearch);
        setSettlementResults(results);
      } catch {
        setSettlementResults([]);
      } finally {
        setSettlementLoading(false);
      }
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [settlementSearch, settlementModalOpen]);

  const mutation = useMutation({
    mutationFn: (data: FormState) => api.me.update({
      phone: data.phone.trim(),
      additionalPhone: data.additionalPhone.trim(),
      hasViber: data.hasViber,
      hasWhatsapp: data.hasWhatsapp,
      hasSignal: data.hasSignal,
      facebookUrl: data.facebookUrl.trim(),
      education: data.education,
      profession: data.profession.trim(),
      katottgCode: data.katottgCode,
      settlementName: data.settlementName,
      hromadaName: data.hromadaName,
      raionName: data.raionName,
      oblastNameKatottg: data.oblastNameKatottg,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      showAlert({
        title: 'Збережено',
        message: 'Профіль оновлено',
        buttons: [{ text: 'OK', onPress: () => router.back() }],
      });
    },
    onError: (err: any) => {
      showAlert({ title: 'Помилка', message: err.message || 'Не вдалося зберегти' });
    },
  });

  const handleSave = () => {
    if (!form) return;
    mutation.mutate(form);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => f ? { ...f, [key]: value } : f);
  };

  const selectSettlement = (item: KatottgResult) => {
    setForm(f => f ? {
      ...f,
      katottgCode: item.code,
      settlementName: item.name,
      hromadaName: item.hromada_name || '',
      raionName: item.raion_name || '',
      oblastNameKatottg: item.oblast_name || '',
    } : f);
    setSettlementModalOpen(false);
    setSettlementSearch('');
    setSettlementResults([]);
  };

  if (isLoading || !form) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b5793a" />
      </View>
    );
  }

  // Derived display values
  const fullName = [profile?.last_name, profile?.first_name, profile?.patronymic]
    .filter(Boolean).join(' ');
  const dob = profile?.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const locationDisplay = [form.settlementName, form.hromadaName, form.raionName, form.oblastNameKatottg]
    .filter(Boolean).join(', ');

  // Military rank from profile (from military_service if exists)
  const militaryRank = profile?.military_rank
    ? (MILITARY_RANK_LABELS[profile.military_rank] || profile.military_rank)
    : '';

  const initials = `${(profile?.first_name || '?').charAt(0)}${(profile?.last_name || '').charAt(0)}`.toUpperCase();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <Text style={styles.pageLabel}>// ПРОФІЛЬ</Text>
        <Text style={styles.pageTitle}>Мій профіль</Text>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.avatarName}>{fullName || 'Ім\'я не вказано'}</Text>
          {profile?.email ? <Text style={styles.avatarEmail}>{profile.email}</Text> : null}
        </View>

        {/* Completion bar */}
        <CompletionBar profile={profile} form={form} />

        {/* ── Personal info (read-only) ── */}
        <View style={styles.card}>
          <SectionHeader label="Особисті дані" icon={Check} color="#3b82f6" />
          <ReadOnlyField label="Повне ім'я" value={fullName} />
          <View style={styles.divider} />
          <ReadOnlyField label="Дата народження" value={dob} />
          {militaryRank ? (
            <>
              <View style={styles.divider} />
              <ReadOnlyField label="Військове звання" value={militaryRank} />
            </>
          ) : null}
        </View>

        {/* ── Location (editable via katottg) ── */}
        <View style={styles.card}>
          <SectionHeader label="Місце проживання" icon={MapPin} color="#22c55e" />
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSettlementModalOpen(true)}
            style={styles.row}
          >
            <View style={styles.rowBody}>
              <Text style={styles.fieldLabel}>Населений пункт</Text>
              <Text style={[styles.rowValue, !form.settlementName && styles.rowValueEmpty]}>
                {form.settlementName || 'Вибрати населений пункт...'}
              </Text>
              {locationDisplay && form.settlementName ? (
                <Text style={styles.rowSub}>{[form.hromadaName, form.raionName, form.oblastNameKatottg].filter(Boolean).join(', ')}</Text>
              ) : null}
            </View>
            <ChevronRight color="#8b8f96" size={18} />
          </TouchableOpacity>
        </View>

        {/* ── Contact (editable) ── */}
        <View style={styles.card}>
          <SectionHeader label="Контакти" icon={Phone} color="#b5793a" />

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Номер телефону</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={v => setField('phone', v)}
              placeholder="+380..."
              placeholderTextColor="#8b8f96"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Додатковий телефон</Text>
            <TextInput
              style={styles.input}
              value={form.additionalPhone}
              onChangeText={v => setField('additionalPhone', v)}
              placeholder="+380..."
              placeholderTextColor="#8b8f96"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Месенджери на основному номері</Text>
            <View style={styles.messengersRow}>
              <MessengerToggle label="Viber" active={form.hasViber} onToggle={() => setField('hasViber', !form.hasViber)} color="#7360f2" />
              <MessengerToggle label="WhatsApp" active={form.hasWhatsapp} onToggle={() => setField('hasWhatsapp', !form.hasWhatsapp)} color="#25d366" />
              <MessengerToggle label="Signal" active={form.hasSignal} onToggle={() => setField('hasSignal', !form.hasSignal)} color="#3a76f0" />
              {profile?.telegram_id ? (
                <View style={[styles.messengerBtn, { borderColor: '#2ca5e0', backgroundColor: 'rgba(44,165,224,0.12)' }]}>
                  <View style={[styles.messengerCheck, { backgroundColor: '#2ca5e0' }]}>
                    <Check color="#fff" size={10} />
                  </View>
                  <Text style={[styles.messengerLabel, { color: '#2ca5e0' }]}>Telegram</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Social (editable) ── */}
        <View style={styles.card}>
          <SectionHeader label="Соціальні мережі" icon={Globe} color="#8b5cf6" />
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={form.facebookUrl}
              onChangeText={v => setField('facebookUrl', v)}
              placeholder="https://facebook.com/..."
              placeholderTextColor="#8b8f96"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>

        {/* ── Professional info (editable) ── */}
        <View style={styles.card}>
          <SectionHeader label="Освіта та робота" icon={GraduationCap} color="#f59e0b" />
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Рівень освіти</Text>
            <View style={styles.educationRow}>
              {EDUCATION_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={1}
                  onPress={() => setField('education', form.education === opt.value ? '' : opt.value)}
                  style={[
                    styles.educationBtn,
                    form.education === opt.value && styles.educationBtnActive,
                  ]}
                >
                  <Text style={[
                    styles.educationBtnText,
                    form.education === opt.value && styles.educationBtnTextActive,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Професія / спеціальність</Text>
            <TextInput
              style={styles.input}
              value={form.profession}
              onChangeText={v => setField('profession', v)}
              placeholder="Наприклад: інженер, лікар, юрист..."
              placeholderTextColor="#8b8f96"
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Encourage message */}
        <View style={styles.encourageBox}>
          <Text style={styles.encourageTitle}>Чому це важливо?</Text>
          <Text style={styles.encourageText}>
            Повна інформація допомагає нам підбирати для вас програми підтримки, роботу та можливості для розвитку після служби. Ваші дані захищені та доступні лише членам організації.
          </Text>
        </View>

        {/* Save button */}
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.saveButton, mutation.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? <ActivityIndicator size="small" color="#0f1011" />
            : <Text style={styles.saveButtonText}>ЗБЕРЕГТИ ЗМІНИ</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      {/* Settlement search modal */}
      <Modal
        visible={settlementModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettlementModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Населений пункт</Text>
            <TouchableOpacity activeOpacity={1} onPress={() => setSettlementModalOpen(false)}>
              <X color="#8b8f96" size={22} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Search color="#8b8f96" size={18} />
            <TextInput
              style={styles.searchInput}
              value={settlementSearch}
              onChangeText={setSettlementSearch}
              placeholder="Пошук міста чи села..."
              placeholderTextColor="#8b8f96"
              autoFocus
              autoCapitalize="words"
            />
            {settlementSearch.length > 0 && (
              <TouchableOpacity activeOpacity={1} onPress={() => { setSettlementSearch(''); setSettlementResults([]); }}>
                <X color="#8b8f96" size={16} />
              </TouchableOpacity>
            )}
          </View>

          {settlementLoading ? (
            <ActivityIndicator style={{ marginTop: 32 }} color="#b5793a" />
          ) : settlementResults.length > 0 ? (
            <FlatList
              data={settlementResults}
              keyExtractor={item => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.resultRow}
                  onPress={() => selectSettlement(item)}
                >
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultSub}>
                    {[item.hromada_name, item.raion_name, item.oblast_name].filter(Boolean).join(', ')}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          ) : settlementSearch.length >= 2 ? (
            <Text style={styles.noResults}>Нічого не знайдено</Text>
          ) : (
            <Text style={styles.noResults}>Введіть назву для пошуку</Text>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#0f1011' },
  content: { padding: 16, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1011' },

  pageLabel: {
    color: '#b5793a', fontSize: 11, fontFamily: 'IBMPlexMono_400Regular',
    letterSpacing: 2, marginBottom: 4, marginTop: 4,
  },
  pageTitle: {
    color: '#e7e7e7', fontSize: 26, fontFamily: 'Inter_900Black', marginBottom: 20,
  },

  avatarSection: { alignItems: 'center', paddingBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(181,121,58,0.2)',
    borderWidth: 2, borderColor: 'rgba(181,121,58,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { color: '#b5793a', fontSize: 26, fontFamily: 'Inter_900Black' },
  avatarName: { color: '#e7e7e7', fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  avatarEmail: { color: '#8b8f96', fontSize: 13, fontFamily: 'Inter_400Regular' },

  completionWrap: {
    backgroundColor: '#141618', borderRadius: 12, borderWidth: 1,
    borderColor: '#1a1d20', padding: 14, marginBottom: 16,
  },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  completionLabel: { color: '#8b8f96', fontSize: 12, fontFamily: 'Inter_700Bold' },
  completionPct: { color: '#b5793a', fontSize: 12, fontFamily: 'IBMPlexMono_600SemiBold' },
  completionBar: { height: 4, backgroundColor: '#1a1d20', borderRadius: 2, overflow: 'hidden' },
  completionFill: { height: 4, backgroundColor: '#b5793a', borderRadius: 2 },
  completionHint: {
    color: '#6b7280', fontSize: 11, fontFamily: 'Inter_400Regular',
    marginTop: 8, lineHeight: 16,
  },

  card: {
    backgroundColor: '#141618', borderRadius: 12, borderWidth: 1,
    borderColor: '#1a1d20', marginBottom: 14, overflow: 'hidden',
  },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1a1d20',
    backgroundColor: '#0f1011',
  },
  sectionIcon: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  sectionTitle: { color: '#8b8f96', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase' },

  readOnlyField: { paddingHorizontal: 14, paddingVertical: 12 },
  fieldLabel: { color: '#6b7280', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  readOnlyValue: { color: '#e7e7e7', fontSize: 15, fontFamily: 'Inter_400Regular' },
  readOnlyEmpty: { color: '#4b5563', fontStyle: 'italic' },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  rowBody: { flex: 1 },
  rowValue: { color: '#e7e7e7', fontSize: 15, fontFamily: 'Inter_400Regular', marginTop: 2 },
  rowValueEmpty: { color: '#4b5563', fontStyle: 'italic' },
  rowSub: { color: '#6b7280', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },

  inputGroup: { paddingHorizontal: 14, paddingVertical: 12 },
  input: {
    backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#1a1d20',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    color: '#e7e7e7', fontSize: 15, fontFamily: 'Inter_400Regular', marginTop: 6,
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#1a1d20', marginLeft: 14 },

  messengersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  messengerBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#1a1d20', backgroundColor: '#0f1011', gap: 5,
  },
  messengerCheck: {
    width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  messengerLabel: { color: '#6b7280', fontSize: 13, fontFamily: 'Inter_400Regular' },

  educationRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  educationBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 8, borderWidth: 1,
    borderColor: '#1a1d20', backgroundColor: '#0f1011', alignItems: 'center',
  },
  educationBtnActive: { borderColor: '#b5793a', backgroundColor: 'rgba(181,121,58,0.12)' },
  educationBtnText: { color: '#6b7280', fontSize: 13, fontFamily: 'Inter_400Regular' },
  educationBtnTextActive: { color: '#b5793a', fontFamily: 'Inter_700Bold' },

  encourageBox: {
    backgroundColor: 'rgba(181,121,58,0.08)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(181,121,58,0.2)',
    padding: 14, marginBottom: 20,
  },
  encourageTitle: { color: '#b5793a', fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  encourageText: { color: '#8b8f96', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },

  saveButton: {
    backgroundColor: '#b5793a', borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#0f1011', fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 1.5 },

  // Settlement modal
  modalContainer: { flex: 1, backgroundColor: '#0f1011' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a1d20',
  },
  modalTitle: { color: '#e7e7e7', fontSize: 17, fontFamily: 'Inter_700Bold' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 12, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#141618', borderRadius: 10, borderWidth: 1, borderColor: '#1a1d20',
  },
  searchInput: { flex: 1, color: '#e7e7e7', fontSize: 15, fontFamily: 'Inter_400Regular' },
  resultRow: { paddingHorizontal: 16, paddingVertical: 13 },
  resultName: { color: '#e7e7e7', fontSize: 15, fontFamily: 'Inter_400Regular' },
  resultSub: { color: '#6b7280', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  noResults: {
    color: '#4b5563', fontSize: 14, fontFamily: 'Inter_400Regular',
    textAlign: 'center', marginTop: 40,
  },
});
