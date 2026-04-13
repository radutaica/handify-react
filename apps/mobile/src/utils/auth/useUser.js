import { useCallback, useState, useEffect, useRef } from 'react';
import { useAuthStore } from './store';

export const useUser = () => {
  const { auth, isReady } = useAuthStore();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  const user = auth?.user || null;
  const isTasker = user?.user_type === 'tasker' || user?.user_type === 'both';
  const taskerProfile = user?.tasker_profile || null;

  // Auto-refetch user data on mount to get latest tasker_profile
  useEffect(() => {
    const fetchLatestUser = async () => {
      if (!auth?.jwt || hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      console.log('[useUser] Auto-fetching latest user data...');
      try {
        const { profileApi } = await import('@/api');
        const response = await profileApi.getCurrentUser();
        console.log('[useUser] Fresh user data:', response.data);
        updateUser(response.data);
      } catch (err) {
        console.error('[useUser] Auto-fetch error:', err);
      }
    };

    fetchLatestUser();
  }, [auth?.jwt, updateUser]);

  const refetch = useCallback(async () => {
    if (!auth?.jwt) return { success: false, error: 'Not authenticated' };

    setIsRefetching(true);
    setError(null);

    try {
      const { profileApi } = await import('@/api');
      const response = await profileApi.getCurrentUser();
      updateUser(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsRefetching(false);
    }
  }, [auth?.jwt, updateUser]);

  return {
    user,
    data: user,
    isTasker,
    taskerProfile,
    hasTaskerProfile: !!taskerProfile,
    loading: !isReady,
    isRefetching,
    error,
    refetch,
  };
};

export default useUser;
