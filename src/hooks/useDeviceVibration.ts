import { useState, useEffect } from "react";

/**
 * Cihaz titreşimini yönetmek için özel kanca.
 *
 * @returns {object} - Titreşim modellerini başlatmak, durdurmak ve yönetmek için işlevler içerir.
 */
const useDeviceVibration = () => {
  const [isVibrating, setIsVibrating] = useState(false);

  const isVibrationSupported = () => "vibrate" in navigator;

  /**
   * Cihaz titreşimini belirli bir desenle başlat.
   * @param {number | number[]} pattern - Titreşim desenini tanımlayan tek bir sayı veya sayı dizisi.
   */
  const startVibration = (pattern: VibratePattern) => {
    if (isVibrationSupported()) {
      navigator.vibrate(pattern);
      setIsVibrating(true);
    } else {
      console.warn("Vibration API is not supported in this browser.");
    }
  };

  /**
   * Mevcut titreşimi durdur.
   */
  const stopVibration = () => {
    if (isVibrationSupported()) {
      navigator.vibrate(0);
      setIsVibrating(false);
    }
  };

  useEffect(() => {
    return () => {
      stopVibration();
    };
  }, []);

  return {
    isVibrating,
    startVibration,
    stopVibration,
    isVibrationSupported,
  };
};

export default useDeviceVibration;
