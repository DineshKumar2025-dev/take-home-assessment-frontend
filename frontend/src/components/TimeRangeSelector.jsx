const DEFAULT_OPTIONS = [
  { label: "All time", value: "all" },
  { label: "Q4 2025", value: "q4-2025" },
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
