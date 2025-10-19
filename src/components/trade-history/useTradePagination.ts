import { useState, useCallback } from 'react';

const TRADES_PER_PAGE = 50;

export const useTradePagination = (totalTrades: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(totalTrades / TRADES_PER_PAGE);
  const startIndex = (currentPage - 1) * TRADES_PER_PAGE;
  const endIndex = startIndex + TRADES_PER_PAGE;

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    reset,
    itemsPerPage: TRADES_PER_PAGE,
  };
};
