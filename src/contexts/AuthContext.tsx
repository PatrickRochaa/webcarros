import { ReactNode, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConnection";

interface AuthProviderProps {
  children: ReactNode;
}

// tipagem do que vai ser exportado
type AuthContextData = {
  signed: boolean;
  loadingAuth: boolean;
  user: UserProps | null;
  handleInfoUser: ({ uid, name, email }: UserProps) => void;
};

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  //observenado se tem usuario ta logado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        //usuario logado
        setUser({
          uid: user.uid,
          name: user.displayName,
          email: user?.email,
        });
        setLoadingAuth(false);
      } else {
        //sem logado
        setUser(null);
        setLoadingAuth(false);
      }
    });
    //demontando olheiro
    return () => {
      unsub();
    };
  }, []);

  //funçao de refresh nos dados do usuario
  function handleInfoUser({ uid, name, email }: UserProps) {
    setUser({
      uid,
      name,
      email,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        loadingAuth,
        handleInfoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
