import { create } from 'zustand';

export type TourMode = 'full' | 'updates' | 'manual-full' | 'manual-updates';

interface TourState {
  shouldShowTour: boolean;
  tourMode: TourMode;
  hasNewUpdates: boolean;
  loading: boolean;
  setShouldShowTour: (show: boolean) => void;
  setTourMode: (mode: TourMode) => void;
  setHasNewUpdates: (hasUpdates: boolean) => void;
  setLoading: (loading: boolean) => void;
  startTour: (mode: TourMode) => void;
}

export const useTourStore = create<TourState>((set) => ({
  shouldShowTour: false,
  tourMode: 'full',
  hasNewUpdates: false,
  loading: true,
  setShouldShowTour: (show) => {
    console.log('🎯 Tour state changed:', { shouldShowTour: show });
    set({ shouldShowTour: show });
  },
  setTourMode: (mode) => {
    console.log('🎯 Tour mode changed:', mode);
    set({ tourMode: mode });
  },
  setHasNewUpdates: (hasUpdates) => set({ hasNewUpdates: hasUpdates }),
  setLoading: (loading) => set({ loading }),
  startTour: (mode) => {
    console.log('🚀 Starting tour with mode:', mode);
    set({ tourMode: mode, shouldShowTour: true });
  },
}));
