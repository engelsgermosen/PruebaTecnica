import { useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Combobox controlado desde el padre:
 * - value: string del input
 * - onChange: (nuevoValor) => void
 * - isOpen / onOpenChange: controlar apertura/cierre
 * - items: [{ rncIdentification, name }]
 * - loading: boolean
 * - onSelect: (item) => void
 */
export default function TaxPayerCombobox({
  value,
  onChange,
  isOpen,
  onOpenChange,
  items = [],
  loading = false,
  onSelect,
  inputId = "RncIdentification",
  placeholder = "Ingrese la cédula o RNC",
  onInputFocus,
  max=11
}) {
  const inputRef = useRef(null);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      {/* El input actúa como disparador del Popover */}
      <PopoverTrigger asChild>
        <input
          ref={inputRef}
          id={inputId}
          type="text" /* usa text para no perder ceros a la izquierda */
          inputMode="numeric" /* muestra teclado numérico en móviles */
          value={value}
          maxLength={max}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => {
            onOpenChange?.(true);
            onInputFocus?.();
          }}
          className="block w-full text-slate-700 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          autoComplete="off"
        />
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width] min-w-[320px]"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false /* filtramos en el servidor */}>
          <CommandGroup heading="Contribuyentes">
            {loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
            )}

            {!loading && items.length === 0 && (
              <CommandEmpty>No se encontraron contribuyentes</CommandEmpty>
            )}

            {!loading && items.length > 0 && (
              <ScrollArea className="max-h-64">
                <CommandList>
                  {items.map((item) => (
                    <CommandItem
                      key={item.rncIdentification}
                      value={item.rncIdentification}
                      onSelect={() => {
                        onSelect?.(item);
                        onOpenChange?.(false);
                        // opcional: devolver el foco al input
                        inputRef.current?.focus();
                      }}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {item.rncIdentification}
                      </span>
                      <span className="text-xs text-gray-500">{item.name}</span>
                    </CommandItem>
                  ))}
                </CommandList>
              </ScrollArea>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
