import { createContext, useContext, useState, useCallback } from 'react';
import { queryService } from '../services/queryService';

const QueryContext = createContext(null);

export const QueryProvider = ({ children }) => {
  const [currentQuery, setCurrentQuery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDb, setSelectedDb] = useState('MySQL');

  const generateQuery = useCallback(async (prompt, databaseType) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await queryService.generate({ prompt, databaseType });
      setCurrentQuery(data.data);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate query';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearQuery = () => { setCurrentQuery(null); setError(null); };

  return (
    <QueryContext.Provider value={{ currentQuery, loading, error, selectedDb, setSelectedDb, generateQuery, clearQuery, setCurrentQuery }}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQuery = () => {
  const ctx = useContext(QueryContext);
  if (!ctx) throw new Error('useQuery must be used within QueryProvider');
  return ctx;
};
