import InfoCircle from "../../components/InfoCircle/InfoCircle";
import HexagonButton from "../../components/HexagonButtons/HexagonButton";
import folder from "../../assets/icons/folder.svg";
import settings from "../../assets/icons/settings.svg";
import file from "../../assets/icons/file.svg";
import terminal from "../../assets/icons/terminal.svg";
import "./style.css";

interface MenuViewProps {
  navigate: (view: string) => void;
  isDarkMode: boolean;
  themeColors: any;
}

const MenuView = ({ navigate, isDarkMode, themeColors }: MenuViewProps) => {
  return (
    <div 
      class="w-full h-full flex flex-col justify-between overflow-hidden" 
      style={{ backgroundColor: themeColors.background }}
    >
      <section class="w-full flex h-full align-center p-4">
        <InfoCircle 
          label="Set Up" 
          action={() => console.log("this works")} 
          isDarkMode={isDarkMode}
          themeColors={themeColors}
        />
      </section>
      <section class="buttonsSection mb-20">
        <HexagonButton
          label="New Experiment"
          img={file}
          action={() => navigate("newExperiment")}
          isDarkMode={isDarkMode}
          themeColors={themeColors}
        />
        <HexagonButton
          label="Open Experiment"
          img={terminal}
          action={() => console.log("this works")}
          isDarkMode={isDarkMode}
          themeColors={themeColors}
        />
        <HexagonButton
          label="Recently Opened"
          img={folder}
          action={() => console.log("this works")}
          isDarkMode={isDarkMode}
          themeColors={themeColors}
        />
        <HexagonButton
          label="Settings"
          img={settings}
          action={() => console.log("this works")}
          isDarkMode={isDarkMode}
          themeColors={themeColors}
        />
      </section>
    </div>
  );
};

export default MenuView;
