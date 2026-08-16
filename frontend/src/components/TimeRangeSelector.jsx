const DEFAULT_OPTIONS = [
  { label: "All time", value: "all" },
  { label: "Q3 2025", value: "q3-2025" },
  { label: "Q4 2025", value: "q4-2025" },
  { label: "Jun", value: "month-2025-06" },
  { label: "Jul", value: "month-2025-07" },
  { label: "Aug", value: "month-2025-08" },
  { label: "Sep", value: "month-2025-09" },
  { label: "Oct", value: "month-2025-10" },
  { label: "Nov", value: "month-2025-11" },
  { label: "Dec", value: "month-2025-12" },
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
              "btn btn-sm rounded-pill border",
              isSelected ? "btn-dark" : "btn-light text-dark",
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