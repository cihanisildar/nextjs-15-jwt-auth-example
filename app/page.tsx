"use client";

import Spinner from "@/components/spinner";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import React from "react";

const HomePage = () => {
  const { user, loading, error, cookieStatus, logout } = useAuth();

  // Log only when loading changes or there's an error
  React.useEffect(() => {
    console.log("Auth status:", {
      isAuthenticated: !!user,
      cookieStatus,
      loading,
      error,
    });
  }, [user, loading, error, cookieStatus]); // Log only on these dependencies

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to Our App
          </h1>
          <p className="mt-2 text-gray-600">
            Get started by signing in or creating an account
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 text-center"
              >
                Create Account
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 text-center"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 text-center"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
