const DEFAULT_OPTIONS = [
  { label: "All time", value: "all" },
  { label: "Q3 2025", value: "q3-2025" },
  { label: "Q4 2025", value: "q4-2025" },
  { label: "Jun-2025", value: "month-2025-06" },
  { label: "Jul-2025", value: "month-2025-07" },
  { label: "Aug-2025", value: "month-2025-08" },
  { label: "Sep-2025", value: "month-2025-09" },
  { label: "Oct-2025", value: "month-2025-10" },
  { label: "Nov-2025", value: "month-2025-11" },
  { label: "Dec-2025", value: "month-2025-12" },
];

function TimeRangeSelector({ value = "all", onChange, options = DEFAULT_OPTIONS }) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              
              isSelected ? "btn-tab active" : "btn-tab",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default TimeRangeSelector;