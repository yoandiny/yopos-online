import { useState } from 'react';
import { Combobox as HeadlessCombobox } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';

interface ComboboxItem {
  id: string | number;
  name: string;
}

interface ComboboxProps<T extends ComboboxItem> {
  items: T[];
  selected: T | null;
  onChange: (selected: T | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

function Combobox<T extends ComboboxItem>({ items, selected, onChange, placeholder, disabled = false }: ComboboxProps<T>) {
  const [query, setQuery] = useState('');

  const filteredItems =
    query === ''
      ? items
      : items.filter((item) =>
          item.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <HeadlessCombobox value={selected} onChange={onChange} disabled={disabled}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed">
          <HeadlessCombobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 disabled:bg-gray-100"
            displayValue={(item: T) => item?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </HeadlessCombobox.Button>
        </div>
        <HeadlessCombobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
          {filteredItems.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
              Aucun produit trouvé.
            </div>
          ) : (
            filteredItems.map((item) => (
              <HeadlessCombobox.Option
                key={item.id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-primary-600 text-white' : 'text-gray-900'
                  }`
                }
                value={item}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {item.name}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-white' : 'text-primary-600'
                        }`}
                      >
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </HeadlessCombobox.Option>
            ))
          )}
        </HeadlessCombobox.Options>
      </div>
    </HeadlessCombobox>
  );
}

export default Combobox;
