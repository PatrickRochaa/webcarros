import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { FiUser, FiLogIn, FiChevronDown } from "react-icons/fi"; // Importando o ícone da seta
import logoImg from "../../assets/logo.svg";
import Toast from "react-hot-toast";
import { auth } from "../../services/firebaseConnection";
import { signOut } from "firebase/auth";

export function Header() {
  const { signed, loadingAuth } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar a abertura do menu
  const menuRef = useRef<HTMLDivElement | null>(null); // Ref para o menu

  const location = useLocation(); // Obtém a localização atual para verificar a página

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev); // Alterna a abertura do menu
  };

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // UseEffect para monitorar o estado do menu
  useEffect(() => {
    const slide = document.querySelector(".swiper");

    if (slide) {
      if (menuOpen) {
        // Quando o menu está aberto, adiciona a classe "negativo"
        slide.classList.add("negativo");
      } else {
        // Quando o menu está fechado, remove a classe "negativo"
        slide.classList.remove("negativo");
      }
    }
  }, [menuOpen]); // A dependência é o estado menuOpen

  // Verifica se o usuário está em uma das páginas especificadas
  const isOnDashboard = location.pathname === "/dashboard";
  const isOnNewCar = location.pathname === "/dashboard/new";

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
      <header className="flex w-full max-w-5xl items-center justify-between px-4 mx-auto">
        <Link to="/">
          <img src={logoImg} alt="Logo do site" />
        </Link>

        {!loadingAuth &&
          signed && ( // Se o usuário estiver logado
            <>
              <div className="relative">
                <div
                  className="border-2 rounded-full p-1 border-gray-900 z-10 w-10 flex items-center justify-center mb-2 cursor-pointer"
                  onClick={handleToggleMenu} // Abre o menu ao clicar
                >
                  <FiUser size={20} color="#000" />
                  <FiChevronDown size={16} color="#000" className="ml-1" />{" "}
                  {/* Adicionando a seta para baixo */}
                </div>

                {/* Menu */}
                {menuOpen && (
                  <div
                    id="opened"
                    ref={menuRef} // Aplica a referência para detectar cliques fora
                    className="absolute right-0 bg-white border border-gray-300 shadow-lg rounded-md mt-2 p-2 z-10"
                  >
                    {isOnDashboard || isOnNewCar ? ( // Se estiver no Dashboard ou na página de Cadastrar Carro
                      <Link
                        to="/"
                        className="block px-4 py-2 hover:bg-gray-100 z-50"
                        onClick={() => setMenuOpen(false)} // Fecha o menu ao clicar
                      >
                        Inicio
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100 z-50"
                          onClick={() => setMenuOpen(false)} // Fecha o menu ao clicar
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/new"
                          className="block px-4 py-2 hover:bg-gray-100 z-50"
                          onClick={() => setMenuOpen(false)} // Fecha o menu ao clicar
                        >
                          Cadastrar Carro
                        </Link>
                      </>
                    )}
                    {/* Link de sair só aparece se não estiver no Dashboard ou na página de Cadastrar Carro */}
                    {!isOnDashboard && !isOnNewCar && (
                      <Link
                        to="/"
                        className="block px-4 py-2 text-red-600 hover:bg-gray-100 z-50"
                        onClick={handleLogout} // Chama a função de logout
                      >
                        Sair
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

        {!loadingAuth &&
          !signed && ( // Se o usuário estiver deslogado
            <Link to="/login">
              <div className="border-2 rounded-full p-1 border-gray-900">
                <FiLogIn size={20} color="#000" />
              </div>
            </Link>
          )}
      </header>
    </div>
  );
}

// Função para deslogar
async function handleLogout() {
  Toast.success("Você saiu! Até breve."); // Notificação de logout
  await signOut(auth); // Faz o logout
}
