// Utility functions for managing saved trips in localStorage

export interface SavedTrip {
  id: string
  name: string
  type: 'single' | 'multi'
  data: any
  savedAt: string
}

const STORAGE_KEY = 'trippai_saved_trips'

export const savedTripsStorage = {
  // Get all saved trips
  getAll: (): SavedTrip[] => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error reading saved trips:', error)
      return []
    }
  },

  // Save a trip
  save: (trip: Omit<SavedTrip, 'id' | 'savedAt'>): SavedTrip => {
    const newTrip: SavedTrip = {
      ...trip,
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString(),
    }

    const trips = savedTripsStorage.getAll()
    trips.unshift(newTrip) // Add to beginning
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
      return newTrip
    } catch (error) {
      console.error('Error saving trip:', error)
      throw error
    }
  },

  // Update a trip's name
  updateName: (id: string, name: string): boolean => {
    const trips = savedTripsStorage.getAll()
    const index = trips.findIndex(t => t.id === id)
    
    if (index === -1) return false
    
    trips[index].name = name
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
      return true
    } catch (error) {
      console.error('Error updating trip name:', error)
      return false
    }
  },

  // Delete a trip
  delete: (id: string): boolean => {
    const trips = savedTripsStorage.getAll()
    const filtered = trips.filter(t => t.id !== id)
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Error deleting trip:', error)
      return false
    }
  },

  // Get a single trip
  getById: (id: string): SavedTrip | null => {
    const trips = savedTripsStorage.getAll()
    return trips.find(t => t.id === id) || null
  },

  // Clear all trips
  clear: (): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Error clearing trips:', error)
      return false
    }
  },
}
