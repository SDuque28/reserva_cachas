import { Stack } from 'expo-router';

export default function CanchasLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#1e3a5f',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Canchas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle de cancha' }} />
    </Stack>
  );
}
