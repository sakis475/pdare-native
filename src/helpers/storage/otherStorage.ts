import { getStorage, setStorage } from '../../storage/store';

export async function setStorageLastCredentials(lastCredentials: LastCredentialsStorage) {
  return setStorage('lastCredentials', lastCredentials);
}

export async function getStorageLastCredentials() {
  return getStorage('lastCredentials');
}
