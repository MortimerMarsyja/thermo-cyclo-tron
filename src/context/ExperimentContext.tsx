import { createContext } from "preact";
import { useContext, useState } from "preact/hooks";

export type StageData = {
  stage: string;
  temp: number;
  time: number;
};

export interface ExperimentConfig {
  stages: StageData[];
  totalTime: number;
  isConfigured: boolean;
}

interface ExperimentContextType {
  config: ExperimentConfig;
  updateConfig: (stages: StageData[]) => void;
  resetConfig: () => void;
}

const defaultConfig: ExperimentConfig = {
  stages: [
    { stage: "Stage 1", temp: 95, time: 120 },
    { stage: "Stage 2", temp: 94, time: 30 },
    { stage: "Stage 2", temp: 50.7, time: 30 },
    { stage: "Stage 2", temp: 72, time: 60 },
    { stage: "Stage 3", temp: 72, time: 600 },
    { stage: "Stage 3", temp: 15, time: 15 },
  ],
  totalTime: 855,
  isConfigured: true, // Start as configured so bars are clickable
};

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export const ExperimentProvider = ({ children }) => {
  const [config, setConfig] = useState<ExperimentConfig>(defaultConfig);

  const updateConfig = (stages: StageData[]) => {
    const totalTime = stages.reduce((sum, stage) => sum + stage.time, 0);
    setConfig({
      stages: [...stages],
      totalTime,
      isConfigured: true,
    });
  };

  const resetConfig = () => {
    setConfig({ ...defaultConfig, isConfigured: false });
  };

  return (
    <ExperimentContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ExperimentContext.Provider>
  );
};

export const useExperimentConfig = () => {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error("useExperimentConfig must be used within an ExperimentProvider");
  }
  return context;
};