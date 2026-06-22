import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  value?: number
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  status: 'active' | 'inactive' | 'churn'
  createdAt: string
}

interface CRMState {
  leads: Lead[]
  customers: Customer[]
  selectedLead: Lead | null
  selectedCustomer: Customer | null
  isLoading: boolean
  error: string | null
}

const initialState: CRMState = {
  leads: [],
  customers: [],
  selectedLead: null,
  selectedCustomer: null,
  isLoading: false,
  error: null,
}

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setLeads: (state, action: PayloadAction<Lead[]>) => {
      state.leads = action.payload
    },
    addLead: (state, action: PayloadAction<Lead>) => {
      state.leads.push(action.payload)
    },
    updateLead: (state, action: PayloadAction<Lead>) => {
      const index = state.leads.findIndex((l) => l.id === action.payload.id)
      if (index !== -1) {
        state.leads[index] = action.payload
      }
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload)
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.customers[index] = action.payload
      }
    },
    setSelectedLead: (state, action: PayloadAction<Lead | null>) => {
      state.selectedLead = action.payload
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setLeads,
  addLead,
  updateLead,
  setCustomers,
  addCustomer,
  updateCustomer,
  setSelectedLead,
  setSelectedCustomer,
  setLoading,
  setError,
} = crmSlice.actions
export default crmSlice.reducer
