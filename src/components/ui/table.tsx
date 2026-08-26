import { cn } from "@/lib/utils"
import {
    ForwardedRef,
    HTMLAttributes,
    TdHTMLAttributes,
    ThHTMLAttributes,
    forwardRef,
    useCallback,
    useLayoutEffect,
    useRef,
} from "react"

function updateForwardedRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") {
        ref(value)
    } else if (ref) {
        ref.current = value
    }
}

function annotateResponsiveCells(table: HTMLTableElement) {
    const labels = Array.from(table.querySelectorAll("thead th"), (header) =>
        (header.textContent ?? "").replace(/\s+/g, " ").trim(),
    )

    table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
        Array.from(row.cells).forEach((cell, index) => {
            const label = labels[index] ?? ""
            const normalizedLabel = label.toLocaleLowerCase()

            cell.dataset.label = label
            cell.toggleAttribute("data-table-message", cell.colSpan > 1)
            cell.toggleAttribute(
                "data-table-select",
                !label && cell.querySelector('[role="checkbox"]') !== null,
            )
            cell.toggleAttribute(
                "data-table-actions",
                normalizedLabel === "action" ||
                    normalizedLabel === "actions" ||
                    normalizedLabel === "操作",
            )
            cell.toggleAttribute(
                "data-table-primary",
                normalizedLabel === "name" || label.endsWith("名称"),
            )
        })
    })
}

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, forwardedRef) => {
        const tableRef = useRef<HTMLTableElement | null>(null)
        const setTableRef = useCallback(
            (node: HTMLTableElement | null) => {
                tableRef.current = node
                updateForwardedRef(forwardedRef, node)
            },
            [forwardedRef],
        )

        useLayoutEffect(() => {
            if (tableRef.current) annotateResponsiveCells(tableRef.current)
        })

        return (
            <div
                data-slot="table-frame"
                className="relative w-full overflow-hidden rounded-[18px] border bg-card"
            >
                <div data-slot="table-scroll" className="w-full overflow-auto">
                    <table
                        ref={setTableRef}
                        data-slot="table"
                        className={cn("w-full caption-bottom text-sm", className)}
                        {...props}
                    />
                </div>
            </div>
        )
    },
)
Table.displayName = "Table"

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
    ),
)
TableHeader.displayName = "TableHeader"

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
    ),
)
TableBody.displayName = "TableBody"

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tfoot
            ref={ref}
            className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
            {...props}
        />
    ),
)
TableFooter.displayName = "TableFooter"

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr
            ref={ref}
            className={cn(
                "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                className,
            )}
            {...props}
        />
    ),
)
TableRow.displayName = "TableRow"

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <th
            ref={ref}
            className={cn(
                "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                className,
            )}
            {...props}
        />
    ),
)
TableHead.displayName = "TableHead"

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <td
            ref={ref}
            className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
            {...props}
        />
    ),
)
TableCell.displayName = "TableCell"

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, ...props }, ref) => (
        <caption
            ref={ref}
            className={cn("mt-4 text-sm text-muted-foreground", className)}
            {...props}
        />
    ),
)
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
