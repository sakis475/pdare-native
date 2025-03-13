import { strings } from '../../core/localization/strings';
import { toast } from '../../core/utils';
import { navigate, navigateReset, ScreenNames } from '../../navigation/navigationUtils';
import { FormState } from '../../screens/authenticationScreens/RegisterScreen';
import { BASE_DOMAIN } from '../../storage/env';
import { clearRestaurantStorageRelatedKeys, getStorage, setStorage } from '../../storage/store';
import { SessionBearer } from '../../types/requests.types';
import { postRequest, setBearer } from '../requests';
import { socketManager } from '../Sockets/SocketManager';
import { setStorageLastCredentials } from './otherStorage';

export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export async function handleUserLogin(sessionBearer: SessionBearer) {
  console.log(sessionBearer, 'handleUserLogin');
  try {
    if (sessionBearer?.user?.emailVerified === false) {
      handleNoOTP(sessionBearer);
    } else if (
      sessionBearer?.user?.restaurant?.active === true &&
      sessionBearer?.user?.active === true
    ) {
      await setBearer(sessionBearer);
      navigateReset(ScreenNames.MainTabs);
    } else if (sessionBearer.user) {
      handleNoRestaurantUser(sessionBearer);
    } else {
      return false;
    }

    return true;
  } catch (error: any) {
    return false;
  }
}

export async function login(username: string, password: string) {
  try {
    setStorageLastCredentials({ email: username, password });
    const res: SessionBearer = await postRequest('/login', { username, password }, 20000);
    if (!res) {
      return;
    }

    await handleUserLogin(res);
  } catch (error: any) {
    console.log(error.response?.data);
  }
}

export async function logout(options?: { skipNavigate?: boolean }) {
  try {
    //TODO: send to request also to log logged out event
    await setStorage('session_bearer', null);
    await clearRestaurantStorageRelatedKeys();

    socketManager.disconnect();

    await socketManager.updateUserInstance();

    if (options?.skipNavigate) return false;
    navigateReset(ScreenNames.LoginScreen);

    return false;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ?? 'Κάτι πήγε λάθος, δεν μπορέσατε να αποσυνδεθείτε.';
    console.log(error.response?.data);
    toast('error', `${errorMessage}`);
  }
}

export async function register(registerData: RegisterData) {
  clearRestaurantStorageRelatedKeys();
  const sessionBearer: SessionBearer = await postRequest('/register', registerData);
  setStorageLastCredentials({ email: registerData.username, password: registerData.password });

  if (sessionBearer?.user?.restaurant) {
    await setBearer(sessionBearer);
  } else if (sessionBearer?.user) {
    handleNoRestaurantUser(sessionBearer);
  }
}

export async function handleNoRestaurantUser(sessionBearer: SessionBearer) {
  console.log('Handle No USER RESTAURANT USER!!!!!!!!!!!!!!!!!!!!!!!!!11');
  await setStorage('session_bearer', sessionBearer);
  await setStorage('currentUser', sessionBearer?.user);
  navigateReset(ScreenNames.NewUserSetupScreen);
}

export async function handleNoOTP(sessionBearer: SessionBearer) {
  console.log('Handle No USER RESTAURANT USER!!!!!!!!!!!!!!!!!!!!!!!!!11');
  await setStorage('session_bearer', sessionBearer);
  await setStorage('currentUser', sessionBearer?.user);
  navigateReset(ScreenNames.VerifyEmailScreen);
}

export async function resetPassword(email: string) {
  try {
    const res: any = await postRequest('/resetPassword', { email });
    if (!res) {
      return;
    }

    if (res?.ttl) {
      toast('info', strings.RESEND_EMAIL_TIMER.replace('{seconds}', `${res?.ttl}`));
    } else if (res?.success) {
      toast('success', strings.RESET_EMAIL_SUCCESS);
    }
  } catch (error: any) {
    console.log(error.response?.data);
  }
}
