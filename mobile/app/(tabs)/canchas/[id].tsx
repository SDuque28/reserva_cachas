import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCanchaById, getHorariosDisponibles } from '@/services/canchas.service';
import { crearReserva } from '@/services/reservas.service';
import { Cancha, Horario } from '@/services/types';

function fechaHoy(): string {
  return new Date().toISOString().split('T')[0];
}

export default function DetalleCanchaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const canchaId = Number(id);

  const [cancha, setCancha] = useState<Cancha | null>(null);
  const [loadingCancha, setLoadingCancha] = useState(true);
  const [errorCancha, setErrorCancha] = useState<string | null>(null);

  const [fecha, setFecha] = useState(fechaHoy());
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState<string | null>(null);

  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);

  // Modal de confirmación de reserva
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<Horario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reservando, setReservando] = useState(false);

  // Cargar datos de la cancha
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getCanchaById(canchaId);
        setCancha(data);
        navigation.setOptions({ title: data.nombre });
      } catch {
        setErrorCancha('No se pudo cargar la información de la cancha.');
      } finally {
        setLoadingCancha(false);
      }
    }
    cargar();
  }, [canchaId]);

  // Cargar nota personal desde AsyncStorage
  useEffect(() => {
    async function cargarNota() {
      try {
        const stored = await AsyncStorage.getItem(`nota_cancha_${canchaId}`);
        if (stored !== null) setNota(stored);
      } catch {
        // ignorar error de lectura de nota
      }
    }
    cargarNota();
  }, [canchaId]);

  // Guardar nota con debounce al cambiar
  const guardarNota = useCallback(
    async (texto: string) => {
      setGuardandoNota(true);
      try {
        await AsyncStorage.setItem(`nota_cancha_${canchaId}`, texto);
      } catch {
        // ignorar error de escritura de nota
      } finally {
        setGuardandoNota(false);
      }
    },
    [canchaId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      guardarNota(nota);
    }, 600);
    return () => clearTimeout(timer);
  }, [nota, guardarNota]);

  // Cargar horarios disponibles
  const cargarHorarios = useCallback(async () => {
    if (!fecha) return;
    setLoadingHorarios(true);
    setErrorHorarios(null);
    setHorarios([]);
    try {
      const data = await getHorariosDisponibles(canchaId, fecha);
      setHorarios(data);
    } catch {
      setErrorHorarios('No se pudieron cargar los horarios disponibles.');
    } finally {
      setLoadingHorarios(false);
    }
  }, [canchaId, fecha]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  function seleccionarHorario(h: Horario) {
    setHorarioSeleccionado(h);
    setModalVisible(true);
  }

  async function confirmarReserva() {
    if (!horarioSeleccionado) return;
    setReservando(true);
    try {
      await crearReserva({ canchaId, horarioId: horarioSeleccionado.id, fecha });
      setModalVisible(false);
      Alert.alert('Reserva creada', `Reserva confirmada para el ${fecha} de ${horarioSeleccionado.horaInicio} a ${horarioSeleccionado.horaFin}.`);
      cargarHorarios();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo crear la reserva. Intenta de nuevo.';
      Alert.alert('Error al reservar', msg);
    } finally {
      setReservando(false);
    }
  }

  if (loadingCancha) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (errorCancha || !cancha) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorCancha ?? 'Cancha no encontrada.'}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Imagen */}
        {cancha.imagenUrl ? (
          <Image source={{ uri: cancha.imagenUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Info */}
          <Text style={styles.nombre}>{cancha.nombre}</Text>
          <Text style={styles.meta}>
            {cancha.sede?.nombre} · {cancha.tipo?.nombre}
          </Text>
          <Text style={styles.descripcion}>{cancha.descripcion}</Text>
          <Text style={styles.capacidad}>Capacidad: {cancha.capacidad} personas</Text>
          <Text style={styles.direccion}>{cancha.sede?.direccion}</Text>

          {/* Disponibilidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>

            <Text style={styles.fieldLabel}>Fecha</Text>
            <TextInput
              style={styles.dateInput}
              value={fecha}
              onChangeText={setFecha}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              keyboardType={Platform.OS === 'ios' ? 'default' : 'numeric'}
              maxLength={10}
            />

            <TouchableOpacity style={styles.buscarButton} onPress={cargarHorarios}>
              <Text style={styles.buscarButtonText}>Buscar horarios</Text>
            </TouchableOpacity>

            {loadingHorarios ? (
              <ActivityIndicator color="#2563eb" style={{ marginTop: 16 }} />
            ) : errorHorarios ? (
              <Text style={styles.errorText}>{errorHorarios}</Text>
            ) : horarios.length === 0 ? (
              <Text style={styles.emptyText}>No hay horarios disponibles para esta fecha.</Text>
            ) : (
              <View style={styles.horariosGrid}>
                {horarios.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    style={styles.horarioChip}
                    onPress={() => seleccionarHorario(h)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.horarioText}>
                      {h.horaInicio} – {h.horaFin}
                    </Text>
                    <Text style={styles.horarioDia}>{h.diaSemana}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Nota personal */}
          <View style={styles.section}>
            <View style={styles.notaHeader}>
              <Text style={styles.sectionTitle}>Mi nota personal</Text>
              {guardandoNota && (
                <Text style={styles.guardandoText}>Guardando...</Text>
              )}
            </View>
            <TextInput
              style={styles.notaInput}
              value={nota}
              onChangeText={setNota}
              multiline
              placeholder="Escribe recordatorios o comentarios sobre esta cancha..."
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de confirmación de reserva */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar reserva</Text>
            {horarioSeleccionado && (
              <>
                <Text style={styles.modalBody}>
                  <Text style={styles.modalBold}>{cancha.nombre}</Text>
                  {'\n'}Fecha: {fecha}
                  {'\n'}Horario: {horarioSeleccionado.horaInicio} – {horarioSeleccionado.horaFin}
                  {'\n'}Sede: {cancha.sede?.nombre}
                </Text>
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
                disabled={reservando}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, reservando && styles.buttonDisabled]}
                onPress={confirmarReserva}
                disabled={reservando}
              >
                {reservando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Reservar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    width: '100%',
    height: 220,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  content: {
    padding: 20,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 6,
  },
  capacidad: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  direccion: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 10,
  },
  buscarButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  buscarButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  horariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  horarioChip: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 110,
  },
  horarioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  horarioDia: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  notaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  guardandoText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notaInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    lineHeight: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  modalBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBold: {
    fontWeight: '700',
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
