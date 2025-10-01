import { useState, useMemo, useEffect } from "preact/hooks";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Cell,
} from "recharts";
import CircleButton from "../CircleButton/CircleButton";
import {
  useExperimentConfig,
  type StageData,
} from "../../context/ExperimentContext";

const initialData: StageData[] = [
  { stage: "Stage 1", temp: 95, time: 120 },
  { stage: "Stage 2", temp: 94, time: 30 },
  { stage: "Stage 2", temp: 50.7, time: 30 },
  { stage: "Stage 2", temp: 72, time: 60 },
  { stage: "Stage 3", temp: 72, time: 600 },
  { stage: "Stage 3", temp: 15, time: 15 },
];

// Helper to format seconds as hh:mm:ss
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
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

interface TermoCicloTronConfigProps {
  isDarkMode: boolean;
  themeColors: any;
  navigate?: (view: string) => void;
}

export default function TermoCicloTronConfig({
  isDarkMode,
  themeColors,
  navigate,
}: TermoCicloTronConfigProps) {
  const { config, updateConfig } = useExperimentConfig();
  // Always start with the config stages if available, otherwise use initialData
  const [data, setData] = useState(
    config.stages.length > 0 ? config.stages : initialData
  );

  // Sync with global config on mount - ensure we always have valid data
  useEffect(() => {
    if (config.stages.length > 0) {
      setData(config.stages);
    } else {
      // If config has no stages, update it with our initial data
      setData(initialData);
      updateConfig(initialData);
    }
  }, []);

  // Update global context when data changes (but not during initial load)
  useEffect(() => {
    // Only update global config if we actually have data and it's different from current config
    if (
      data.length > 0 &&
      JSON.stringify(data) !== JSON.stringify(config.stages)
    ) {
      updateConfig(data);
    }
  }, [data]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTemp, setEditTemp] = useState("");
  const [editTime, setEditTime] = useState("");
  const [isEditingTotalTime, setIsEditingTotalTime] = useState(false);
  const [editHours, setEditHours] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [editSeconds, setEditSeconds] = useState("");
  const totalTime = useMemo(
    () => data.reduce((sum, d) => sum + d.time, 0),
    [data]
  );

  const secondsToHMS = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { hours: h, minutes: m, seconds: s };
  };

  const hmsToSeconds = (hours: number, minutes: number, seconds: number) => {
    return hours * 3600 + minutes * 60 + seconds;
  };

  const startEditingTotalTime = () => {
    const { hours, minutes, seconds } = secondsToHMS(totalTime);
    setIsEditingTotalTime(true);
    setEditHours(String(hours));
    setEditMinutes(String(minutes));
    setEditSeconds(String(seconds));
  };

  const cancelEditTotalTime = () => {
    setIsEditingTotalTime(false);
    setEditHours("");
    setEditMinutes("");
    setEditSeconds("");
  };

  const saveTotalTime = () => {
    const hours = parseInt(editHours, 10) || 0;
    const minutes = parseInt(editMinutes, 10) || 0;
    const seconds = parseInt(editSeconds, 10) || 0;

    const newTotalTime = hmsToSeconds(hours, minutes, seconds);

    if (newTotalTime <= 0) {
      cancelEditTotalTime();
      return;
    }

    const currentTotal = totalTime;
    const ratio = newTotalTime / currentTotal;

    const newData = data.map((stage) => ({
      ...stage,
      time: Math.round(stage.time * ratio),
    }));

    setData(newData);
    setIsEditingTotalTime(false);
    setEditHours("");
    setEditMinutes("");
    setEditSeconds("");
  };

  const handleStageClick = (stageIndex: number) => {
    setEditingIndex(stageIndex);
    setEditTemp(String(data[stageIndex].temp));
    setEditTime(String(data[stageIndex].time));
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const newData = [...data];
    newData[editingIndex] = {
      ...newData[editingIndex],
      temp: parseFloat(editTemp) || 0,
      time: parseInt(editTime, 10) || 0,
    };
    setData(newData);
    setEditingIndex(null);
    setEditTemp("");
    setEditTime("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditTemp("");
    setEditTime("");
  };

  // Create bar chart data - one bar per stage
  const barData = useMemo(() => {
    const stageCounts = {};
    const minTemp = Math.min(...data.map((d) => d.temp));
    const maxTemp = Math.max(...data.map((d) => d.temp));

    return data.map((stage, index) => {
      if (!stageCounts[stage.stage]) {
        stageCounts[stage.stage] = 0;
      }
      stageCounts[stage.stage]++;

      return {
        stageIndex: index,
        stage: stage.stage,
        temp: stage.temp,
        time: stage.time,
        name: `${stage.stage} (${stageCounts[stage.stage]})`,
        timeFormatted: formatTime(stage.time),
        color: getStageColor(index),
        // Add next stage temp for trapezoid shape
        nextTemp: index < data.length - 1 ? data[index + 1].temp : stage.temp,
        minTemp,
        maxTemp,
      };
    });
  }, [data]);

  // Custom shape component for trapezoids
  const TrapezoidBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const currentTemp = payload.temp;
    const nextTemp = payload.nextTemp;
    const stageIndex = payload.stageIndex;

    // For the last bar, just draw a rectangle
    if (stageIndex === barData.length - 1) {
      const path = `
        M ${x} ${y + height}
        L ${x} ${y}
        L ${x + width} ${y}
        L ${x + width} ${y + height}
        Z
      `;

      return (
        <path
          d={path}
          fill={`url(#gradient${payload.stageIndex})`}
          stroke={getStageColor(payload.stageIndex)}
          strokeWidth={2}
          style={{ cursor: "pointer" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (payload && payload.stageIndex !== undefined) {
              handleStageClick(payload.stageIndex);
            }
          }}
        />
      );
    }

    // Get the next bar's data for proper connection
    const nextBarData = barData[stageIndex + 1];
    if (!nextBarData) {
      // Fallback to rectangle if no next bar
      const path = `
        M ${x} ${y + height}
        L ${x} ${y}
        L ${x + width} ${y}
        L ${x + width} ${y + height}
        Z
      `;

      return (
        <path
          d={path}
          fill={`url(#gradient${payload.stageIndex})`}
          stroke={getStageColor(payload.stageIndex)}
          strokeWidth={2}
          style={{ cursor: "pointer" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (payload && payload.stageIndex !== undefined) {
              handleStageClick(payload.stageIndex);
            }
          }}
        />
      );
    }

    // Calculate the Y position for the next temperature using the chart's domain
    const minTemp = payload.minTemp - 5;
    const currentTempFromMin = currentTemp - minTemp;
    const nextTempFromMin = nextTemp - minTemp;
    const tempRatio = nextTempFromMin / currentTempFromMin;
    const nextY = y + height - height * tempRatio;

    // Draw trapezoid
    const path = `
      M ${x} ${y + height}
      L ${x} ${y}
      L ${x + width} ${nextY}
      L ${x + width} ${y + height}
      Z
    `;

    return (
      <path
        d={path}
        fill={`url(#gradient${payload.stageIndex})`}
        stroke={getStageColor(payload.stageIndex)}
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (payload && payload.stageIndex !== undefined) {
            handleStageClick(payload.stageIndex);
          }
        }}
      />
    );
  };

  const renderChart = () => {
    // Calculate separator positions for different stages
    const separatorPositions = [];
    barData.forEach((bar, index) => {
      if (index > 0 && bar.stage !== barData[index - 1].stage) {
        // Position separator between the previous bar and current bar
        // Each bar takes equal width, so separator should be at the midpoint
        const totalBars = barData.length;
        const barWidth = 100 / totalBars;
        const separatorPosition = (index + 0.2) * barWidth;

        separatorPositions.push({
          position: separatorPosition,
          stageName: bar.stage,
          index,
        });
      }
    });

    return (
      <div style={{ width: "100%", height: "450px", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            margin={{ top: 30, right: 30, left: 30, bottom: 80 }}
            barCategoryGap={0}
          >
            <defs>
              {data.map((_, index) => {
                const color = getStageColor(index);
                return (
                  <linearGradient
                    key={index}
                    id={`gradient${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={themeColors.gridLines}
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={11}
              stroke={themeColors.textSecondary}
            />
            <YAxis
              domain={["dataMin - 5", "dataMax + 10"]}
              stroke={themeColors.textSecondary}
              tick={false}
              label={{
                value: "Temperature (°C)",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: themeColors.textSecondary,
                },
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const color = getStageColor(data.stageIndex);
                  return (
                    <div
                      style={{
                        backgroundColor: themeColors.cardBackground,
                        padding: "16px",
                        border: `2px solid ${color}`,
                        borderRadius: "12px",
                        boxShadow: isDarkMode
                          ? "0 8px 16px rgba(0,0,0,0.3)"
                          : "0 8px 16px rgba(0,0,0,0.1)",
                        minWidth: "200px",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: "bold",
                          margin: "0 0 12px 0",
                          color: color,
                          fontSize: "16px",
                        }}
                      >
                        {data.name}
                      </p>
                      <div
                        style={{
                          borderTop: `1px solid ${color}`,
                          paddingTop: "8px",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            color: "#dc2626",
                            fontWeight: "500",
                          }}
                        >
                          🌡️ Temperature: {data.temp}°C
                        </p>
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            color: "#1976d2",
                            fontWeight: "500",
                          }}
                        >
                          ⏱️ Duration: {data.timeFormatted}
                        </p>
                      </div>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "12px",
                          color: themeColors.textSecondary,
                          fontStyle: "italic",
                          textAlign: "center",
                          borderTop: `1px solid ${themeColors.border}`,
                          paddingTop: "8px",
                        }}
                      >
                        👆 Click to edit this stage
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              dataKey="temp"
              style={{ cursor: "pointer" }}
              shape={TrapezoidBar}
            >
              {barData.map((_, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {separatorPositions.map((separator) => (
          <div
            key={`separator-${separator.index}`}
            style={{
              position: "absolute",
              left: `calc(30px + (100% - 60px) * ${separator.position / 100})`,
              top: "30px",
              bottom: "80px",
              width: "2px",
              background: `linear-gradient(to bottom, transparent, ${themeColors.text}, transparent)`,
              opacity: 0.6,
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        ))}

        {separatorPositions.map((separator) => (
          <div
            key={`label-${separator.index}`}
            style={{
              position: "absolute",
              left: `calc(30px + (100% - 60px) * ${
                separator.position / 100
              } + 5px)`,
              top: "10px",
              fontSize: "12px",
              fontWeight: "bold",
              color: themeColors.text,
              background: themeColors.background,
              padding: "2px 6px",
              borderRadius: "4px",
              border: `1px solid ${themeColors.border}`,
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            → {separator.stageName}
          </div>
        ))}
      </div>
    );
  };

  const renderEditModal = () => {
    if (editingIndex === null) return null;

    return (
      <div
        class="fixed inset-0 flex justify-center items-center z-50"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            cancelEdit();
          }
        }}
      >
        <div
          class="p-6 rounded-xl shadow-xl transition-colors duration-300"
          style={{
            maxWidth: "450px",
            width: "90%",
            borderColor: getStageColor(editingIndex),
            padding: "24px",
            border: `2px solid ${getStageColor(editingIndex)}`,
            borderRadius: "12px",
            backgroundColor: themeColors.cardBackground,
            boxShadow: isDarkMode
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            color: themeColors.text,
          }}
        >
          <div class="flex items-center justify-center mb-4">
            <div
              class="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: getStageColor(editingIndex) }}
            ></div>
            <h3 class="text-xl font-bold" style={{ color: themeColors.text }}>
              Edit {data[editingIndex].stage} (Step {editingIndex + 1})
            </h3>
          </div>
          <div class="space-y-5">
            <div>
              <label
                class="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                🌡️ Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={editTemp}
                onInput={(e) =>
                  setEditTemp((e.target as HTMLInputElement).value)
                }
                class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter temperature"
                style={{
                  fontSize: "16px",
                  backgroundColor: isDarkMode ? "#4b5563" : "#ffffff",
                  borderColor: themeColors.border,
                  color: themeColors.text,
                }}
              />
            </div>
            <div>
              <label
                class="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                ⏱️ Time (seconds)
              </label>
              <input
                type="number"
                value={editTime}
                onInput={(e) =>
                  setEditTime((e.target as HTMLInputElement).value)
                }
                class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter time in seconds"
                style={{
                  fontSize: "16px",
                  backgroundColor: isDarkMode ? "#4b5563" : "#ffffff",
                  borderColor: themeColors.border,
                  color: themeColors.text,
                }}
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              onClick={saveEdit}
              class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              Save Changes
            </button>
            <button
              onClick={cancelEdit}
              class="flex-1 px-6 py-3 text-red rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold hover:shadow-xl transform hover:scale-105"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInfoSection = () => (
    <div
      class="mt-6 w-5/6 text-center rounded-lg p-4 transition-colors duration-300"
      style={{ backgroundColor: themeColors.cardBackground }}
    >
      <div
        class="text-sm space-y-2"
        style={{ color: themeColors.textSecondary }}
      >
        <p class="font-semibold text-lg" style={{ color: themeColors.text }}>
          📊 Click on any bar to edit that stage
        </p>
        <div
          class="flex items-center justify-center gap-3"
          style={{ color: themeColors.text }}
        >
          <span>Total cycle time:</span>
          {isEditingTotalTime ? (
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  value={editHours}
                  onInput={(e) =>
                    setEditHours((e.target as HTMLInputElement).value)
                  }
                  class="px-2 py-1 border rounded text-center font-bold"
                  style={{
                    backgroundColor: isDarkMode ? "#4b5563" : "#ffffff",
                    borderColor: themeColors.border,
                    color: themeColors.text,
                    width: "50px",
                  }}
                  placeholder="0"
                  min="0"
                />
                <span
                  class="text-sm"
                  style={{ color: themeColors.textSecondary }}
                >
                  h
                </span>
              </div>
              <span style={{ color: themeColors.textSecondary }}>:</span>
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  value={editMinutes}
                  onInput={(e) =>
                    setEditMinutes((e.target as HTMLInputElement).value)
                  }
                  class="px-2 py-1 border rounded text-center font-bold"
                  style={{
                    backgroundColor: isDarkMode ? "#4b5563" : "#ffffff",
                    borderColor: themeColors.border,
                    color: themeColors.text,
                    width: "50px",
                  }}
                  placeholder="0"
                  min="0"
                  max="59"
                />
                <span
                  class="text-sm"
                  style={{ color: themeColors.textSecondary }}
                >
                  m
                </span>
              </div>
              <span style={{ color: themeColors.textSecondary }}>:</span>
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  value={editSeconds}
                  onInput={(e) =>
                    setEditSeconds((e.target as HTMLInputElement).value)
                  }
                  class="px-2 py-1 border rounded text-center font-bold"
                  style={{
                    backgroundColor: isDarkMode ? "#4b5563" : "#ffffff",
                    borderColor: themeColors.border,
                    color: themeColors.text,
                    width: "50px",
                  }}
                  placeholder="0"
                  min="0"
                  max="59"
                />
                <span
                  class="text-sm"
                  style={{ color: themeColors.textSecondary }}
                >
                  s
                </span>
              </div>
              <button
                onClick={saveTotalTime}
                class="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                ✓
              </button>
              <button
                onClick={cancelEditTotalTime}
                class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                ✗
              </button>
            </div>
          ) : (
            <span
              class="font-bold text-blue-600 text-lg cursor-pointer hover:text-blue-700 transition-colors px-2 py-1 rounded border-2 border-transparent hover:border-blue-300"
              onClick={startEditingTotalTime}
              title="Click to edit total cycle time"
            >
              {formatTime(totalTime)}
            </span>
          )}
        </div>
        <div class="flex justify-center gap-4 mt-3">
          {data.map((stage, index) => (
            <div key={index} class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: getStageColor(index) }}
              ></div>
              <span class="text-xs" style={{ color: themeColors.text }}>
                {stage.stage} ({index + 1})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      class="flex flex-col items-center w-full h-full transition-colors duration-300 overflow-auto"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.text,
      }}
    >
      <div class="flex items-end justify-center gap-12 w-full max-w-6xl px-4">
        <div class="flex-1">
          {renderChart()}
          <div class={"flex justify-center gap-6 items-center"}>
            {renderInfoSection()}
            <button
              onClick={() => navigate("heating")}
              class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              style="background-color: blue; color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
            >
              Start Experiment
            </button>
          </div>
        </div>
      </div>
      {renderEditModal()}
    </div>
  );
}
