"use client";

import { useState, useMemo } from "react";
import { Asset } from "@/types/market";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowDownIcon, ArrowUpIcon, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AssetsTableProps {
  initialData: Asset[];
}

type SortField = "symbol" | "price" | "variation" | "volume";
type SortOrder = "asc" | "desc";

export function AssetsTable({ initialData }: AssetsTableProps) {
  const [data] = useState<Asset[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter by type
    if (filterType !== "ALL") {
      result = result.filter((asset) => asset.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(lowerSearch) ||
          asset.name.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "symbol") {
        comparison = a.symbol.localeCompare(b.symbol);
      } else {
        comparison = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [data, searchTerm, filterType, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ticker o nombre..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filterType}
            onValueChange={(value) => {
              setFilterType(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de activo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los activos</SelectItem>
              <SelectItem value="STOCK">Acciones</SelectItem>
              <SelectItem value="CEDEAR">CEDEARs</SelectItem>
              <SelectItem value="BOND">Bonos</SelectItem>
              <SelectItem value="FCI">FCI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("symbol")}
                  className="hover:bg-transparent px-0 font-semibold"
                >
                  Activo
                  {sortField === "symbol" && (
                    <span className="ml-1 text-muted-foreground">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("price")}
                  className="hover:bg-transparent px-0 font-semibold"
                >
                  Precio
                  {sortField === "price" && (
                    <span className="ml-1 text-muted-foreground">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("variation")}
                  className="hover:bg-transparent px-0 font-semibold"
                >
                  Variación
                  {sortField === "variation" && (
                    <span className="ml-1 text-muted-foreground">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right hidden md:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("volume")}
                  className="hover:bg-transparent px-0 font-semibold"
                >
                  Volumen
                  {sortField === "volume" && (
                    <span className="ml-1 text-muted-foreground">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No se encontraron activos.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((asset) => {
                const isPositive = asset.variation > 0;
                const isNegative = asset.variation < 0;

                return (
                  <TableRow key={asset.id} className="group">
                    <TableCell>
                      <Link href={`/assets/${asset.symbol}`} className="flex flex-col">
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {asset.symbol}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {asset.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(asset.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          "inline-flex items-center justify-end font-medium",
                          isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"
                        )}
                      >
                        {isPositive ? (
                          <ArrowUpIcon className="mr-1 h-3 w-3" />
                        ) : isNegative ? (
                          <ArrowDownIcon className="mr-1 h-3 w-3" />
                        ) : null}
                        {formatPercent(asset.variation)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                      {asset.volume ? formatNumber(asset.volume) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
