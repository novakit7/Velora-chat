import { createContext, useState, useEffect } from "react";
import api from "../api/axois";
import Loader from "../components/common/Loader";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user");
      setUser(res.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Listen for session expiration from axios
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;