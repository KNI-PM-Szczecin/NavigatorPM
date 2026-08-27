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
      <ComboboxInput
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border-0 bg-white text-black shadow-lg ring-1 ring-black/10 transition duration-100 ease-in-out hover:ring-2 hover:ring-blue-500/30 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-blue-500/30 [&_input]:px-4 [&_input]:text-lg [&_input]:placeholder:text-black/50"
      />
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
