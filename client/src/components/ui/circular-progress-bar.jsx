// interface CircularProgressBarProps {
//   value: number
//   max?: number
//   size?: "sm" | "md" | "lg" | "xl"
//   strokeWidth?: number
//   color?: "blue" | "green" | "purple" | "orange" | "red" | "gradient"
//   showLabel?: boolean
//   showPercentage?: boolean
//   label?: string
//   className?: string
// }

export default function CircularProgressBar({
  value,
  max = 100,
  size = "md",
  strokeWidth,
  color = "blue",
  showLabel = false,
  showPercentage = true,
  label,
  className = "",
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeConfig = {
    sm: { diameter: 40, defaultStroke: 4, fontSize: "text-xs" },
    md: { diameter: 80, defaultStroke: 6, fontSize: "text-sm" },
    lg: { diameter: 120, defaultStroke: 8, fontSize: "text-base" },
    xl: { diameter: 160, defaultStroke: 10, fontSize: "text-lg" },
  }

  const config = sizeConfig[size]
  const radius = (config.diameter - (strokeWidth || config.defaultStroke)) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    blue: "stroke-blue-500",
    green: "stroke-green-500",
    purple: "stroke-purple-500",
    orange: "stroke-orange-500",
    red: "stroke-red-500",
    gradient: "stroke-url(#gradient)",
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={config.diameter}
        height={config.diameter}
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progress: ${Math.round(percentage)}%`}
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth || config.defaultStroke}
          fill="none"
          className="text-gray-200"
        />

        {/* Progress circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          strokeWidth={strokeWidth || config.defaultStroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClasses[color]} transition-all duration-500 ease-in-out`}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className={`font-bold text-white ${config.fontSize}`}>{Math.round(percentage)}%</span>
        )}
        {showLabel && label && (
          <span className={`text-gray-500 ${size === "sm" ? "text-xs" : "text-xs"} mt-1`}>{label}</span>
        )}
      </div>
    </div>
  )
}
