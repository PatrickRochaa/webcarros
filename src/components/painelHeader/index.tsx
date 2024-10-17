import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";
import Toast from "react-hot-toast";

// Função para deslogar
export async function handleLogout() {
  Toast.success("Você saiu! Até breve.");
  await signOut(auth);
}

export function DashboardHeader() {
  const location = useLocation(); // Pega o caminho atual da URL

  return (
    <header className="w-full flex items-center h-10 bg-red-500 rounded-lg text-white gap-4 px-4 mb-4">
      {/* Só mostra o link para o dashboard se não estiver na página de dashboard */}
      {location.pathname !== "/dashboard" && (
        <Link to="/dashboard">Dashboard</Link>
      )}

      {/* Só mostra o link de cadastrar carro se não estiver na página de cadastro */}
      {location.pathname !== "/dashboard/new" && (
        <Link to="/dashboard/new">Cadastrar Carro</Link>
      )}

      <button className="ml-auto font-medium" onClick={handleLogout}>
        Sair da conta
      </button>
    </header>
  );
}
