import { useState, useEffect } from "react";
import { Container } from "../../components/container";
import { MdWhatsapp } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";

import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

import { Swiper, SwiperSlide } from "swiper/react";

//tipagem para exibir os carros na pagina detalhes
interface CarDetailProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  whatsapp: string;
  model: string;
  description: string;
  created: string;
  owner: string;
  images: CarImagesProps[];
}

// tipagem da imagens
export interface CarImagesProps {
  name: string;
  uid: string;
  url: string;
}

export function CarDetail() {
  const navigate = useNavigate();
  // armazenar o carro que vai receber
  const [car, setCar] = useState<CarDetailProps>();

  //armazenar o numero de slider
  const [slidePreview, setSlidePreview] = useState<number>(2);

  //pegando id do carro/rota
  const { id } = useParams();

  //buscando e exibindo carro
  useEffect(() => {
    async function loadCar() {
      //parando rota casa nao tenha id
      if (!id) {
        return;
      }

      //referencia de qual carro vai ser mostrado
      const docRef = doc(db, "cars", id);

      //buscando
      getDoc(docRef).then((snapshot) => {
        //verificando se o carro exite no DB
        if (!snapshot.data()) {
          navigate("/");
        }

        setCar({
          id: snapshot.id,
          name: snapshot.data()?.name,
          year: snapshot.data()?.year,
          city: snapshot.data()?.city,
          model: snapshot.data()?.model,
          uid: snapshot.data()?.uid,
          description: snapshot.data()?.description,
          created: snapshot.data()?.created,
          whatsapp: snapshot.data()?.whatsapp,
          price: snapshot.data()?.price,
          km: snapshot.data()?.km,
          owner: snapshot.data()?.owner,
          images: snapshot.data()?.images,
        });
      });
    }

    //executando funçao
    loadCar();
  }, [id]);

  //observar o tamanho da tela
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSlidePreview(1);
      } else {
        setSlidePreview(2);
      }
    }

    //ativando a funçao
    handleResize();

    //observando(olheiro) o tamanho
    window.addEventListener("resize", handleResize);

    //removendo o olheiro caso sai da tela de detalhes
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Container>
      {car && (
        <Swiper
          slidesPerView={slidePreview}
          pagination={{ clickable: true }}
          navigation
        >
          {car?.images.map((image) => (
            <SwiperSlide key={image.name}>
              <img
                src={image.url}
                className="w-full h-90 object-cover"
                alt={`foto do carro ${car?.name}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
            <h1 className="font-bold text-3xl text-black">R$ {car?.price}</h1>
          </div>

          <p>{car?.model}</p>

          <div className="w-full flex gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{car?.city}</strong>
              </div>

              <div>
                <p>Ano</p>
                <strong>{car?.year}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p>Km</p>
                <strong>{car?.km}</strong>
              </div>
            </div>
          </div>

          <strong>Descrição</strong>
          <p className="mb-4">{car?.description}</p>

          <strong>Telefone / WhatsApp</strong>
          <p>{car?.whatsapp}</p>

          <a
            className="bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium cursor-pointer"
            href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá vi esse ${car?.name} no site WebCarros e fiquei interessado.`}
            target="_blank"
          >
            Conversar com vendedor
            <MdWhatsapp size={26} color="#fff" />
          </a>
        </main>
      )}
    </Container>
  );
}
