import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function TaxPayerDropdown({
  items = [],
  onSelect,
  isOpen,
  onOpenChange,
  selectedItem = null,
}) {
  const [selected, setSelected] = useState(selectedItem);

  useEffect(() => {
    setSelected(selectedItem);
  }, [selectedItem]);

  const handleSelect = (item) => {
    setSelected(item);
    if (onSelect) onSelect(item);
    if (onOpenChange) onOpenChange(false); // Cerrar el dropdown después de seleccionar
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between mt-2">
          {selected
            ? `${selected.rncIdentification} - ${selected.name}`
            : "Selecciona un contribuyente"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[300px]">
        <DropdownMenuLabel>Contribuyentes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length > 0 ? (
          items.map((item) => (
            <DropdownMenuItem
              key={item.rncIdentification}
              onClick={() => handleSelect(item)}
              className="flex flex-col items-start"
            >
              <span className="font-medium text-sm text-gray-800">
                {item.rncIdentification}
              </span>
              <span className="text-xs text-gray-500">{item.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">
            No hay contribuyentes
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
