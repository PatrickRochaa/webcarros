import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { CarsProps } from "../home";

import { Container } from "../../components/container/index";
import { DashboardHeader } from "../../components/painelHeader";

import { db, storage } from "../../services/firebaseConnection";
import { ref, deleteObject } from "firebase/storage";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";

import Toast from "react-hot-toast";
import { MdOutlineDeleteForever, MdEditSquare } from "react-icons/md";

export function Dashboard() {
  const [cars, setCars] = useState<CarsProps[]>([]);
  const { user } = useContext(AuthContext);

  //buscando os carros no DB
  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        //caso nao esteja ususario logado para o codigo
        return;
      }

      //buscando dentro da collection
      const carsRef = collection(db, "cars");

      //buscando dentro da collection que
      // corresponde ao usuario logado
      const queryRef = query(carsRef, where("uid", "==", user.uid));

      //buscando os dados
      getDocs(queryRef)
        .then((snapshot) => {
          const listCars = [] as CarsProps[];

          snapshot.forEach((doc) => {
            listCars.push({
              id: doc.id,
              name: doc.data().name,
              year: doc.data().year,
              km: doc.data().km,
              city: doc.data().city,
              price: doc.data().price,
              images: doc.data().images,
              uid: doc.data().uid,
            });
          });
          //passando para a useState
          setCars(listCars);
          //console.log(listCars);
        })
        .catch(() => {});
    }

    //executando a funçao
    loadCars();
  }, [user]);

  //funçao para deletar
  async function handleDeleteCar(car: CarsProps) {
    const itemCar = car;

    try {
      // Primeiro, deletamos as imagens
      await Promise.all(
        itemCar.images.map(async (image) => {
          const imagePath = `images/${image.name}/${image.uid}`;
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        })
      );

      // Agora deletamos o documento do carro
      const docRef = doc(db, "cars", itemCar.id);
      await deleteDoc(docRef);

      // Atualiza a lista de carros após deletar
      Toast.success("Carro deletado!");
      setCars(cars.filter((car) => car.id !== itemCar.id));
    } catch (error) {
      console.error("Erro ao deletar carro ou imagem", error);
      Toast.error("Erro ao deletar carro");
    }
  }

  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-flow-col-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <section
            key={car.id}
            className="w-full bg-white rounded-lg pb-3 relative"
          >
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              <button
                onClick={() => handleDeleteCar(car)}
                className=" bg-white w-10 h-10 rounded-full flex items-center justify-center drop-shadow hover:scale-105 transition-all"
              >
                <MdOutlineDeleteForever size={22} color="#000" />
              </button>
              {/* Chamando a edição do carro */}
              <Link to={`/edit/${car.id}`}>
                <button className=" bg-white w-10 h-10 rounded-full flex items-center justify-center drop-shadow hover:scale-105 transition-all">
                  <MdEditSquare size={22} color="#000" />
                </button>
              </Link>
            </div>
            <img
              src={car.images[0].url}
              alt="foto do carro"
              className="w-full rounded-lg h-52 mb-2"
            />

            <p className="font-bold mt-2 mb-2 px-2">{car.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700 mb-6">
                Ano: {car.year} | {car.km} Km
              </span>
              <strong className="text-black font-medium text-xl">
                R$ {car.price}
              </strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className="text-black px-2">
              <span>{car.city}</span>
            </div>
          </section>
        ))}
      </main>
    </Container>
  );
}
