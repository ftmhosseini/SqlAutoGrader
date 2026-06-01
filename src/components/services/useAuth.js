import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUser } from "../model/users";
import userSession from "./UserSession";

export function useAuth(readOnly = false) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(userSession.role || null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) await currentUser.reload();
      if (currentUser && currentUser.emailVerified) {
        if (!userSession.role) {
          const userData = await getUser(currentUser.uid);
          if (userData) userSession.set(userData);
        }
        setRole(userSession.role);
      } else if (currentUser && !currentUser.emailVerified) {
        setLoading(false);
        return;
      } else {
        if (!readOnly) {
          userSession.clear();
          setRole(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [readOnly]);

  return { loading, role };
}
