import { ReactNode, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface PrivateProps {
  children: ReactNode;
}

export function Private({ children }: PrivateProps): any {
  const { signed, loadingAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loadingAuth) {
    return <div></div>;
  }

  if (!signed) {
    return navigate("/login");
  }

  return children;
}
