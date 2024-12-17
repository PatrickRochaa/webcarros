import { ChangeEvent, useContext, useState } from "react";
import { Container } from "../../../components/container/index";
import { DashboardHeader } from "../../../components/painelHeader";
import { MdDriveFolderUpload, MdOutlineDeleteForever } from "react-icons/md";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../../contexts/AuthContext";
import { v4 as uuidV4 } from "uuid";
import { storage, db } from "../../../services/firebaseConnection";
import { addDoc, collection } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import Toast from "react-hot-toast";

// schema de validaçao
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
      message: "Número invalido",
    }),
  description: z.string().min(1, "O campo descrição é obrigatório"),
});

type FormData = z.infer<typeof schema>;

//tipagem para useSate que vai salvar as imagens
export interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  //useState para salvar as imagens
  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

  //funçao para enviar imagem
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];

      if (image.type === "image/jpeg" || image.type === "image/png") {
        //enviar a imagem para o banco de dados
        await handleUpload(image);
      } else {
        alert("Envie uma imagem jpeg ou png");
        return;
      }
    }
  }

  //criando referencia para imagem ser salva no db
  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }

    //pegando id do usuario
    const currentUid = user?.uid;

    //gerando id aleatorio para imagem
    const uidImage = uuidV4();

    //caminho onde vai ser salvo no banco
    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          uid: uidImage,
          name: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        };

        //adicionando ao useState
        setCarImages((images) => [...images, imageItem]);
      });
    });
  }

  //funçao de cadastro
  function onSubmit(data: FormData) {
    //nao deixando cadastrar carro sem imagem
    if (carImages.length === 0) {
      alert("Envie alguma foto do carro");
      return;
    }

    // reordenando o envio da lista de imagem para o DB
    const carListImages = carImages.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      };
    });

    //cadastrndo no DB
    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(), //salvando tudo Maiscula para pesquisa
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset(); // limpando os campos do cadastrado
        setCarImages([]); //voltando a lista de imagens para vazio
        //console.log("cadastrado com sucesso");
        Toast.success("cadastrado com sucesso");
      })
      .catch((error) => {
        console.log(error);
        //console.log("erro ao cadastrar no DB");
      });
  }

  //funçao para deletar imagem
  async function handleDeleteImage(item: ImageItemProps) {
    //caminho da imagem clicada
    const imagePath = `images/${item.name}/${item.uid}`;

    const imageRef = ref(storage, imagePath);

    //console.log(imagePath);

    try {
      await deleteObject(imageRef);
      setCarImages(carImages.filter((car) => car.url !== item.url));
    } catch (err) {
      console.log("erro o deletar");
      console.log(err);
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-3">
        <button className="border-2 w-48 rounded-lg  flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <MdDriveFolderUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImages.map((item) => (
          <div
            key={item.name}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              className="absolute"
              onClick={() => handleDeleteImage(item)}
            >
              <MdOutlineDeleteForever size={28} color="#fff" />
            </button>
            <img
              src={item.previewUrl}
              className="rounded-lg w-full h-32 object-cover"
              alt="Foto do carro"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:-flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2">Carro</p>
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
              className="w-full border-2 rounde-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Informe a descrição completa do carro.
            "
            />
            {errors.description && (
              <p className="mb-1 text-red-500">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 text-white font-medium h-10"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  );
}
