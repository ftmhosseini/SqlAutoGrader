import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUser } from "../model/users";
import userSession from "./UserSession";

export function useAuth() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) await currentUser.reload();
      if (currentUser && currentUser.emailVerified) {
        if (!userSession.role) {
          const userData = await getUser(currentUser.uid);
          if (userData) userSession.set(userData);
        }
      } else if (currentUser && !currentUser.emailVerified) {
        // signed in but not verified — don't set role, don't clear session
        setLoading(false);
        return;
      } else {
        userSession.clear();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { loading };
}
