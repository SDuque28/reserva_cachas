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
      setError('No se pudo cargar el historial de reservas. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recargar cada vez que el tab recibe el foco
  useFocusEffect(
    useCallback(() => {
      cargarReservas();
    }, [cargarReservas])
  );

  function renderReserva({ item }: { item: Reserva }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/(tabs)/reservas/${item.id}`)}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardDate}>{item.fecha}</Text>
          <Text style={styles.cardHorario}>
            {item.horario?.horaInicio} – {item.horario?.horaFin}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardCancha} numberOfLines={1}>
            {item.cancha?.nombre}
          </Text>
          <Text style={styles.cardSede} numberOfLines={1}>
            {item.cancha?.sede?.nombre}
          </Text>
          <Text style={styles.cardTipo}>{item.cancha?.tipo?.nombre}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
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
            Aún no has realizado ninguna reserva. Ve a Canchas para hacer tu primera reserva.
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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 14,
    alignItems: 'center',
    minWidth: 72,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a5f',
    textAlign: 'center',
  },
  cardHorario: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  cardRight: {
    flex: 1,
  },
  cardCancha: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardSede: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 2,
  },
  cardTipo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chevron: {
    fontSize: 22,
    color: '#d1d5db',
    marginLeft: 8,
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
