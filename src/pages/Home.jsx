import "../styles/home.css";
import ErrorBoundary from "../components/ErrorBoundary";
import HomeHero from "../components/home/HomeHero";
import HomeHighlights from "../components/home/HomeHighlights";
import MacroOverview from "../components/home/MacroOverview";
import FeaturedModule from "../components/home/FeaturedModule";
import HomeModules from "../components/home/HomeModules";

function Home() {
  return (
    <main className="home-page">
      <ErrorBoundary>
        <HomeHero />
      </ErrorBoundary>
      <ErrorBoundary>
        <HomeHighlights />
      </ErrorBoundary>
      <ErrorBoundary>
        <MacroOverview />
      </ErrorBoundary>
      <ErrorBoundary>
        <FeaturedModule />
      </ErrorBoundary>
      <ErrorBoundary>
        <HomeModules />
      </ErrorBoundary>
    </main>
  );
}

export default Home;