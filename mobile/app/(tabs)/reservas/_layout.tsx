import { Stack } from 'expo-router';

export default function ReservasLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#1e3a5f',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mis Reservas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle de reserva' }} />
    </Stack>
  );
}
