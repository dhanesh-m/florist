"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0i08T4KLqn6mpMXgcVRpuCbHTYH8b8hA",
  authDomain: "floral-doctor.firebaseapp.com",
  projectId: "floral-doctor",
  storageBucket: "floral-doctor.firebasestorage.app",
  messagingSenderId: "943177461509",
  appId: "1:943177461509:web:e104a7f9aae6483e4fd16c",
  measurementId: "G-DMZPPFM8XZ",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

/** Google Analytics (client-only; safe for Next.js — no SSR). */
if (typeof window !== "undefined") {
  void import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((yes) => {
      if (yes) getAnalytics(app);
    });
  });
}
