interface Props {
  action: () => void;
  label: string;
  className?: string;
}

const CircleButton = ({ action, label, className = "" }: Props) => {
  return (
    <button
      class={`rounded-full w-16 h-16 p-14 font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center text-sm ${className}`}
      onClick={action}
    >
      {label}
    </button>
  );
};

export default CircleButton;
