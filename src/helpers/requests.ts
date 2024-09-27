import axios, { AxiosError } from 'axios';
import { BASE_URL, REQ_TIMEOUT } from '../storage/env';

import { SessionBearer } from '../types/requests.types';
import { getStorage, setStorage } from '../storage/store';

import { checkInternetConnectivity, toast } from '../core/utils';
import { navigate, ScreenNames } from '../navigation/AppNavigator';
import dayjs, { datetimeDiff } from '../core/dayjs';

export async function refreshToken() {
  const bearer: SessionBearer | null = await getStorage('session_bearer');
  if (!bearer) {
    //go to login page
    navigate(ScreenNames.LoginScreen);
    return;
  }

  try {
    const refreshToken: SessionBearer = await postRequest('/login/session', {
      jwt: bearer?.token,
    });

    if (refreshToken) {
      await setBearer(refreshToken);
      return refreshToken;
    } else {
      //go to login page
      navigate(ScreenNames.LoginScreen);
      return;
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data.appcode === 'AU02') {
        toast('error', 'Your session is expired');
      }
    } else {
      toast('error', 'Something bad happened...');
    }
    navigate(ScreenNames.LoginScreen);
  }
}

export async function getBearer() {
  const bearer: SessionBearer | null = await getStorage('session_bearer');
  if (!bearer) {
    //go to login page
    navigate(ScreenNames.LoginScreen);
    return;
  }

  const tokenMinutes = datetimeDiff(dayjs(bearer.info.expiresAt), dayjs(), 'minutes');

  //if its not valid for 10 mins then request a new one
  if (bearer?.token && tokenMinutes < 10) {
    return await refreshToken();
  }
  return bearer;
}

export async function setBearer(sessionBearer: SessionBearer) {
  console.log(sessionBearer, 'sessionBearer');
  try {
    await setStorage('session_bearer', sessionBearer);
  } catch (error) {
    toast('error', 'Something bad happened...');
  }
}

export async function getRequest(url: string) {
  try {
    checkInternetConnectivity();
    const auth = await getBearer();
    if (!auth) {
      return;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
      timeout: REQ_TIMEOUT,
    };

    console.log('GET ' + BASE_URL + url);
    const response = await axios.get(BASE_URL + url, options);
    return response.data;
  } catch (error) {
    handleAxiosError(error as AxiosError);
  }
}

export async function postRequest(url: string, body?: any) {
  try {
    checkInternetConnectivity();
    let options = {};

    if (!['/login', '/login/session'].includes(url)) {
      const auth = await getBearer();

      if (auth) {
        options = {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          timeout: REQ_TIMEOUT,
        };
      }
    }
    console.log('POST ' + BASE_URL + url);
    const response = await axios.post(BASE_URL + url, body, options);
    return response.data;
  } catch (error) {
    handleAxiosError(error as AxiosError);
  }
}

export async function patchRequest(url: string, body?: any) {
  try {
    checkInternetConnectivity();
    let options = {};

    if (!['/login', '/login/session'].includes(url)) {
      const auth = await getBearer();

      if (auth) {
        options = {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          timeout: REQ_TIMEOUT,
        };
      }
    }
    console.log('PATCH ' + BASE_URL + url);
    const response = await axios.patch(BASE_URL + url, body, options);
    return response.data;
  } catch (error) {
    handleAxiosError(error as AxiosError);
  }
}

function handleAxiosError(error: any) {
  if (axios.isAxiosError(error)) {
    if (error?.response?.data?.appcode) {
      switch (error.response.data.appcode) {
        case 'DT10':
          toast('error', 'Table is occupied, choose other table', '', 2500);
          break;

        default:
          toast('error', error.response.data.message, '', 2500);
          break;
      }
    } else if (error.request) {
      toast('error', 'No Server Response', '', 2000);
    } else {
      toast('error', error?.message);
    }
  } else {
    console.error('Unexpected error:', error);

    toast('error', 'An error occurred while processing your request');
  }

  if (error?.response?.status === 401) {
    navigate(ScreenNames.LoginScreen);
  }
}
