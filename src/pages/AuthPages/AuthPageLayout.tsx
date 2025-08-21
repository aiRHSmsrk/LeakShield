import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-gradient-to-br from-blue-900 via-gray-900 to-black dark:from-gray-900 dark:via-gray-800 dark:to-black lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-sm px-6 text-center">
              <Link to="/" className="block mb-6">
                <img
                  width={220}
                  height={60}
                  src="/images/logo/LSwhite_name.svg"
                  alt="LeakShield"
                  className="drop-shadow-md"
                />
              </Link>
              <p className="text-gray-300 text-sm leading-relaxed dark:text-gray-300">
                Real‑time exploited vulnerability intelligence, KEV monitoring &
                exposure analytics.
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-wider text-blue-300/70">
                Secure. Actionable. Fast.
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
