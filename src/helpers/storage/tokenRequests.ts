import { toast } from '../../core/utils';
import { navigate, navigateReset, ScreenNames } from '../../navigation/navigationUtils';
import { SessionBearer } from '../../types/requests.types';
import { postRequest, setBearer } from '../requests';

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
    await setBearer(null);
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
