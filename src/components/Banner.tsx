import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BannerSlide } from '@/types';
import { cn } from '@/lib/utils';

const bannerData: BannerSlide[] = [
  {
    id: 1,
    imageUrl: 'https://images.pexels.com/photos/8105035/pexels-photo-8105035.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Fresh & Organic',
    description: 'Get the freshest organic vegetables and fruits delivered to your doorstep',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    id: 2,
    imageUrl: 'https://images.pexels.com/photos/6316514/pexels-photo-6316514.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Fresh & Organic',
    description: 'Get the freshest organic vegetables and fruits delivered to your doorstep',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    id: 3,
    imageUrl: 'https://images.pexels.com/photos/4439544/pexels-photo-4439544.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Fresh & Organic',
    description: 'Get the freshest organic vegetables and fruits delivered to your doorstep',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
];

export const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
  };

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Slides */}
      <div className="relative h-full w-full">
        {bannerData.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 h-full w-full transition-opacity duration-1000',
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{slide.title}</h1>
                  <p className="text-lg md:text-xl text-white/90 mb-8">{slide.description}</p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" size="lg" asChild>
                    <a href={slide.buttonLink}>{slide.buttonText}</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
        onClick={goToPrevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
        onClick={goToNextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 w-8 rounded-full transition-colors',
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            )}
          />
        ))}
      </div>
    </div>
  );
};