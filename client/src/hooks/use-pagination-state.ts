import { useState, useCallback, useRef } from 'react';
import { Ticket } from '@shared/schema';

interface PaginationState {
  currentPage: number;
  hasMoreTickets: boolean;
  defaultTickets: Ticket[];
  isLoadingMore: boolean;
}

interface UsePaginationStateReturn extends PaginationState {
  setCurrentPage: (page: number) => void;
  setHasMoreTickets: (hasMore: boolean) => void;
  setDefaultTickets: (tickets: Ticket[] | ((prev: Ticket[]) => Ticket[])) => void;
  setIsLoadingMore: (loading: boolean) => void;
  resetPagination: () => void;
  appendTickets: (newTickets: Ticket[]) => void;
}

export function usePaginationState(ticketsPerPage: number): UsePaginationStateReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTickets, setHasMoreTickets] = useState(true);
  const [defaultTickets, setDefaultTickets] = useState<Ticket[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Keep track of filter state to prevent unnecessary resets
  const lastFiltersRef = useRef<string>('');

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setHasMoreTickets(true);
    setDefaultTickets([]);
    setIsLoadingMore(false);
  }, []);

  const appendTickets = useCallback((newTickets: Ticket[]) => {
    setDefaultTickets(prev => [...prev, ...newTickets]);
    setHasMoreTickets(newTickets.length === ticketsPerPage);
  }, [ticketsPerPage]);

  return {
    currentPage,
    hasMoreTickets,
    defaultTickets,
    isLoadingMore,
    setCurrentPage,
    setHasMoreTickets,
    setDefaultTickets,
    setIsLoadingMore,
    resetPagination,
    appendTickets,
  };
}