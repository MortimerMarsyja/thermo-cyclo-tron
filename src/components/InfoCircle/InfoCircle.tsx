import "./InfoCircle.css";

interface InfoCircleProps {
  label: string;
  action: () => void;
  isDarkMode: boolean;
  themeColors: any;
}

export default function InfoCircle({ label, action, isDarkMode, themeColors }: InfoCircleProps) {
  return (
    <div 
      class="infoCircle" 
      onClick={action}
      style={{
        backgroundColor: themeColors.cardBackground,
        borderColor: themeColors.border,
      }}
    >
      <span 
        class="circleLabel"
        style={{ color: themeColors.text }}
      >
        {label}
      </span>
    </div>
  );
}
