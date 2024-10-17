import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.svg";
import { Container } from "../../components/container";
import { Input } from "../../components/input";
import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";

import Toast from "react-hot-toast";

// schema de validaçao do input email e senha
const schema = z.object({
  email: z
    .string()
    .email("Insira um email válido")
    .min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatório"),
});

//tipagem para o formulario seguir o schema de validaçao
type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  //funçao para logar
  function onSubmit(data: FormData) {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => {
        //console.log("logado");
        Toast.success("Seja bem vindo!");
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        //console.log("erro ao logar");
        // console.log(error);
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
            Acessar
          </button>
        </form>

        <p className="text-black my-1">
          Ainda não possui uma conta?{" "}
          <Link to={"/register"} className="hover:underline transition-all">
            <strong>Cadastre-se.</strong>
          </Link>
        </p>
      </div>
    </Container>
  );
}
