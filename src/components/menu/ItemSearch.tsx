import { type Dispatch, type SetStateAction } from "react";

type Props = {
  search: string;
  placeholder: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setSearching: Dispatch<SetStateAction<boolean>>;
};

export const ItemSearch = ({
  search,
  placeholder,
  setSearch,
  setSearching,
}: Props) => {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 mb-8 rounded-xl border shadow-sm focus:outline-none focus:ring"
        onFocus={() => setSearching(true)}
        onBlur={() => setSearching(false)}
      />
    </div>
  );
};
