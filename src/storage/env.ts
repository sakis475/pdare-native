import { AppLanguage } from '../core/strings';

export const ENV_TYPE: 'PROD' | 'DEV' = 'DEV';
export const BASE_DOMAIN = 'https://d35c-5-203-209-243.ngrok-free.app';
export const BASE_URL = BASE_DOMAIN + '/api/v1';
export const DEFAULT_APP_LANGUAGE: AppLanguage = 'lang_en';
export const REQ_TIMEOUT = 15000;
export const DEFAULT_SOCKET_CONNECTIONS = ['testio'];

//✅ 1. Create a logo screen that acts as a waiting page until login page shows up or not. Make sure it Shows it only when app is from closed state to open. Not on minimize
//2. Finish register page and connect/adapt api for that.
//✅ 3. Send creation of order to server.
//4. Figure out tables screen, and updating an order like view order, close order, add more items,  (Basic Btns are: Close, Add More, Change Table, Send to printers)
// ----MANAGE----
//5. add categories, edit categories names, remove categories (and all names as well) and edit order and color of category
//6. add items, edit items, remove items
//7. Experiment with llm apis to parse menu photos to json format. Figure out how to open camera or gallery to feed menu photos.
//8. Finish printer app, find a reliable printer so i can suggest one.
