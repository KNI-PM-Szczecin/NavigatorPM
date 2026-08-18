import { poiLabel } from "@/components/search-menu";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type InputProps = {
  placeholder: string;
  items?: Array<poiLabel> | null;
  onChanged?: (value: poiLabel | null) => void;
};

const SearchInput = ({ placeholder, items, onChanged }: InputProps) => {
  if (!items) return <br></br>;

  return (
    <Combobox
      onValueChange={onChanged}
      items={items}
      itemToStringValue={(item: poiLabel) => item.id}
      itemToStringLabel={(item: poiLabel) => item.name}
    >
      <ComboboxInput placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>Nie ma sali</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default SearchInput;
{
  /* <input
      type="text"
      placeholder={placeholder}
      className="h-12 w-full rounded-2xl bg-black/4 px-4 text-lg transition duration-100 ease-in-out outline-none placeholder:text-black/50 hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-500/30"
    /> */
}
