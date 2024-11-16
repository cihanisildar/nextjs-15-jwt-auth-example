"use client";
import Spinner from "@/components/spinner";
import withAuth from "@/components/withAuth";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Dashboard</h1>
      <p className="text-gray-600 mb-6">This is a protected page. You must be logged in to view this content.</p>

      {/* User Info */}
      {user && (
        <div className="bg-white shadow rounded-md p-6 w-full max-w-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Info</h2>
          <p className="text-gray-700">
            <span className="font-medium">Name:</span> {user.name || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {user.email || "N/A"}
          </p>
        </div>
      )}

      {/* Link to Home */}
      <Link
        href="/"
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 text-center"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default withAuth(DashboardPage); // Wrap with HOC to protect
