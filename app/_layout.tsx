import { useUserSync } from "@/hooks/useUserSync";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Redirect, Slot, usePathname } from "expo-router";
import "../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function AuthenticatedApp() {
  useUserSync();
  return <Slot />;
}

function AuthGate() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const isAuthRoute = pathname === "/sign-in" || pathname === "/sign-up";

  if (!isLoaded) return null;
  if (!isSignedIn && !isAuthRoute) return <Redirect href="/sign-in" />;

  if (isSignedIn && isAuthRoute) return <Redirect href="/" />;

  return isSignedIn ? <AuthenticatedApp /> : <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthGate />
    </ClerkProvider>
  );
}
