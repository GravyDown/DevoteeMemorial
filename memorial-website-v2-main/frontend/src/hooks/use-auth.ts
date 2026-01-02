

export function useAuth() {
  // Mock implementation since Convex is removed
  const isLoading = false;
  const isAuthenticated = false; // Set to true to test authenticated state
  const user = null; // Mock user object if needed

  const signIn = async () => console.log("Sign in mock");
  const signOut = async () => console.log("Sign out mock");

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
