import { hydrate, prerender as ssr } from "preact-iso";

import "./style.css";
import Sun from "./assets/icons/sun.svg?react";
import Moon from "./assets/icons/moon.svg?react";
import MenuView from "./views/MenuView/MenuView";
import { useState } from "preact/hooks";
import WelcomeView from "./views/Welcome/WelcomeView";
import NewExperimentView from "./views/NewExperiment/NewExperimentView";
import HeatingView from "./views/HeatingView/HeatingView";
import { ExperimentProvider } from "./context/ExperimentContext";

const viewConstants = {
  MENU: "menu",
  NEW_EXPERIMENT: "newExperiment",
  WELCOME: "welcome",
};

const viewRenderer = (
  view: string,
  viewChanger,
  isDarkMode: boolean,
  themeColors: any
) => {
  if (view === viewConstants.NEW_EXPERIMENT)
    return (
      <NewExperimentView
        isDarkMode={isDarkMode}
        themeColors={themeColors}
        navigate={viewChanger}
      />
    );
  if (view === viewConstants.MENU)
    return (
      <MenuView
        navigate={viewChanger}
        isDarkMode={isDarkMode}
        themeColors={themeColors}
      />
    );
  if (view === viewConstants.WELCOME)
    return (
      <WelcomeView
        navigate={viewChanger}
        isDarkMode={isDarkMode}
        themeColors={themeColors}
      />
    );
  if (view === "heating") return (
    <HeatingView 
      isDarkMode={isDarkMode} 
      themeColors={themeColors} 
      navigate={viewChanger}
    />
  );

  return;
};

export function App() {
  const [view, setView] = useState(viewConstants.WELCOME);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme-aware colors
  const getThemeColors = () => ({
    background: isDarkMode ? "#1f2937" : "#ffffff",
    cardBackground: isDarkMode ? "#374151" : "#f8fafc",
    text: isDarkMode ? "#f9fafb" : "#1f2937",
    textSecondary: isDarkMode ? "#d1d5db" : "#6b7280",
    border: isDarkMode ? "#4b5563" : "#e5e7eb",
    gridLines: isDarkMode ? "#4b5563" : "#e5e7eb",
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeColors = getThemeColors();
  const renderHeader = (view: string) => {
    // Hide title only for MENU and WELCOME views - show for all others
    const titleLessViews = [viewConstants.MENU, viewConstants.WELCOME];
    const showTitle = !titleLessViews.includes(view);
    return (
      <header class="w-full p-4 flex justify-between items-center">
        {showTitle ? (
          <h1 class="text-xl font-bold" style={{ color: themeColors.text }}>
            {view.charAt(0).toUpperCase() +
              view
                .slice(1)
                .replace(/([A-Z])/g, " $1")
                .trim()}
          </h1>
        ) : (
          <div></div>
        )}

        <button
          onClick={toggleTheme}
          class="flex justify-center items-center gap-2 w-8 h-8 py-1 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: isDarkMode ? "#4b5563" : "#f3f4f6",
            color: themeColors.text,
            borderRadius: "50%",
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <span class="text-lg">
            {isDarkMode ? (
              <Sun
                class="icon"
                width="16"
                height="16"
                style={{ stroke: "#000" }}
              />
            ) : (
              <Moon width="16" height="16" style={{ fill: themeColors.text }} />
            )}
          </span>
        </button>
      </header>
    );
  };

  return (
    <ExperimentProvider>
      <div
        class="w-full h-screen overflow-hidden"
        style={{ backgroundColor: themeColors.background }}
      >
        {renderHeader(view)}
        {viewRenderer(view, setView, isDarkMode, themeColors)}
      </div>
    </ExperimentProvider>
  );
}

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app"));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
