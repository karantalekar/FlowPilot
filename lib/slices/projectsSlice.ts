import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  assignee?: string
  dueDate?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'on-hold' | 'completed'
  startDate: string
  endDate?: string
  tasks: Task[]
  team: string[]
}

interface ProjectsState {
  projects: Project[]
  selectedProject: Project | null
  isLoading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    updateTask: (state, action: PayloadAction<{ projectId: string; task: Task }>) => {
      const project = state.projects.find((p) => p.id === action.payload.projectId)
      if (project) {
        const taskIndex = project.tasks.findIndex((t) => t.id === action.payload.task.id)
        if (taskIndex !== -1) {
          project.tasks[taskIndex] = action.payload.task
        }
      }
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload
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
  setProjects,
  addProject,
  updateProject,
  updateTask,
  setSelectedProject,
  setLoading,
  setError,
} = projectsSlice.actions
export default projectsSlice.reducer
