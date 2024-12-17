import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db, storage } from "../../services/firebaseConnection"; // Certifique-se de exportar storage no firebaseConnection
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/painelHeader";
import { Input } from "../../components/input";
import Toast from "react-hot-toast";
import { ImageItemProps } from "../dashboard/new"; // Assegure-se de que ImageItemProps está corretamente exportado
import { MdDriveFolderUpload, MdOutlineDeleteForever } from "react-icons/md";
import { AuthContext } from "../../contexts/AuthContext";
import { v4 as uuidV4 } from "uuid";

// Schema de validação usando Zod
const schema = z.object({
  name: z.string().min(1, "O campo nome é obrigatório"),
  model: z.string().min(1, "O campo modelo é obrigatório"),
  year: z.string().min(1, "O campo ano é obrigatório"),
  km: z.string().min(1, "O campo km é obrigatório"),
  price: z.string().min(1, "O campo preço é obrigatório"),
  city: z.string().min(1, "O campo cidade é obrigatório"),
  whatsapp: z
    .string()
    .min(1, "O campo whatsapp é obrigatório")
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: "Número inválido",
    }),
  description: z.string().min(1, "O campo descrição é obrigatório"),
});

type FormData = z.infer<typeof schema>;

export function Edit() {
  const { user } = useContext(AuthContext);
  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(true);

  // UseEffect para buscar os dados do carro e suas imagens
  useEffect(() => {
    const fetchCarData = async () => {
      if (!id) return;

      const carRef = doc(db, "cars", id);
      const carSnapshot = await getDoc(carRef);

      if (carSnapshot.exists()) {
        const carData = carSnapshot.data();

        if (carData.images) {
          const imagesWithPreviewUrl = carData.images.map(
            (image: ImageItemProps) => ({
              ...image,
              previewUrl: image.url || "",
            })
          );
          setCarImages(imagesWithPreviewUrl); // Define as imagens no estado
        }

        reset(carData); // Preenche os dados do carro no formulário
      } else {
        Toast.error("Carro não encontrado");
      }
      setLoading(false);
    };

    fetchCarData();
  }, [id, reset]);

  // Função para deletar uma imagem
  const handleDeleteImage = async (item: ImageItemProps) => {
    // Remove a imagem do estado local
    const updatedImages = carImages.filter((img) => img.uid !== item.uid);
    setCarImages(updatedImages);

    try {
      // Remove a imagem do Firebase Storage
      const imageRef = ref(storage, `images/${item.name}/${item.uid}`);
      await deleteObject(imageRef);

      // Atualiza o Firestore para remover a imagem da lista
      const carRef = doc(db, "cars", id!);
      await updateDoc(carRef, { images: updatedImages });

      Toast.success("Imagem removida com sucesso!");
    } catch (error) {
      Toast.error("Erro ao remover imagem");
      console.error("Erro ao remover imagem:", error);
    }
  };

  // Função para enviar novas imagens
  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageItemProps[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Verificar o tipo da imagem
      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        Toast.error("Envie uma imagem jpeg ou png");
        continue;
      }

      const uidImage = uuidV4();
      const imageRef = ref(storage, `images/${user?.uid}/${uidImage}`);

      try {
        // Upload da imagem para o Firebase Storage
        const snapshot = await uploadBytes(imageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // Adicionar a nova imagem ao array de imagens
        const imageItem: ImageItemProps = {
          uid: uidImage,
          name: user?.uid || "unknown",
          url: downloadUrl, // URL permanente do Firebase Storage
          previewUrl: downloadUrl, // Usar a URL permanente para pré-visualização
        };

        newImages.push(imageItem);
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        Toast.error("Erro ao enviar imagem");
      }
    }

    if (newImages.length > 0) {
      setCarImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  // Função de submissão do formulário
  const onSubmit = async (data: FormData) => {
    try {
      const carRef = doc(db, "cars", id!);
      await updateDoc(carRef, { ...data, images: carImages });
      Toast.success("Carro atualizado com sucesso!");

      reset();
      navigate("/dashboard");
    } catch (error) {
      Toast.error("Erro ao atualizar carro");
      console.error("Erro ao atualizar carro:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-bold text-center mt-6 text-2xl mb-4">
          Carregando...
        </h1>
      </div>
    );
  }

  return (
    <Container>
      <DashboardHeader />

      {/* Área de upload e exibição de imagens */}
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-3">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <MdDriveFolderUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer"
              onChange={handleFile}
              multiple
            />
          </div>
        </button>

        {carImages.map((item) => (
          <div
            key={item.uid}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
              onClick={() => handleDeleteImage(item)}
              title="Excluir imagem"
            >
              <MdOutlineDeleteForever size={20} color="#fff" />
            </button>
            <img
              src={item.url}
              className="rounded-lg w-full h-32 object-cover"
              alt="Foto do carro"
            />
          </div>
        ))}
      </div>

      {/* Formulário de edição */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full bg-white p-3 rounded-lg flex flex-col gap-3 mt-4"
      >
        <div className="mb-3">
          <p className="mb-2">Nome do Carro</p>
          <Input
            type="text"
            register={register}
            name="name"
            error={errors.name?.message}
            placeholder="Nome do carro"
          />
        </div>
        <div className="mb-3">
          <p className="mb-2">Modelo</p>
          <Input
            type="text"
            register={register}
            name="model"
            error={errors.model?.message}
            placeholder="Modelo do carro"
          />
        </div>
        <div className="flex w-full mb-3 flex-row items-center gap-4">
          <div className="w-full">
            <p className="mb-2">Ano</p>
            <Input
              type="text"
              register={register}
              name="year"
              error={errors.year?.message}
              placeholder="Ano do carro"
            />
          </div>

          <div className="w-full">
            <p className="mb-2">Km rodados</p>
            <Input
              type="text"
              register={register}
              name="km"
              error={errors.km?.message}
              placeholder="Kilometros do carro"
            />
          </div>
        </div>
        <div className="flex w-full mb-3 flex-row items-center gap-4">
          <div className="w-full">
            <p className="mb-2">Telefone/WhatsApp</p>
            <Input
              type="text"
              register={register}
              name="whatsapp"
              error={errors.whatsapp?.message}
              placeholder="Telefone para contato"
            />
          </div>

          <div className="w-full">
            <p className="mb-2">Cidade</p>
            <Input
              type="text"
              register={register}
              name="city"
              error={errors.city?.message}
              placeholder="Cidade que se encontra"
            />
          </div>
        </div>
        <div className="mb-3">
          <p className="mb-2">Preço</p>
          <Input
            type="text"
            register={register}
            name="price"
            error={errors.price?.message}
            placeholder="Valor do carro"
          />
        </div>
        <div className="mb-3">
          <p className="mb-2">Descrição</p>
          <textarea
            className="w-full border-2 rounded-md h-24 px-2"
            {...register("description")}
            placeholder="Informe a descrição completa do carro."
          />
          {errors.description && (
            <p className="mb-1 text-red-500">{errors.description.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-zinc-900 text-white font-medium h-10"
        >
          Atualizar
        </button>
      </form>
    </Container>
  );
}
