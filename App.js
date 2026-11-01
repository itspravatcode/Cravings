import 'expo-router/entry';
import { Stack } from 'expo-router';

// Bootstraps Expo Router: importing the router entry calls
// `renderRootComponent` → `registerRootComponent`, which registers the app
// root with AppRegistry as "main". Without this, AppRegistry keeps the
// "App entry not found" fallback and the app never launches.
//
// The actual root component is `app/_layout.tsx` (providers + <Stack />),
// rendered by Expo Router's root entry.
export default function App() {
  return <Stack />;
}