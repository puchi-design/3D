import { useCallback, useEffect, useState } from 'react';
import { getToolByRoute, PAGE_SEO } from './data/cadCatalog';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { TextToCadPage } from './pages/TextToCadPage';
import { ParametricCadPage } from './pages/ParametricCadPage';
import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage';
import { ExamplesPage } from './pages/ExamplesPage';
import { GuidesPage } from './pages/GuidesPage';
import { ToolDetailPage } from './pages/ToolDetailPage';

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function setMetaContent(selector: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() =>
    normalizePath(window.location.pathname),
  );

  const navigate = useCallback((route: string) => {
    const next = normalizePath(route);
    if (next !== normalizePath(window.location.pathname)) {
      window.history.pushState({}, '', next);
    }
    setCurrentRoute(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keep page <title>, meta description, OpenGraph, and Twitter card synced with current route
  useEffect(() => {
    const tool = getToolByRoute(currentRoute);
    const meta = tool
      ? { title: tool.seoTitle, description: tool.seoDescription }
      : PAGE_SEO[currentRoute] || PAGE_SEO['/'];

    document.title = meta.title;
    setMetaContent('meta[name="description"]', meta.description);
    setMetaContent('meta[property="og:title"]', meta.title);
    setMetaContent('meta[property="og:description"]', meta.description);
    setMetaContent('meta[name="twitter:title"]', meta.title);
    setMetaContent('meta[name="twitter:description"]', meta.description);
  }, [currentRoute]);

  const matchedTool = getToolByRoute(currentRoute);

  const renderPage = () => {
    if (matchedTool) {
      return <ToolDetailPage tool={matchedTool} onNavigate={navigate} />;
    }
    switch (currentRoute) {
      case '/text-to-cad':
        return <TextToCadPage onNavigate={navigate} />;
      case '/parametric-cad':
        return <ParametricCadPage onNavigate={navigate} />;
      case '/tools':
        return <ToolsDirectoryPage onNavigate={navigate} />;
      case '/examples':
        return <ExamplesPage onNavigate={navigate} />;
      case '/guides':
        return <GuidesPage onNavigate={navigate} />;
      case '/':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header currentRoute={currentRoute} onNavigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
