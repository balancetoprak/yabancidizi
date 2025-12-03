// Ortam değişkenleri
const IS_BROWSER = typeof window !== "undefined";
const IS_SERVER = !IS_BROWSER;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const IS_TEST = process.env.NODE_ENV === "test";

// Depolama anahtarları
const DISCLAIMER_STORAGE_KEY = "disclaimer-agreed";
const ADS_WARNING_STORAGE_KEY = "ads-warning-seen";
const LIBRARY_STORAGE_KEY = "bookmarks";
const SEARCH_HISTORY_STORAGE_KEY = "search-histories";

// Diğerleri
const ITEMS_PER_PAGE = 20;
const SpacingClasses = {
  main: "px-3 py-8 sm:px-5",
  reset: "-mx-3 -my-8 sm:-mx-5",
};

// Export
export {
  IS_BROWSER,
  IS_SERVER,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
  DISCLAIMER_STORAGE_KEY,
  ADS_WARNING_STORAGE_KEY,
  LIBRARY_STORAGE_KEY,
  SEARCH_HISTORY_STORAGE_KEY,
  ITEMS_PER_PAGE,
  SpacingClasses,
};
