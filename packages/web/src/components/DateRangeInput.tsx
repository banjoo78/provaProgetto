interface DateRangeInputProps {
  startValue: string; // yyyy-MM-dd
  endValue: string; // yyyy-MM-dd
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  startError?: string;
  endError?: string;
  required?: boolean;
}

export function DateRangeInput({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startError,
  endError,
  required,
}: DateRangeInputProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="trip-start-date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data inizio {required && <span className="text-red-600">*</span>}
        </label>
        <input
          id="trip-start-date"
          type="date"
          value={startValue}
          onChange={(e) => onStartChange(e.target.value)}
          required={required}
          aria-invalid={startError ? 'true' : undefined}
          aria-describedby={startError ? 'trip-start-date-error' : undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {startError && (
          <p id="trip-start-date-error" className="mt-1 text-sm text-red-600">
            {startError}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="trip-end-date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data fine {required && <span className="text-red-600">*</span>}
        </label>
        <input
          id="trip-end-date"
          type="date"
          value={endValue}
          onChange={(e) => onEndChange(e.target.value)}
          required={required}
          aria-invalid={endError ? 'true' : undefined}
          aria-describedby={endError ? 'trip-end-date-error' : undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {endError && (
          <p id="trip-end-date-error" className="mt-1 text-sm text-red-600">
            {endError}
          </p>
        )}
      </div>
    </div>
  );
}
