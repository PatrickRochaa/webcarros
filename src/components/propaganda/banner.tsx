import { useState, useEffect } from "react";
import { Container } from "../../components/container";
import bannerFloresta from "../../assets/bannerFloresta.png";
import bannerMarketPlace from "../../assets/bannerMarketPlace.png";

export function Propaganda() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const banners = [
    {
      img: bannerFloresta,
      link: "https://floresta-negra.vercel.app/",
    },
    {
      img: bannerMarketPlace,
      link: "https://webcarros-lovat-two.vercel.app/",
    },
  ];

  const handleImageLoad = () => {
    setLoading(false);
  };

  // Alterna automaticamente os slides a cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 6000); // Troca a cada 6 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [banners.length]);

  return (
    <Container>
      <section className="relative">
        <div className="overflow-hidden relative">
          {loading && (
            <div className="w-full h-20 bg-gray-300 animate-pulse"></div> // Skeleton loading
          )}

          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {banners.map((banner, index) => (
              <div key={index} className="flex-shrink-0 w-full">
                <a
                  href={banner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={banner.img}
                    alt={`Banner ${index}`}
                    className="w-full object-cover h-[160px]  rounded-lg" // Altura máxima de 160px
                    onLoad={handleImageLoad}
                  />
                </a>
              </div>
            ))}
          </div>

          {/* Marcadores do slide */}
          {!loading && (
            <div className="absolute bottom-2 left-5 flex gap-2 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`w-4 h-4  border  border-black cursor-pointer transition-all duration-300 ease-in-out transform skew-x-[-20deg] ${
                    index === currentIndex
                      ? "bg-black"
                      : "bg-transparent border border-black"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                ></button>
              ))}
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
