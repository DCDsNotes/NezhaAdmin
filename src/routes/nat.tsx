import { swrFetcher } from "@/api/api"
import { deleteNAT } from "@/api/nat"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { NATCard } from "@/components/nat"
import { createSelectionColumn } from "@/components/selection-column"
import { TablePageHeader } from "@/components/table-page-header"
import { tableColumnWidths } from "@/lib/table-layout"
import { ModelNAT } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function NATPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelNAT[]>("/api/v1/nat", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<ModelNAT>[] = [
        createSelectionColumn<ModelNAT>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.id,
        },
        {
            header: t("TableHeaders.Enabled"),
            accessorKey: "enabled",
            accessorFn: (row) => row.enabled,
        },
        {
            header: t("TableHeaders.Name"),
            accessorKey: "name",
            accessorFn: (row) => row.name,
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-32 whitespace-normal break-words">{s.name}</div>
            },
        },
        {
            header: t("TableHeaders.ServerId"),
            accessorKey: "serverID",
            accessorFn: (row) => row.server_id,
        },
        {
            header: t("TableHeaders.LocalService"),
            accessorKey: "host",
            accessorFn: (row) => row.host,
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-32 whitespace-normal break-words">{s.host}</div>
            },
        },
        {
            header: t("TableHeaders.BindDomain"),
            accessorKey: "domain",
            accessorFn: (row) => row.domain,
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-32 whitespace-normal break-words">{s.domain}</div>
            },
        },
        {
            id: "actions",
            header: t("TableHeaders.Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{ fn: deleteNAT, id: s.id, mutate: mutate }}
                    >
                        <NATCard mutate={mutate} data={s} />
                    </ActionButtonGroup>
                )
            },
        },
    ]

    const dataCache = useMemo(() => {
        return data ?? []
    }, [data])

    const table = useReactTable({
        data: dataCache,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const selectedRows = table.getSelectedRowModel().rows

    return (
        <div data-admin-page className="px-3">
            <TablePageHeader
                title={t("NATT")}
                deleteAction={{
                    fn: deleteNAT,
                    id: selectedRows.map((r) => r.original.id),
                    mutate: mutate,
                }}
            >
                <NATCard mutate={mutate} />
            </TablePageHeader>

            <DataTable table={table} isLoading={isLoading} columnWidths={tableColumnWidths.nat} />
        </div>
    )
}
