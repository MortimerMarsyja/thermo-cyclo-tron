import { useState, useEffect } from "preact/hooks";
import BioLogo from "../../assets/logos/biologo.svg";

interface WelcomeViewProps {
  navigate: (view: string) => void;
  isDarkMode: boolean;
  themeColors: any;
}

const handleWaitFiveSecondsThenShowMenuWindow = (viewChanger) => {
  setTimeout(() => {
    viewChanger("menu");
  }, 2000);
};

const WelcomeView = ({
  navigate,
  isDarkMode,
  themeColors,
}: WelcomeViewProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  handleWaitFiveSecondsThenShowMenuWindow(navigate);
  return (
    <div
      class="w-full h-full flex flex-col justify-center items-center overflow-hidden"
      style={{ backgroundColor: themeColors.background }}
    >
      <img
        class={`transition-opacity ease-in duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } hover:opacity-75`}
        src={BioLogo}
        alt="BioLogo"
        style={{ width: "200px", height: "200px" }}
      />
    </div>
  );
};

export default WelcomeView;
