import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getReservas } from '@/services/reservas.service';
import { Reserva } from '@/services/types';

function formatHora(hora?: string) {
  return hora ? hora.slice(0, 5) : '--:--';
}

function getEstadoStyle(estado?: string) {
  const esActiva = estado === 'ACTIVA';

  return {
    badge: esActiva ? styles.estadoActiva : styles.estadoCancelada,
    text: esActiva ? styles.estadoActivaText : styles.estadoCanceladaText,
    label: estado ?? 'SIN ESTADO',
  };
}

export default function ReservasScreen() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarReservas = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const data = await getReservas();
      setReservas(data);
    } catch {
      setError('No se pudo cargar el historial de reservas. Verifica tu conexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarReservas();
    }, [cargarReservas])
  );

  function renderReserva({ item }: { item: Reserva }) {
    const estadoStyle = getEstadoStyle(item.estado);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/reservas/[id]',
            params: {
              id: item.id.toString(),
              reservaData: JSON.stringify(item),
            },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardCancha} numberOfLines={1}>
            {item.canchaNombre ?? item.cancha?.nombre ?? 'Reserva sin cancha'}
          </Text>
          <View style={[styles.estadoBadge, estadoStyle.badge]}>
            <Text style={[styles.estadoText, estadoStyle.text]}>{estadoStyle.label}</Text>
          </View>
        </View>

        <Text style={styles.cardSede} numberOfLines={1}>
          {item.sedeNombre ?? item.cancha?.sede?.nombre ?? 'Sede sin asignar'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{item.fecha}</Text>
          <Text style={styles.cardHorario}>
            {formatHora(item.horaInicio ?? item.horario?.horaInicio)} -{' '}
            {formatHora(item.horaFin ?? item.horario?.horaFin)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => cargarReservas()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reservas.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Sin reservas</Text>
          <Text style={styles.emptyText}>
            Aun no has realizado ninguna reserva. Ve a Canchas para hacer tu primera reserva.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReserva}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => cargarReservas(true)}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </View>
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  cardCancha: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardSede: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a5f',
  },
  cardHorario: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  estadoBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  estadoActiva: {
    backgroundColor: '#dcfce7',
  },
  estadoActivaText: {
    color: '#166534',
  },
  estadoCancelada: {
    backgroundColor: '#fee2e2',
  },
  estadoCanceladaText: {
    color: '#b91c1c',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
