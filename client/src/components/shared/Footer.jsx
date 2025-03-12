import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Section: About and Jobs */}
          <div className="flex flex-col space-y-2 md:text-left text-center">
            <Link
              to="/about"
              className="text-sm text-gray-600 hover:text-black"
            >
              About Us
            </Link>
            <Link
              to="/jobs"
              className="text-sm text-gray-600 hover:text-black"
            >
              Jobs
            </Link>
          </div>

          {/* Center Section: Company Info */}
          <div className="text-center mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-black">Hustle</h2>
            <p className="text-sm text-gray-600">
              Initiative by <span className="italic">St. Xavier's College, Ahmedabad</span>.
              <br />
              Team Members: Symond, Jaya, Nevin
            </p>
          </div>

          {/* Right Section: Social Links */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://github.com/Symond1"
              className="text-gray-600 hover:text-black"
              aria-label="GitHub"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.086 3.292 9.397 7.86 10.928.574.107.786-.247.786-.552v-2.14c-3.202.695-3.875-1.543-3.875-1.543-.522-1.322-1.276-1.674-1.276-1.674-1.043-.713.08-.698.08-.698 1.15.08 1.756 1.182 1.756 1.182 1.025 1.75 2.686 1.244 3.342.953.103-.744.4-1.244.728-1.53-2.558-.288-5.247-1.28-5.247-5.7 0-1.256.45-2.284 1.19-3.09-.12-.29-.518-1.45.113-3.02 0 0 .973-.31 3.18 1.177A11.036 11.036 0 0 1 12 6.816a11.01 11.01 0 0 1 2.91.393c2.207-1.487 3.18-1.177 3.18-1.177.63 1.57.233 2.73.113 3.02.74.806 1.19 1.834 1.19 3.09 0 4.43-2.694 5.41-5.26 5.69.41.35.77 1.046.77 2.106v3.124c0 .31.208.665.794.552 4.56-1.532 7.852-5.842 7.852-10.928 0-6.352-5.148-11.5-11.5-11.5z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61569703631568"
              className="text-gray-600 hover:text-black"
              aria-label="Facebook"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.676 0H1.324C.593 0 0 .592 0 1.324v21.352C0 23.408.593 24 1.324 24H12.82V14.706H9.692v-3.578h3.128V8.408c0-3.1 1.893-4.787 4.657-4.787 1.325 0 2.463.1 2.794.144v3.238l-1.918.001c-1.503 0-1.794.715-1.794 1.762v2.31h3.587l-.468 3.578h-3.119V24h6.116C23.407 24 24 23.408 24 22.676V1.324C24 .592 23.407 0 22.676 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
