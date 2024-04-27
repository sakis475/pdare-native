import axios, { isAxiosError } from 'axios';
import { BASE_URL } from '../storage/env';

import { SessionBearer } from '../types/requests.types';
import { getStorage, setStorage } from '../storage/store';
import dayjs from 'dayjs';
import { toast } from '../core/utils';

export async function getBearer() {
  try {
    const bearer: SessionBearer = await getStorage('session_bearer');
    if (!bearer) {
      //go to login page
      console.log('REDIRECT TO LOGIN PAGE0');
    }

    const tokenMinutes = dayjs().diff(dayjs(bearer.createdAt), 'minutes');

    //if it is past 6 days then request a new one
    if (tokenMinutes > 8640 && tokenMinutes < 10080 && bearer?.token) {
      const refreshToken = await postRequest('/login/session', {
        jwt: bearer?.token,
      }); //await axios.post("/login/session", bearer.token);

      console.log(refreshToken);

      if (refreshToken) {
        const tokenJWT = refreshToken;
        if (!tokenJWT) {
          //go to login page
          console.log('REDIRECT TO LOGIN PAGE1');
        } else {
          await setBearer(tokenJWT);
        }
      } else {
        //go to login page
        console.log('REDIRECT TO LOGIN PAGE2');
      }
    }

    return bearer;
  } catch (error) {
    toast('error', 'Something bad happened...');
  }
}

export async function setBearer(token: string) {
  try {
    await setStorage('session_bearer', { token, createdAt: dayjs() });
  } catch (error) {
    toast('error', 'Something bad happened...');
  }
}

export async function login(username: string, password: string) {
  try {
    const res = await postRequest('/login', { username, password });

    if (res) {
      await setBearer(res);
      return true;
    }

    return false;
  } catch (error) {
    toast('error', 'Something bad happened...');
  }
}

export async function getRequest(url: string) {
  try {
    // const auth = await getBearer();
    const options = {
      headers: {
        // Authorization: `Bearer ${auth}`,
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNha2lzIiwiZmlyc3ROYW1lIjoizpjOrM69zr_PgiIsInJvbGUiOiJvd25lciIsImxhc3ROYW1lIjoizqDOuc-AzrvOuc66zqzPhM-DzrfPgiIsImlhdCI6MTcxNDE3MjE4OSwiZXhwIjoxNzE0Nzc2OTg5fQ.RtCPrSid9ppTJaF83jgPWdqYPX_wNcp-CrFGMt09ZDM`,
      },
    };

    console.log(BASE_URL + url);
    const response = await axios.get(BASE_URL + url, options);
    return response.data;
  } catch (error) {
    console.log(error);
    toast('error', 'Error: Something bad happened...');
  }
}

export async function postRequest(url: string, body?: any) {
  try {
    let options = {};

    if (url !== '/login' && url !== '/login/session') {
      const bearer = await getBearer();

      if (bearer) {
        options = {
          headers: {
            Authorization: `Bearer ${bearer.token}`,
          },
        };
      }
    }

    const response = await axios.post(BASE_URL + url, body, options);
    return response.data;
  } catch (error) {
    toast('error', 'Something bad happened...');
  }
}
