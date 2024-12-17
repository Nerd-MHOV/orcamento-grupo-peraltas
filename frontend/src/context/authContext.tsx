import { createContext, useEffect, useState } from "react";
import { useApi } from "../hooks/api/api";

export const AuthContext = createContext<any>({});

interface ChildrenProps {
  children: any;
}

export const AuthContextProvider: React.FC<ChildrenProps> = ({ children }) => {
  const api = useApi();
  const [userLogin, setUserLogin] = useState<String | null>(null);
  const [loading, setLoading] = useState(true);

  const validateToken = async () => {
    const storageData = localStorage.getItem("authToken");
    if (storageData) {
      await api
        .auth.validateToken()
        .then((data) => {
          if (data.id) setUserLogin(data.id);
          setLoading(false);
        })
        .catch((err) => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const setToken = (token: string, id: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", id);
  };

  const login = async (user: string, passwd: string) => {
    try {
      const data = await api.auth.login(user, passwd);
      if (data.user && data.token) {
        setUserLogin(data.user.id);
        setToken(data.token, data.user.id);
        return data.message;
      }
      return {
        message: "Usuario ou senha incorretos!",
        type: "error",
      };
    } catch (err) {
      return {
        type: "error",
        message: "Servidor fora do ar",
      };
    }
  };

  const logout = async () => {
    setUserLogin(null);
    setToken("", "");
  };

  useEffect(() => {
    const recoveredUser = localStorage.getItem("authUser");

    validateToken();
    if (recoveredUser) {
      setUserLogin(recoveredUser);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authenticated: !!userLogin,
        userLogin,
        login,
        logout,
        validateToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
