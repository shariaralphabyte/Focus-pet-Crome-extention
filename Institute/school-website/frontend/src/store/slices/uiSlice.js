import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  modals: {
    login: false,
    register: false,
    profile: false,
    settings: false,
    createNotice: false,
    editNotice: false,
    deleteConfirm: false,
    imageViewer: false,
    videoPlayer: false,
  },
  
  // Loading states
  loading: {
    global: false,
    page: false,
    form: false,
    upload: false,
  },
  
  // Notification/Toast states
  notifications: [],
  
  // Search and filter states
  searchQuery: '',
  activeFilters: {},
  
  // Layout states
  sidebarOpen: false,
  mobileMenuOpen: false,
  
  // Current page/section
  currentPage: 'home',
  breadcrumbs: [],
  
  // Media viewer states
  currentMedia: null,
  mediaGallery: [],
  mediaIndex: 0,
  
  // Form states
  formData: {},
  formErrors: {},
  
  // Pagination
  currentPageNumber: 1,
  itemsPerPage: 10,
  
  // Selection states
  selectedItems: [],
  selectAll: false,
  
  // View modes
  viewMode: 'grid', // grid, list, card
  sortBy: 'date',
  sortOrder: 'desc',
  
  // Language and locale
  language: localStorage.getItem('language') || 'en',
  
  // Accessibility
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  
  // Online status
  isOnline: navigator.onLine,
  
  // Print mode
  printMode: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = true;
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    
    // Loading actions
    setLoading: (state, action) => {
      const { type, value } = action.payload;
      state.loading[type] = value;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Search and filter actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    clearActiveFilters: (state) => {
      state.activeFilters = {};
    },
    
    // Layout actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Page navigation
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    
    // Media viewer actions
    setCurrentMedia: (state, action) => {
      state.currentMedia = action.payload;
    },
    setMediaGallery: (state, action) => {
      state.mediaGallery = action.payload;
    },
    setMediaIndex: (state, action) => {
      state.mediaIndex = action.payload;
    },
    nextMedia: (state) => {
      if (state.mediaIndex < state.mediaGallery.length - 1) {
        state.mediaIndex += 1;
        state.currentMedia = state.mediaGallery[state.mediaIndex];
      }
    },
    previousMedia: (state) => {
      if (state.mediaIndex > 0) {
        state.mediaIndex -= 1;
        state.currentMedia = state.mediaGallery[state.mediaIndex];
      }
    },
    
    // Form actions
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearFormData: (state) => {
      state.formData = {};
    },
    setFormErrors: (state, action) => {
      state.formErrors = { ...state.formErrors, ...action.payload };
    },
    clearFormErrors: (state) => {
      state.formErrors = {};
    },
    
    // Pagination actions
    setCurrentPageNumber: (state, action) => {
      state.currentPageNumber = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },
    
    // Selection actions
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    addSelectedItem: (state, action) => {
      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems.push(action.payload);
      }
    },
    removeSelectedItem: (state, action) => {
      state.selectedItems = state.selectedItems.filter(
        item => item !== action.payload
      );
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
      state.selectAll = false;
    },
    toggleSelectAll: (state) => {
      state.selectAll = !state.selectAll;
    },
    
    // View mode actions
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    
    // Language actions
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    
    // Accessibility actions
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
    },
    setHighContrast: (state, action) => {
      state.highContrast = action.payload;
    },
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion;
    },
    setReducedMotion: (state, action) => {
      state.reducedMotion = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    
    // Online status
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    // Print mode
    setPrintMode: (state, action) => {
      state.printMode = action.payload;
    },
    
    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        language: state.language,
        isOnline: state.isOnline,
      };
    },
  },
});

export const {
  // Modal actions
  openModal,
  closeModal,
  closeAllModals,
  
  // Loading actions
  setLoading,
  setGlobalLoading,
  
  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Search and filter actions
  setSearchQuery,
  setActiveFilters,
  clearActiveFilters,
  
  // Layout actions
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  
  // Page navigation
  setCurrentPage,
  setBreadcrumbs,
  
  // Media viewer actions
  setCurrentMedia,
  setMediaGallery,
  setMediaIndex,
  nextMedia,
  previousMedia,
  
  // Form actions
  setFormData,
  clearFormData,
  setFormErrors,
  clearFormErrors,
  
  // Pagination actions
  setCurrentPageNumber,
  setItemsPerPage,
  
  // Selection actions
  setSelectedItems,
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  toggleSelectAll,
  
  // View mode actions
  setViewMode,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  
  // Language actions
  setLanguage,
  
  // Accessibility actions
  toggleHighContrast,
  setHighContrast,
  toggleReducedMotion,
  setReducedMotion,
  setFontSize,
  
  // Online status
  setOnlineStatus,
  
  // Print mode
  setPrintMode,
  
  // Reset
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectUI = (state) => state.ui;
export const selectModals = (state) => state.ui.modals;
export const selectLoading = (state) => state.ui.loading;
export const selectNotifications = (state) => state.ui.notifications;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectActiveFilters = (state) => state.ui.activeFilters;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectCurrentMedia = (state) => state.ui.currentMedia;
export const selectMediaGallery = (state) => state.ui.mediaGallery;
export const selectMediaIndex = (state) => state.ui.mediaIndex;
export const selectFormData = (state) => state.ui.formData;
export const selectFormErrors = (state) => state.ui.formErrors;
export const selectSelectedItems = (state) => state.ui.selectedItems;
export const selectViewMode = (state) => state.ui.viewMode;
export const selectSortBy = (state) => state.ui.sortBy;
export const selectSortOrder = (state) => state.ui.sortOrder;
export const selectLanguage = (state) => state.ui.language;
export const selectIsOnline = (state) => state.ui.isOnline;
export const selectPrintMode = (state) => state.ui.printMode;

export default uiSlice.reducer;
