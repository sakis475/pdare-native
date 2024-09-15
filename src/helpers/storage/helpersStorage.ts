import { getStorage, setStorage } from '../../storage/store';

export const getHelperStorage = async (): Promise<HelperStorage> => {
  const helperStorage: HelperStorage | null = await getStorage('helperStorage');

  if (!helperStorage) {
    return {};
  }
  return helperStorage;
};

export const updateHelperStorage = async (
  updatedValues: Partial<HelperStorage>
): Promise<HelperStorage> => {
  // Retrieve the current storage object
  const currentStorage: HelperStorage = await getHelperStorage();

  // Merge the existing storage object with the updated values
  const updatedStorage: HelperStorage = {
    ...currentStorage,
    ...updatedValues,
  };

  // Save the updated storage object back to the storage
  await setStorage('helperStorage', updatedStorage);

  return updatedStorage;
};

type HelperStorage = {
  isBackFromPreview?: boolean;
};
