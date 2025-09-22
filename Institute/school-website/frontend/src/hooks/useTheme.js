import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const useTheme = () => {
  const theme = useSelector(state => state.theme);

  useEffect(() => {
    // Apply theme mode
    const root = document.documentElement;
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply primary color
    const colors = {
      blue: '#3b82f6',
      green: '#22c55e',
      purple: '#8b5cf6',
      red: '#ef4444',
      orange: '#f97316',
      pink: '#ec4899',
      indigo: '#6366f1',
      teal: '#14b8a6',
    };

    if (colors[theme.primaryColor]) {
      root.style.setProperty('--color-primary', colors[theme.primaryColor]);
    }

    // Apply font size
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };

    if (sizes[theme.fontSize]) {
      root.style.setProperty('--base-font-size', sizes[theme.fontSize]);
    }

    // Apply animations preference
    if (theme.animations) {
      root.classList.remove('no-animations');
    } else {
      root.classList.add('no-animations');
    }
  }, [theme]);

  return theme;
};

export default useTheme;
