import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { settingsState } from '@/stores/settingsStore';

export function useBorderRadius() {
  const { borderRadius } = useStore(settingsState);

  useEffect(() => {
    document.documentElement.style.setProperty('--radius', `${borderRadius}rem`);
  }, [borderRadius]);
}
