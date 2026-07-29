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
import { formatDOP } from "../utils/currency";

/**
 * Combobox de productos (solo activos), controlado desde el padre.
 * - value: texto del input
 * - onChange: (nuevoTexto) => void
 * - items: [{ id, name, unitPrice, ... }] ya filtrados
 * - onSelect: (producto) => void
 */
export default function ProductCombobox({
  value,
  onChange,
  isOpen,
  onOpenChange,
  items = [],
  loading = false,
  onSelect,
  inputId = "productSearch",
  placeholder = "Buscar producto...",
  onInputFocus,
}) {
  const inputRef = useRef(null);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => {
            onOpenChange?.(true);
            onInputFocus?.();
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
        <Command shouldFilter={false}>
          <CommandGroup heading="Productos activos">
            {loading && (
              <div className="px-3 py-2 text-sm text-slate-500">Cargando…</div>
            )}

            {!loading && items.length === 0 && (
              <CommandEmpty>No se encontraron productos</CommandEmpty>
            )}

            {!loading && items.length > 0 && (
              <ScrollArea className="max-h-64">
                <CommandList>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={String(item.id)}
                      onSelect={() => {
                        onSelect?.(item);
                        onOpenChange?.(false);
                        inputRef.current?.focus();
                      }}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-slate-500">
                        {formatDOP(item.unitPrice)}
                      </span>
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
