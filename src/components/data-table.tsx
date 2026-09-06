import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Table as TanStackTable, flexRender } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"

interface DataTableProps<TData> {
    table: TanStackTable<TData>
    isLoading?: boolean
    className?: string
    headerClassName?: string
    columnWidths?: Readonly<Record<string, string>>
}

export function DataTable<TData>({
    table,
    isLoading = false,
    className,
    headerClassName,
    columnWidths,
}: DataTableProps<TData>) {
    const { t } = useTranslation()
    const rows = table.getRowModel().rows
    const columnCount = table.getAllLeafColumns().length

    return (
        <Table className={cn(className, columnWidths && "table-fixed")}>
            {columnWidths && (
                <colgroup>
                    {table.getAllLeafColumns().map((column) => (
                        <col key={column.id} style={{ width: columnWidths[column.id] }} />
                    ))}
                </colgroup>
            )}
            <TableHeader className={headerClassName}>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead
                                key={header.id}
                                data-column-id={header.column.id}
                                className="text-sm"
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={columnCount} className="h-24 text-center">
                            {t("Loading")}...
                        </TableCell>
                    </TableRow>
                ) : rows.length ? (
                    rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    data-column-id={cell.column.id}
                                    className="text-xsm"
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columnCount} className="h-24 text-center">
                            {t("NoResults")}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
