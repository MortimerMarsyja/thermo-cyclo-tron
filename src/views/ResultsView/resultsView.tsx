import { useState, useMemo } from "preact/hooks";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useExperimentConfig } from "../../context/ExperimentContext";

interface ResultsViewProps {
  isDarkMode?: boolean;
  themeColors?: any;
  navigate?: (view: string) => void;
}

// Generate mock PCR amplification data
const generatePCRData = (cycles: number, samples: string[]) => {
  const data = [];

  for (let cycle = 1; cycle <= cycles; cycle++) {
    const dataPoint: any = { cycle };

    samples.forEach((sample) => {
      // Different amplification patterns for different samples
      let fluorescence = 0;

      if (sample.includes("Positive")) {
        // Exponential growth starting around cycle 15-20
        const startCycle = 15 + Math.random() * 5;
        if (cycle > startCycle) {
          fluorescence = Math.pow(1.8, cycle - startCycle) * 0.1 + Math.random() * 0.05;
        } else {
          fluorescence = 0.1 + Math.random() * 0.02;
        }
      } else if (sample.includes("Control")) {
        // Slight exponential growth starting later
        const startCycle = 25 + Math.random() * 5;
        if (cycle > startCycle) {
          fluorescence = Math.pow(1.6, cycle - startCycle) * 0.05 + Math.random() * 0.03;
        } else {
          fluorescence = 0.1 + Math.random() * 0.01;
        }
      } else {
        // Negative control - minimal growth
        fluorescence = 0.1 + Math.random() * 0.01 + (cycle * 0.001);
      }

      dataPoint[sample] = Math.max(0, fluorescence);
    });

    data.push(dataPoint);
  }

  return data;
};

// Generate threshold analysis data
const generateThresholdData = (samples: string[]) => {
  return samples.map((sample, index) => {
    let ct = 0;
    let concentration = 0;

    if (sample.includes("Positive")) {
      ct = 18 + Math.random() * 4;
      concentration = 1000 / Math.pow(2, ct - 15);
    } else if (sample.includes("Control")) {
      ct = 28 + Math.random() * 4;
      concentration = 1000 / Math.pow(2, ct - 15);
    } else {
      ct = 0; // No amplification
      concentration = 0;
    }

    return {
      sample,
      ct: ct > 0 ? ct.toFixed(2) : "N/A",
      concentration: concentration > 1 ? concentration.toFixed(0) : concentration.toFixed(3),
      color: index % 2 === 0 ? "#dc2626" : "#16a34a",
    };
  });
};

const ResultsView = ({ themeColors, navigate }: ResultsViewProps) => {
  const { config } = useExperimentConfig();
  const [activeTab, setActiveTab] = useState("amplification");

  const defaultTheme = {
    background: "#ffffff",
    cardBackground: "#f8fafc",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  };

  const theme = themeColors || defaultTheme;

  // Mock samples for demonstration
  const samples = ["Sample 1 (Positive)", "Sample 2 (Positive)", "Sample 3 (Control)", "Sample 4 (Negative)"];
  const cycles = 40;

  const pcrData = useMemo(() => generatePCRData(cycles, samples), [cycles, samples]);
  const thresholdData = useMemo(() => generateThresholdData(samples), [samples]);

  const sampleColors = ["#dc2626", "#16a34a", "#ea580c", "#7c3aed"];

  const renderAmplificationChart = () => (
    <div class="w-full">
      <h3 class="text-xl font-bold mb-4" style={{ color: theme.text }}>
        PCR Amplification Curves
      </h3>
      <div style={{ width: "100%", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pcrData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis
              dataKey="cycle"
              stroke={theme.textSecondary}
              label={{ value: 'Cycle Number', position: 'insideBottom', offset: -10, style: { fill: theme.textSecondary } }}
            />
            <YAxis
              stroke={theme.textSecondary}
              label={{ value: 'Fluorescence (RFU)', angle: -90, position: 'insideLeft', style: { fill: theme.textSecondary } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.cardBackground,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text
              }}
            />
            <Legend />
            {samples.map((sample, index) => (
              <Line
                key={sample}
                type="monotone"
                dataKey={sample}
                stroke={sampleColors[index]}
                strokeWidth={2}
                dot={false}
                name={sample}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderThresholdAnalysis = () => (
    <div class="w-full">
      <h3 class="text-xl font-bold mb-4" style={{ color: theme.text }}>
        Threshold Analysis (Ct Values)
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={thresholdData.filter(d => d.ct !== "N/A")}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis
                dataKey="sample"
                stroke={theme.textSecondary}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
              />
              <YAxis
                stroke={theme.textSecondary}
                label={{ value: 'Ct Value', angle: -90, position: 'insideLeft', style: { fill: theme.textSecondary } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.cardBackground,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.text
                }}
              />
              <Bar dataKey="ct" name="Cycle Threshold">
                {thresholdData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={sampleColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div class="space-y-4">
          <h4 class="text-lg font-semibold" style={{ color: theme.text }}>Sample Results</h4>
          {thresholdData.map((result, index) => (
            <div
              key={result.sample}
              class="p-4 rounded-lg border"
              style={{
                backgroundColor: theme.cardBackground,
                borderColor: theme.border
              }}
            >
              <div class="flex items-center mb-2">
                <div
                  class="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: sampleColors[index] }}
                />
                <span class="font-semibold" style={{ color: theme.text }}>
                  {result.sample}
                </span>
              </div>
              <div class="text-sm space-y-1" style={{ color: theme.textSecondary }}>
                <p>Ct Value: <span class="font-mono">{result.ct}</span></p>
                <p>Est. Concentration: <span class="font-mono">{result.concentration} copies/μL</span></p>
                <p>
                  Status:
                  <span class={`ml-1 font-semibold ${result.ct === "N/A" ? "text-red-600" : "text-green-600"}`}>
                    {result.ct === "N/A" ? "No amplification" : "Positive"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExperimentSummary = () => (
    <div class="w-full">
      <h3 class="text-xl font-bold mb-4" style={{ color: theme.text }}>
        Experiment Summary
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div
          class="p-6 rounded-lg border"
          style={{ backgroundColor: theme.cardBackground, borderColor: theme.border }}
        >
          <h4 class="text-lg font-semibold mb-2" style={{ color: theme.text }}>
            Protocol Details
          </h4>
          <div class="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
            <p>Total Stages: <span class="font-semibold">{config.stages.length}</span></p>
            <p>Total Time: <span class="font-semibold">{Math.floor(config.totalTime / 60)} minutes</span></p>
            <p>Cycles: <span class="font-semibold">{cycles}</span></p>
            <p>Date: <span class="font-semibold">{new Date().toLocaleDateString()}</span></p>
          </div>
        </div>

        <div
          class="p-6 rounded-lg border"
          style={{ backgroundColor: theme.cardBackground, borderColor: theme.border }}
        >
          <h4 class="text-lg font-semibold mb-2" style={{ color: theme.text }}>
            Detection Summary
          </h4>
          <div class="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
            <p>Total Samples: <span class="font-semibold">{samples.length}</span></p>
            <p>Positive: <span class="font-semibold text-green-600">{thresholdData.filter(d => d.ct !== "N/A").length}</span></p>
            <p>Negative: <span class="font-semibold text-red-600">{thresholdData.filter(d => d.ct === "N/A").length}</span></p>
            <p>Success Rate: <span class="font-semibold">75%</span></p>
          </div>
        </div>

        <div
          class="p-6 rounded-lg border"
          style={{ backgroundColor: theme.cardBackground, borderColor: theme.border }}
        >
          <h4 class="text-lg font-semibold mb-2" style={{ color: theme.text }}>
            Quality Metrics
          </h4>
          <div class="space-y-2 text-sm" style={{ color: theme.textSecondary }}>
            <p>R² Value: <span class="font-semibold">0.997</span></p>
            <p>Efficiency: <span class="font-semibold">98.2%</span></p>
            <p>Baseline: <span class="font-semibold">Passed</span></p>
            <p>Threshold: <span class="font-semibold">0.2 RFU</span></p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      class="w-full h-full overflow-auto p-6"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold" style={{ color: theme.text }}>
            PCR Results Analysis
          </h1>
          <button
            onClick={() => navigate && navigate("newExperiment")}
            class="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.border,
              color: theme.text
            }}
          >
            🔙 New Experiment
          </button>
        </div>

        {/* Tab Navigation */}
        <div class="flex gap-2 mb-6 border-b" style={{ borderColor: theme.border }}>
          {[
            { id: "amplification", label: "📈 Amplification" },
            { id: "analysis", label: "📊 Analysis" },
            { id: "summary", label: "📋 Summary" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              class={`px-4 py-2 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === tab.id ? "border-blue-500" : "border-transparent"
              }`}
              style={{
                color: activeTab === tab.id ? "#3b82f6" : theme.textSecondary
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div class="min-h-96">
          {activeTab === "amplification" && renderAmplificationChart()}
          {activeTab === "analysis" && renderThresholdAnalysis()}
          {activeTab === "summary" && renderExperimentSummary()}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
