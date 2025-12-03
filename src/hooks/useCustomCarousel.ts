"use client";

import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { useCallback, useState } from "react";

/**
 * Embla Carousel kullanarak dönen resim işlevi sağlayan özel kanca.
 *
 * @param {EmblaOptionsType} [plugins] - Embla Dönen Resim için isteğe bağlı yapılandırma seçenekleri.
 * @param {EmblaPluginType[]} [plugins] - Dönen resmi geliştirmek için isteğe bağlı eklenti dizisi.
 * @returns {nesne} Şunları içeren bir nesne:
 * - `emblaRef`: Dönen resim kabına eklenecek referans.
 * - `scrollTo`: Belirli bir dizine kaydırma işlevi.
 * - `scrollNext`: Sonraki öğeye kaydırma işlevi.
 * - `scrollPrev`: Önceki öğeye kaydırma işlevi.
 * - `selectedIndex`: Dönen resmin seçili geçerli dizini.
 * - `canScrollNext`: Dönen resmin bir sonraki öğeye kaydırılıp kaydırılamayacağını belirten Boole değeri.
 * - `canScrollPrev`: Döngünün bir önceki öğeye kaydırılıp kaydırılamayacağını belirten Boole değeri.
 */
export const useCustomCarousel = (options?: EmblaOptionsType, plugins?: EmblaPluginType[]) => {
  const [emblaRef, embla] = useEmblaCarousel(options, plugins);

  const [canScrollNext, setCanScrollNext] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => embla && embla.scrollTo(index), [embla]);
  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);

  if (embla) {
    embla.on("select", () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
      setSelectedIndex(embla.selectedScrollSnap());
    });
  }

  return {
    emblaRef,
    scrollTo,
    scrollNext,
    scrollPrev,
    selectedIndex,
    canScrollNext,
    canScrollPrev,
  };
};
