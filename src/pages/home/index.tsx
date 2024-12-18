import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

import { Container } from "../../components/container/index";

//tipagem para exbir os carros na pagina inicial
export interface CarsProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: CarImagesProps[];
}

// tipagem da imagens
export interface CarImagesProps {
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  //recebe os carros
  const [cars, setCars] = useState<CarsProps[]>([]);

  //input de pesquisa
  const [input, setInput] = useState("");

  //armazenar as imagens que sao carregadas
  const [loadImages, setLoadImages] = useState<string[]>([]);

  //buscando os carros no DB
  function loadCars() {
    //buscando dentro da collection
    const carsRef = collection(db, "cars");

    //ordenando exibiçao pela data e hora criada
    // exibindo os mais novos primeiro
    const queryRef = query(carsRef, orderBy("created", "desc"));

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
      })
      .catch(() => {});
  }

  //funçao para buscar carro
  async function handleSearchCar() {
    //verficando se o campo está vazio
    if (!input) {
      loadCars();
      return;
    }

    setCars([]);
    setLoadImages([]);

    //caminho da pesquisa
    const q = query(
      collection(db, "cars"),
      where("name", ">=", input.toUpperCase()), //salvando tudo Maiscula para pesquisa),
      where("name", "<=", input.toUpperCase() + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    const searchCars = [] as CarsProps[];

    querySnapshot.forEach((doc) => {
      searchCars.push({
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
    setCars(searchCars);
  }

  useEffect(() => {
    //executando a funçao de buscar
    //carro no DB
    loadCars();
  }, []);

  //funçao para carregamento da imagem
  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          type="text"
          placeholder="Informe o nome do carro"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
        />
        <button
          className="bg-red-500 h-9 px-8 rounded-lg text-white text-lg"
          onClick={handleSearchCar}
        >
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carro novos e usados em todo o Brasil!
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Link to={`/car/${car.id}`} key={car.id}>
            <section className="w-full bg-white rounded-lg pb-3">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{
                  display: loadImages.includes(car.id) ? "none" : "block",
                }}
              ></div>

              <img
                src={car.images[0].url}
                alt={`foto do carro ${car.name}`}
                className="w-full rounded-lg h-52 mb-2 hover:scale-105 transition-all"
                style={{
                  display: loadImages.includes(car.id) ? "block" : "none",
                }}
                onLoad={() => handleImageLoad(car.id)}
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
          </Link>
        ))}
      </main>
    </Container>
  );
}
