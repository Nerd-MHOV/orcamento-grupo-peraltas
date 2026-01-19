// export const API_URL = "http://localhost:3335";
// export const PATH_IMAGES_BUDGET = "http://localhost:5173/budgetCorpImages/";
// export const PATH_IMAGES = "http://localhost:5173/";


export const API_URL = import.meta.env.VITE_API_URL || "http://192.168.10.87:3335";
export const PATH_IMAGES_BUDGET = import.meta.env.VITE_PATH_IMAGES_BUDGET || "http://192.168.10.87:83/budgetCorpImages/";
export const PATH_IMAGES = import.meta.env.VITE_PATH_IMAGES || "http://192.168.10.87:83/";
