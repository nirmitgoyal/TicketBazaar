import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@shared/schema';

interface PaginationData {
  currentPage: number;
  hasMoreTickets: boolean;
  defaultTickets: Ticket[];
  totalLoaded: number;
}

const STORAGE_KEY = 'home-pagination-state';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface StoredPaginationData extends PaginationData {
  timestamp: number;
  filterState: string;
}

export function usePersistentPagination(
  ticketsPerPage: number,
  currentFilterState: object
) {
  const filterStateKey = JSON.stringify(currentFilterState);
  
  // Initialize state from sessionStorage if available and valid
  const initializeState = useCallback((): PaginationData => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredPaginationData = JSON.parse(stored);
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
        const isSameFilters = data.filterState === filterStateKey;
        
        if (!isExpired && isSameFilters) {
          return {
            currentPage: data.currentPage,
            hasMoreTickets: data.hasMoreTickets,
            defaultTickets: data.defaultTickets,
            totalLoaded: data.totalLoaded
          };
        }
      }
    } catch (error) {
      console.warn('Failed to restore pagination state:', error);
    }
    
    return {
      currentPage: 1,
      hasMoreTickets: true,
      defaultTickets: [],
      totalLoaded: 0
    };
  }, [filterStateKey]);

  const [state, setState] = useState<PaginationData>(initializeState);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const dataToStore: StoredPaginationData = {
        ...state,
        timestamp: Date.now(),
        filterState: filterStateKey
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn('Failed to save pagination state:', error);
    }
  }, [state, filterStateKey]);

  const updateTickets = useCallback((tickets: Ticket[]) => {
    setState(prev => ({
      ...prev,
      defaultTickets: tickets,
      totalLoaded: tickets.length,
      hasMoreTickets: tickets.length === ticketsPerPage
    }));
  }, [ticketsPerPage]);

  const appendTickets = useCallback((newTickets: Ticket[]) => {
    setState(prev => ({
      ...prev,
      currentPage: prev.currentPage + 1,
      defaultTickets: [...prev.defaultTickets, ...newTickets],
      totalLoaded: prev.totalLoaded + newTickets.length,
      hasMoreTickets: newTickets.length === ticketsPerPage
    }));
  }, [ticketsPerPage]);

  const resetPagination = useCallback(() => {
    setState({
      currentPage: 1,
      hasMoreTickets: true,
      defaultTickets: [],
      totalLoaded: 0
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear pagination state:', error);
    }
  }, []);

  return {
    ...state,
    isLoadingMore,
    setIsLoadingMore,
    updateTickets,
    appendTickets,
    resetPagination
  };
}