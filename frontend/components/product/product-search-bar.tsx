interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export function ProductSearchBar({ value, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-6 py-4 rounded-lg focus:ring-4"
        />
        <button className="bg-white px-8 py-4 rounded-lg font-semibold text-blue-500 ring-0 focus:ring-0">
          Search
        </button>
      </div>
    </form>
  );
}
