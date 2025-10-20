import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-md text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-24 w-24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "hsl(var(--wedding-rose))" }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>

        <h1
          className="mt-4 text-6xl font-bold"
          style={{ color: "hsl(var(--wedding-rose))" }}>
          404
        </h1>

        <p className="mt-2 text-lg text-gray-700">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        <Link
          to="/"
          className="inline-block rounded px-6 py-3 font-semibold shadow-lg transition"
          style={{
            backgroundColor: "hsl(var(--wedding-rose))",
            color: "#fff",
          }}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
