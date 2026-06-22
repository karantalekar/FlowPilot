import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/lib/slices/authSlice'
import uiReducer from '@/lib/slices/uiSlice'
import crmReducer from '@/lib/slices/crmSlice'
import projectsReducer from '@/lib/slices/projectsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    crm: crmReducer,
    projects: projectsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
