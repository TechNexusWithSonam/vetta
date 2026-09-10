/**
 * Shell for every public marketing route: sticky header, page outlet, footer.
 * Scrolls back to the top on navigation (React Router doesn't do this itself).
 */

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MarketingHeader from './MarketingHeader.jsx';
import MarketingFooter from './MarketingFooter.jsx';

export default function MarketingLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-svh flex-col bg-white font-sans text-slate-900">
      <MarketingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
