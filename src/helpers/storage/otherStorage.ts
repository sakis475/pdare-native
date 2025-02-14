import { getStorage, setStorage } from '../../storage/store';
import { LastCredentialsStorage } from '../../types/basic.types';

export async function setStorageLastCredentials(lastCredentials: LastCredentialsStorage) {
  return setStorage('lastCredentials', lastCredentials);
}

export async function getStorageLastCredentials() {
  return getStorage('lastCredentials');
}
