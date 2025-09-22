import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage or system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

// Apply theme to document
const applyTheme = (theme) => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  localStorage.setItem('theme', theme);
};

const initialState = {
  mode: getInitialTheme(),
  primaryColor: localStorage.getItem('primaryColor') || 'blue',
  fontSize: localStorage.getItem('fontSize') || 'medium',
  sidebarCollapsed: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false'),
  animations: JSON.parse(localStorage.getItem('animations') || 'true'),
};

// Apply initial theme
applyTheme(initialState.mode);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      applyTheme(state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      applyTheme(state.mode);
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
      localStorage.setItem('primaryColor', action.payload);
      
      // Apply CSS custom properties for primary color
      const root = document.documentElement;
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
      
      if (colors[action.payload]) {
        root.style.setProperty('--color-primary', colors[action.payload]);
      }
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
      
      // Apply font size to document
      const root = document.documentElement;
      const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
        xlarge: '20px',
      };
      
      if (sizes[action.payload]) {
        root.style.setProperty('--base-font-size', sizes[action.payload]);
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(action.payload));
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations;
      localStorage.setItem('animations', JSON.stringify(state.animations));
      
      // Apply animations preference
      const root = document.documentElement;
      if (state.animations) {
        root.classList.remove('no-animations');
      } else {
        root.classList.add('no-animations');
      }
    },
    setAnimations: (state, action) => {
      state.animations = action.payload;
      localStorage.setItem('animations', JSON.stringify(action.payload));
      
      // Apply animations preference
      const root = document.documentElement;
      if (action.payload) {
        root.classList.remove('no-animations');
      } else {
        root.classList.add('no-animations');
      }
    },
    resetTheme: (state) => {
      state.mode = 'light';
      state.primaryColor = 'blue';
      state.fontSize = 'medium';
      state.sidebarCollapsed = false;
      state.animations = true;
      
      // Clear localStorage
      localStorage.removeItem('theme');
      localStorage.removeItem('primaryColor');
      localStorage.removeItem('fontSize');
      localStorage.removeItem('sidebarCollapsed');
      localStorage.removeItem('animations');
      
      // Apply defaults
      applyTheme('light');
      
      const root = document.documentElement;
      root.style.setProperty('--color-primary', '#3b82f6');
      root.style.setProperty('--base-font-size', '16px');
      root.classList.remove('no-animations');
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setPrimaryColor,
  setFontSize,
  toggleSidebar,
  setSidebarCollapsed,
  toggleAnimations,
  setAnimations,
  resetTheme,
} = themeSlice.actions;

// Selectors
export const selectTheme = (state) => state.theme;
export const selectThemeMode = (state) => state.theme.mode;
export const selectPrimaryColor = (state) => state.theme.primaryColor;
export const selectFontSize = (state) => state.theme.fontSize;
export const selectSidebarCollapsed = (state) => state.theme.sidebarCollapsed;
export const selectAnimations = (state) => state.theme.animations;
export const selectIsDarkMode = (state) => state.theme.mode === 'dark';

export default themeSlice.reducer;
