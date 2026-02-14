import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getClientAuth, getClientDb } from "./client";
import type { User } from "@/types";

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<FirebaseUser> {
  const { user } = await createUserWithEmailAndPassword(getClientAuth(), email, password);
  await sendEmailVerification(user);

  const userData: Omit<User, "uid"> = {
    email,
    name,
    role: "USER",
    marketingOptIn: false,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(getClientDb(), "users", user.uid), userData);

  return user;
}

export async function signIn(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const { user } = await signInWithEmailAndPassword(getClientAuth(), email, password);
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getClientAuth());
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getClientAuth(), email);
}

export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(getClientAuth(), callback);
}
