import { useAuth } from './useAuth';
import { useUser } from './useUser';

export const useCurrentUser = () => {
  const auth = useAuth();
  const user = useUser();

  return {
    isReady: auth.isReady,
    isAuthenticated: auth.isAuthenticated,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    user: user.user,
    isTasker: user.isTasker,
    taskerProfile: user.taskerProfile,
    hasTaskerProfile: user.hasTaskerProfile,
    loading: user.loading,
    isRefetching: user.isRefetching,
    error: user.error,
    refetchUser: user.refetch,
  };
};

export default useCurrentUser;
