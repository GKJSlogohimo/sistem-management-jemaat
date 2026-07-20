"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DataTableSearchProps = {
  value: string;
  onValueChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DataTableSearch({
  value,
  onValueChange,
  onReset,
  placeholder = "Cari data...",
  disabled = false,
}: DataTableSearchProps) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        type="search"
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-9 pl-9"
      />

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={() => {
            if (onReset) {
              onReset();
              return;
            }

            onValueChange("");
          }}
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
        >
          <X className="size-4" />
          <span className="sr-only">Hapus pencarian</span>
        </Button>
      ) : null}
    </div>
  );
}
