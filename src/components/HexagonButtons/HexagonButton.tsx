import "./HexagonButton.css";
import Hexagon from "../../assets/icons/hexagon.svg?react";
interface HexagonButtonProps {
  label: string;
  img: string;
  action: () => void;
  isDarkMode: boolean;
  themeColors: any;
}

export default function HexagonButton({
  label,
  img,
  action,
  isDarkMode,
  themeColors,
}: HexagonButtonProps) {
  return (
    <button class="hexagon" onClick={action}>
      <div class="hexagonOverlay relative">
        <Hexagon
          class="hexagon"
          style={{
            fill: isDarkMode ? themeColors.cardBackground : "#f0f9ff",
            stroke: themeColors.border,
            strokeWidth: "4px",
            borderRadius: "12px",
          }}
        />
        <div class="cartouche absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center">
          <img
            class="hexagonImg"
            src={img}
            alt={label}
            style={{
              filter: isDarkMode
                ? "invert(1) brightness(1.2)"
                : "contrast(1.5) brightness(0.8)",
            }}
          />
          <span class="hexagonLabel" style={{ color: themeColors.text }}>
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}
