import { useState, useEffect } from "preact/hooks";
import Timelapse from "../../assets/icons/timelapse.svg?react";
import { useExperimentConfig } from "../../context/ExperimentContext";

interface HeatingViewProps {
  isDarkMode?: boolean;
  themeColors?: any;
  navigate?: (view: string) => void;
}

function getStageColor(index: number) {
  const colors = [
    "#dc2626",
    "#ea580c",
    "#d97706",
    "#16a34a",
    "#0891b2",
    "#7c3aed",
  ];
  return colors[index % colors.length];
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

const HeatingView = ({ themeColors, navigate }: HeatingViewProps) => {
  const { config } = useExperimentConfig();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [isRunning, setIsRunning] = useState(true);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  useEffect(() => {
    if (config.stages.length > 0) {
      setCurrentStageIndex(0);
      setTimeRemaining(config.stages[0].time);
      setTotalElapsed(0);
    }
  }, [config.stages]);

  const currentStage = config.stages[currentStageIndex] || {
    stage: "Default",
    temp: 95,
    time: 120,
  };
  const isComplete = currentStageIndex >= config.stages.length;

  useEffect(() => {
    if (isComplete && navigate) {
      setRedirectCountdown(3);

      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            navigate("results");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isComplete, navigate]);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          const nextIndex = currentStageIndex + 1;
          setTotalElapsed((elapsed) => elapsed + currentStage.time);

          if (nextIndex >= config.stages.length) {
            setCurrentStageIndex(nextIndex);
            setIsRunning(false);
            return 0;
          }

          setCurrentStageIndex(nextIndex);
          return config.stages[nextIndex].time;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    isComplete,
    currentStageIndex,
    currentStage.time,
    config.stages,
  ]);

  const progress =
    ((totalElapsed + (currentStage.time - timeRemaining)) / config.totalTime) *
    100;

  const defaultTheme = {
    background: "#ffffff",
    cardBackground: "#f8fafc",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  };

  const theme = themeColors || defaultTheme;

  return (
    <div
      class="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-6" style={{ color: theme.text }}>
          Thermal Cycling in Progress
        </h1>

        <div class="flex items-center justify-center mb-8">
          <Timelapse
            width={120}
            height={120}
            style={{
              fill: isComplete ? "#16a34a" : "#8466d1",
              animation: isRunning ? "spin 2s linear infinite" : "none",
            }}
          />
        </div>
      </div>

      <div
        class="w-full max-w-lg p-8 rounded-xl shadow-lg text-center"
        style={{
          backgroundColor: theme.cardBackground,
          border: `2px solid ${theme.border}`,
        }}
      >
        {isComplete ? (
          <div>
            <h2 class="text-2xl font-bold text-green-600 mb-4">
              🎉 All Stages Complete!
            </h2>
            <p class="text-lg mb-6" style={{ color: theme.textSecondary }}>
              Thermal cycling has finished successfully with{" "}
              {config.stages.length} stages.
            </p>
            <div class="mb-4 text-sm" style={{ color: theme.textSecondary }}>
              Total configured time: {formatTime(config.totalTime)}
            </div>
            {redirectCountdown > 0 && (
              <div
                class="mb-4 p-3 rounded-lg border"
                style={{
                  backgroundColor: theme.cardBackground,
                  borderColor: "#3b82f6",
                }}
              >
                <p style={{ color: "#3b82f6" }} class="font-semibold">
                  📊 Redirecting to results in {redirectCountdown} second
                  {redirectCountdown !== 1 ? "s" : ""}...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div class="flex items-center justify-center mb-4">
              <div
                class="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: getStageColor(currentStageIndex) }}
              />
              <h2 class="text-2xl font-bold" style={{ color: theme.text }}>
                {currentStage.stage} - Step {currentStageIndex + 1} of{" "}
                {config.stages.length}
              </h2>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-6">
              <div class="text-center">
                <p class="text-sm" style={{ color: theme.textSecondary }}>
                  Current Temperature
                </p>
                <p class="text-3xl font-bold" style={{ color: "#dc2626" }}>
                  {currentStage.temp}°C
                </p>
              </div>
              <div class="text-center">
                <p class="text-sm" style={{ color: theme.textSecondary }}>
                  Time Remaining
                </p>
                <p class="text-3xl font-bold" style={{ color: "#1976d2" }}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>

            <div class="mb-6">
              <div
                class="flex justify-between text-sm mb-2"
                style={{ color: theme.textSecondary }}
              >
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div
                class="w-full h-4 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.border }}
              >
                <div
                  class="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: getStageColor(currentStageIndex),
                  }}
                />
              </div>
              <p
                class="text-xs mt-2 text-center"
                style={{ color: theme.textSecondary }}
              >
                Total Time: {formatTime(config.totalTime)} | Stages:{" "}
                {config.stages.length}
              </p>
              {config.isConfigured && (
                <p
                  class="text-xs mt-1 text-center"
                  style={{ color: "#16a34a" }}
                >
                  ✓ Using custom configuration
                </p>
              )}
            </div>
          </div>
        )}

        <div class="flex justify-center gap-4">
          {!isComplete && (
            <button
              onClick={() => setIsRunning(!isRunning)}
              class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: isRunning ? "#dc2626" : "#16a34a",
                color: "white",
              }}
            >
              {isRunning ? "⏸️ Pause" : "▶️ Resume"}
            </button>
          )}

          <button
            onClick={() => navigate && navigate("newExperiment")}
            class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.border,
              color: theme.text,
            }}
          >
            🔙 Back to Setup
          </button>

          {isComplete && (
            <>
              <button
                onClick={() => navigate && navigate("results")}
                class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: "#16a34a",
                  color: "white",
                }}
              >
                📊 View Results
              </button>
              <button
                onClick={() => {
                  setCurrentStageIndex(0);
                  setTimeRemaining(config.stages[0]?.time || 120);
                  setTotalElapsed(0);
                  setIsRunning(true);
                }}
                class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: "#8466d1",
                  color: "white",
                }}
              >
                🔄 Start New Cycle
              </button>
            </>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default HeatingView;
