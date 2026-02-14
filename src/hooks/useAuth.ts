"use client";

import { useState, useEffect, useCallback } from "react";
import { type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { onAuthChange, signIn, signUp, signOut, resetPassword } from "@/lib/firebase/auth";
import type { User } from "@/types";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(getClientDb(), "users", firebaseUser.uid));
        const profile = snap.exists()
          ? ({ uid: firebaseUser.uid, ...snap.data() } as User)
          : null;
        setState({ firebaseUser, profile, loading: false });
      } else {
        setState({ firebaseUser: null, profile: null, loading: false });
      }
    });
    return unsubscribe;
  }, []);

  const handleSignIn = useCallback(
    (email: string, password: string) => signIn(email, password),
    []
  );

  const handleSignUp = useCallback(
    (email: string, password: string, name: string) =>
      signUp(email, password, name),
    []
  );

  const handleSignOut = useCallback(() => signOut(), []);

  const handleResetPassword = useCallback(
    (email: string) => resetPassword(email),
    []
  );

  return {
    user: state.firebaseUser,
    profile: state.profile,
    loading: state.loading,
    isAdmin: state.profile?.role === "ADMIN",
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
  };
}
