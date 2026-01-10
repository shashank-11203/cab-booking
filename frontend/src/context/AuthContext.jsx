import { createContext, useContext, useState, useEffect } from "react";
import { getMe, logoutUser } from "../utils/authApiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await getMe();

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("fetchUser error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchUser(), 300);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);