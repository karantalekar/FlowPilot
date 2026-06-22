import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  language: 'en' | 'hi' | 'mr'
  notificationsOpen: boolean
  commandPaletteOpen: boolean
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  language: 'en',
  notificationsOpen: false,
  commandPaletteOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setLanguage: (state, action: PayloadAction<'en' | 'hi' | 'mr'>) => {
      state.language = action.payload
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLanguage,
  toggleNotifications,
  toggleCommandPalette,
} = uiSlice.actions
export default uiSlice.reducer
