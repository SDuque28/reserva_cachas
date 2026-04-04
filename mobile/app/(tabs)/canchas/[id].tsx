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
import { getHorariosDisponibles } from '@/services/canchas.service';
import { crearReserva } from '@/services/reservas.service';
import { Cancha, Horario } from '@/services/types';

function fechaHoy(): string {
  return new Date().toISOString().split('T')[0];
}

function parseCanchaData(canchaData?: string | string[]): Cancha | null {
  if (typeof canchaData !== 'string') return null;

  try {
    return JSON.parse(canchaData) as Cancha;
  } catch {
    return null;
  }
}

export default function DetalleCanchaScreen() {
  const { id, canchaData } = useLocalSearchParams<{ id: string; canchaData?: string }>();
  const navigation = useNavigation();
  const canchaId = Number(id);

  const [cancha] = useState<Cancha | null>(() => parseCanchaData(canchaData));
  const [errorCancha, setErrorCancha] = useState<string | null>(null);

  const [fecha, setFecha] = useState(fechaHoy());
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState<string | null>(null);

  const [horarioSeleccionado, setHorarioSeleccionado] = useState<Horario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reservando, setReservando] = useState(false);

  useEffect(() => {
    if (!cancha) {
      setErrorCancha('No se recibieron los datos de la cancha seleccionada.');
      return;
    }

    navigation.setOptions({ title: cancha.nombre });
  }, [cancha, navigation]);

  const cargarHorarios = useCallback(async () => {
    setLoadingHorarios(true);
    setErrorHorarios(null);
    setHorarios([]);

    try {
      const data = await getHorariosDisponibles(canchaId);
      setHorarios(data);
    } catch {
      setErrorHorarios('No se pudieron cargar los horarios disponibles.');
    } finally {
      setLoadingHorarios(false);
    }
  }, [canchaId]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  function seleccionarHorario(horario: Horario) {
    setHorarioSeleccionado(horario);
    setModalVisible(true);
  }

  async function confirmarReserva() {
    if (!horarioSeleccionado || !cancha) return;

    setReservando(true);
    try {
      await crearReserva({ canchaId, horarioId: horarioSeleccionado.id, fecha });
      setModalVisible(false);
      Alert.alert(
        'Reserva creada',
        `Reserva confirmada para el ${fecha} de ${horarioSeleccionado.horaInicio} a ${horarioSeleccionado.horaFin}.`
      );
      cargarHorarios();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Ese horario ya esta reservado o no se pudo crear la reserva.';
      Alert.alert('Error al reservar', msg);
    } finally {
      setReservando(false);
    }
  }

  if (errorCancha || !cancha) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorCancha ?? 'Cancha no encontrada.'}</Text>
      </View>
    );
  }

  const sedeNombre = cancha.sedeNombre ?? cancha.sede?.nombre ?? 'Sede sin asignar';
  const tipoNombre = cancha.tipoNombre ?? cancha.tipo?.nombre ?? 'Cancha';
  const inicialCancha = cancha.nombre.trim().charAt(0).toUpperCase() || 'C';

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {cancha.imagenUrl ? (
          <Image source={{ uri: cancha.imagenUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>{inicialCancha}</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.nombre}>{cancha.nombre}</Text>
          <Text style={styles.meta}>
            {sedeNombre} - {tipoNombre}
          </Text>
          <Text style={styles.descripcion}>{cancha.descripcion}</Text>

          {cancha.capacidad > 0 ? (
            <Text style={styles.capacidad}>Capacidad: {cancha.capacidad} personas</Text>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horarios disponibles</Text>

            <Text style={styles.fieldLabel}>Fecha de reserva</Text>
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
              <Text style={styles.buscarButtonText}>Actualizar horarios</Text>
            </TouchableOpacity>

            {loadingHorarios ? (
              <ActivityIndicator color="#2563eb" style={{ marginTop: 16 }} />
            ) : errorHorarios ? (
              <Text style={styles.errorText}>{errorHorarios}</Text>
            ) : horarios.length === 0 ? (
              <Text style={styles.emptyText}>No hay horarios disponibles para esta cancha.</Text>
            ) : (
              <View style={styles.horariosGrid}>
                {horarios.map((horario) => (
                  <TouchableOpacity
                    key={horario.id}
                    style={styles.horarioChip}
                    onPress={() => seleccionarHorario(horario)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.horarioText}>
                      {horario.horaInicio.slice(0, 5)} - {horario.horaFin.slice(0, 5)}
                    </Text>
                    <Text style={styles.horarioDia}>{horario.diaSemana}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar reserva</Text>

            {horarioSeleccionado ? (
              <Text style={styles.modalBody}>
                <Text style={styles.modalBold}>{cancha.nombre}</Text>
                {'\n'}Fecha: {fecha}
                {'\n'}Horario: {horarioSeleccionado.horaInicio.slice(0, 5)} -{' '}
                {horarioSeleccionado.horaFin.slice(0, 5)}
                {'\n'}Dia: {horarioSeleccionado.diaSemana}
                {'\n'}Sede: {sedeNombre}
              </Text>
            ) : null}

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
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#1d4ed8',
    fontSize: 40,
    fontWeight: '800',
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
