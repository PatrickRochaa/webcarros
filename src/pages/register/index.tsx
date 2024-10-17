import { useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.svg";
import { Container } from "../../components/container/index";
import { Input } from "../../components/input/index";

import { AuthContext } from "../../contexts/AuthContext";
import { auth } from "../../services/firebaseConnection";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Toast from "react-hot-toast";

// schema de validaçao do input email e senha
const schema = z.object({
  email: z
    .string()
    .email("Insira um email válido")
    .min(1, "Email é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres.")
    .min(1, "Senha é obrigatório"),
});

//tipagem para o formulario seguir o schema de validaçao
type FormData = z.infer<typeof schema>;

export function Register() {
  const { handleInfoUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  // funçao para registrar usuario
  async function onSubmit(data: FormData) {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (user) => {
        await updateProfile(user.user, {
          displayName: data.name,
        });

        handleInfoUser({
          uid: user.user.uid,
          name: data.name,
          email: data.email,
        });
        //console.log("cadastrado");
        Toast.success("Usuário cadastrado com sucesso!");
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // caso user esteja logado e tente abrir
  //a pagina de login ou registro vai ser deslogado automicamente
  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }
    handleLogout();
  }, []);

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className="mb-6 max-w-sm w-full">
          <img src={logoImg} alt="Logo site" className="w-full" />
        </Link>

        <form
          className="bg-white max-w-xl w-full rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Input
              type="text"
              placeholder="Informe seu nome completo"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="email"
              placeholder="Informe seu email"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>
          <div className="mb-3">
            <Input
              type="password"
              placeholder="Informe sua senha"
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>
          <button
            type="submit"
            className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium"
          >
            Cadastrar
          </button>
        </form>

        <p className="text-black my-1">
          Já possui uma conta?{" "}
          <Link to={"/login"} className="hover:underline transition-all">
            <strong>Faça login.</strong>
          </Link>
        </p>
      </div>
    </Container>
  );
}
