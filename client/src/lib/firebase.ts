import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`, // Use Firebase's default domain
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account", // Force account selection even if one account is available
});

/**
 * Sign in with Google using popup
 * After successful authentication with Firebase, it sends the user data
 * to our backend to create or update the user in our database.
 */
export const signInWithGoogle = async () => {
  try {
    console.log("Attempting to sign in with Google popup...");
    // Check if Firebase is properly initialized
    if (!auth || !googleProvider) {
      console.error("Firebase authentication not properly initialized");
      throw new Error("Firebase authentication not properly initialized");
    }

    console.log(
      "Firebase auth and provider are available, proceeding with popup",
    );
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Sign in successful", result.user);

    // Send Firebase user info to our backend
    console.log("Calling backend API to complete authentication...");
    // Use relative URL which will respect the current protocol (http or https)
    const response = await fetch("/api/auth/firebase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        googleId: result.user.uid,
        email: result.user.email,
        fullName: result.user.displayName,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend authentication failed", errorText);
      throw new Error("Failed to authenticate with server: " + errorText);
    }

    console.log("Backend authentication successful");
    const userData = await response.json();

    // Check if user needs to complete profile (no Instagram)
    if (!userData.user.instagram || userData.user.instagram.trim() === "") {
      console.log(
        "User needs to complete profile - redirecting to complete-profile",
      );
      window.location.href = "/complete-profile";
    } else {
      window.location.href = "/";
    }
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);

    // Handle popup closed by user silently - don't log as error
    if (error.code === "auth/popup-closed-by-user") {
      console.log("User closed the popup window");
      // Return null instead of throwing to avoid error propagation
      return null;
    }

    if (error.code === "auth/configuration-not-found") {
      throw new Error(
        "Firebase domain configuration needed. Please ensure your Replit domain is added to the Firebase authorized domains list.",
      );
    }

    // For other errors, still throw them
    throw error;
  }
};

/**
 * Handle redirect result when user returns after authentication redirect
 */
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Redirect result detected", result.user);

      // Send Firebase user info to our backend
      // Use relative URL which will respect the current protocol (http or https)
      const response = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleId: result.user.uid,
          email: result.user.email,
          fullName: result.user.displayName,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Backend authentication failed after redirect");
        return null;
      }

      const userData = await response.json();

      // Check if user needs to complete profile (no Instagram)
      if (!userData.user.instagram || userData.user.instagram.trim() === "") {
        console.log(
          "User needs to complete profile - redirecting to complete-profile",
        );
        window.location.href = "/complete-profile";
      } else {
        window.location.href = "/";
      }

      return result.user;
    }
    return null;
  } catch (error: any) {
    console.error("Error handling redirect:", error);

    if (error.code === "auth/configuration-not-found") {
      console.log(
        "Firebase configuration error: Make sure to add your Replit domain to Firebase authorized domains",
      );
    }
    return null;
  }
};

/**
 * Sign out from Firebase
 */
export const signOutFromFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error signing out from Firebase:", error);
    throw error;
  }
};
