import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import noticeReducer from './slices/noticeSlice';
import teacherReducer from './slices/teacherSlice';
import studentReducer from './slices/studentSlice';
import institutionReducer from './slices/institutionSlice';
import galleryReducer from './slices/gallerySlice';
import managementCommitteeReducer from './slices/managementCommitteeSlice';
import routineReducer from './slices/routineSlice';
import resultReducer from './slices/resultSlice';
import syllabusReducer from './slices/syllabusSlice';
import eventReducer from './slices/eventSlice';
import contentReducer from './slices/contentSlice';
import themeReducer from './slices/themeSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notices: noticeReducer,
    teachers: teacherReducer,
    students: studentReducer,
    institution: institutionReducer,
    gallery: galleryReducer,
    managementCommittee: managementCommitteeReducer,
    routines: routineReducer,
    results: resultReducer,
    syllabus: syllabusReducer,
    events: eventReducer,
    content: contentReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// TypeScript type definitions would go here if this was a .ts file
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
