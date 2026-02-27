"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Globe, Landmark } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

// Mock data for now, will be replaced with API call
const mockResults = [
  { id: "1", type: "accion", symbol: "GGAL", name: "Grupo Financiero Galicia", icon: TrendingUp },
  { id: "2", type: "accion", symbol: "YPFD", name: "YPF S.A.", icon: TrendingUp },
  { id: "3", type: "cedear", symbol: "AAPL", name: "Apple Inc.", icon: Globe },
  { id: "4", type: "cedear", symbol: "MSFT", name: "Microsoft Corp.", icon: Globe },
  { id: "5", type: "bono", symbol: "AL30", name: "Bono Rep. Argentina USD 2030", icon: Landmark },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // In a real app, we would fetch data here based on debouncedQuery
  // const { data, isLoading } = useQuery({
  //   queryKey: ['search', debouncedQuery],
  //   queryFn: () => fetch(`/api/v1/search?q=${debouncedQuery}`).then(res => res.json()),
  //   enabled: debouncedQuery.length > 0,
  // });

  const filteredResults = React.useMemo(() => {
    if (!debouncedQuery) return [];
    return mockResults.filter(
      (item) =>
        item.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const groupedResults = React.useMemo(() => {
    const groups: Record<string, typeof mockResults> = {
      Acciones: [],
      CEDEARs: [],
      Bonos: [],
    };

    filteredResults.forEach((item) => {
      if (item.type === "accion") groups.Acciones.push(item);
      if (item.type === "cedear") groups.CEDEARs.push(item);
      if (item.type === "bono") groups.Bonos.push(item);
    });

    return groups;
  }, [filteredResults]);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Buscar activos...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Buscar por ticker o nombre..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          
          {Object.entries(groupedResults).map(([groupName, items]) => {
            if (items.length === 0) return null;
            
            return (
              <CommandGroup key={groupName} heading={groupName}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.symbol} ${item.name}`}
                    onSelect={() => {
                      runCommand(() => router.push(`/assets/${item.type}s/${item.symbol}`));
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.symbol}</span>
                    <span className="ml-2 text-muted-foreground text-xs">{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
