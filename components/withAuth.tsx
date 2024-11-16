"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Cookies from 'js-cookie';

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { user, loading, refreshAuthToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        if (loading) return; // Wait until loading is done

        // If user is not authenticated, redirect to login
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if the auth token is expired
        const authToken = Cookies.get('auth_token');
        if (authToken) {
          try {
            const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            // If the token is expired, refresh it
            if (decodedToken.exp < currentTime) {
              await refreshAuthToken();
            }
          } catch (error) {
            console.error('Error decoding auth token:', error);
            router.push('/login'); // Redirect to login if token decoding fails
          }
        }
      };

      checkAuth();
    }, [loading, user, refreshAuthToken, router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
