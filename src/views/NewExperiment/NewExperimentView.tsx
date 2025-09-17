import TermoCicloTronConfig from "../../components/TermoCicloTronConfig/TermoCicloTronConfig";
import "./index.css";

interface NewExperimentViewProps {
  isDarkMode: boolean;
  themeColors: any;
  navigate: (view: string) => void;
}

const NewExperimentView = ({
  isDarkMode,
  themeColors,
  navigate,
}: NewExperimentViewProps) => {
  return (
    <TermoCicloTronConfig
      isDarkMode={isDarkMode}
      themeColors={themeColors}
      navigate={navigate}
    />
  );
};

export default NewExperimentView;
