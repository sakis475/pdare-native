import { AppLanguage } from '../core/strings';

export const ENV_TYPE: 'PROD' | 'DEV' = 'DEV';
export const BASE_DOMAIN = 'https://6ce7-2a10-9300-400-e40-5a93-a70e-2908-b2e.ngrok-free.app';
export const BASE_URL = BASE_DOMAIN + '/api/v1';
export const DEFAULT_APP_LANGUAGE: AppLanguage = 'lang_en';
export const REQ_TIMEOUT = 60000;
export const DEFAULT_SOCKET_CONNECTIONS = ['testio'];

//Roadmap

/**
1. Admin Categories Screen (Add new, Rename, Delete whole category, Change Color)
2. Admin Items Screen (Add new, Rename, Delete Whole item)
3. Admin Item Details Screen: 
3.1. Item Details Pattern Screen
    - Add -Item Details Pattern Screen- that user can create a list of Item Details and name them, then everytime that adds a new item it can assign pattern.
4. Add re-ordering system for categories, items, item details
5. History tab: Add the ability to re-open orders that has closed and edit them. (Add them to tempOrder screen/storage)
6. Expo Tab: Make a view that lists open orders in a scrollable horizontal (2 columns) make it snappable. Each list should scroll vertically too. 
    Add the ability to mark items with colors
    Add the ability to mark items as finished (Strikethrough)
    Add the ability to mark list as finished
7. Make all static text to json and use strings.ts, make two versions greek/english, add an option to change language to profile screen.
8. Add Personel Screen, that can invite users, give them roles, delete them from restaurant, change display name.
9. Finish Register Screen, Login Screen (implement Forget password).
10. Profile Screen, change name, password, first name, last name, leave restaurant option, some other personalize options like language
11. "Restaurant Invites will appear here" create screen for users without restaurant.
12. Experiment with llm apis to parse menu photos to json format. Figure out how to open camera or gallery to feed menu photos.
13. Finish printer app, find a reliable printer so i can suggest one.
 */
