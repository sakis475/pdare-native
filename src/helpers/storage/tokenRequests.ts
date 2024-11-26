import { toast } from '../../core/utils';
import { navigate, navigateReset, ScreenNames } from '../../navigation/navigationUtils';
import { clearRestaurantStorageRelatedKeys, setStorage } from '../../storage/store';
import { SessionBearer } from '../../types/requests.types';
import { postRequest, setBearer } from '../requests';
import { socketManager } from '../Sockets/SocketManager';

export async function login(username: string, password: string) {
  try {
    const res: SessionBearer = await postRequest('/login', { username, password });
    if (res) {
      await setBearer(res);
      navigateReset(ScreenNames.MainTabs);
      navigate(ScreenNames.MainTabs);
      return true;
    }

    return false;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ?? 'Κάτι πήγε λάθος, δεν μπορέσατε να συνδεθείτε.';
    console.log(error.response?.data);
    toast('error', `${errorMessage}`);
  }
}

export async function logout() {
  try {
    //TODO: send to request also to log logged out event
    await setStorage('session_bearer', null);
    await setStorage('currentUser', null);
    await clearRestaurantStorageRelatedKeys();
    await socketManager.updateUserInstance();

    navigateReset(ScreenNames.LoginScreen);
    navigate(ScreenNames.LoginScreen);

    return false;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ?? 'Κάτι πήγε λάθος, δεν μπορέσατε να αποσυνδεθείτε.';
    console.log(error.response?.data);
    toast('error', `${errorMessage}`);
  }
}
