import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen items-center justify-center">
      {/* Error Code */}
      <h1 className="text-8xl font-bold text-primary mb-4">404</h1>

      {/* Error Message */}
      <p className="text-2xl font-semibold text-gray-400 mb-6">
        The page you're looking for doesn't exist.
      </p>

      {/* Navigation Link */}
      <Link
        to="/"
        className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-secondary transition duration-300"
      >
        Go Back Home
      </Link>

      {/* Visual Decoration */}
      {/* <div className="mt-10 w-80 h-80 bg-gray-700 rounded-full flex justify-center items-center relative">
        <div className="absolute w-64 h-64 bg-primary rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute w-48 h-48 bg-secondary rounded-full"></div>
      </div> */}
    </div>
  );
};

export default NotFoundPage;
