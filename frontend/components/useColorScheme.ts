import { useColorScheme as useColorSchemeCore } from 'react-native';

export const useColorScheme = (): 'light' | 'dark' => {
  const coreScheme = useColorSchemeCore();
  if (!coreScheme || coreScheme === 'unspecified') {
    return 'light';
  }
  return coreScheme;
};
