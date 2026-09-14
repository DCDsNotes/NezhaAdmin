import { swrFetcher } from "@/api/api"
import { deleteServerGroups } from "@/api/server-group"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { GroupTab } from "@/components/group-tab"
import { createSelectionColumn } from "@/components/selection-column"
import { ServerGroupCard } from "@/components/server-group"
import { TablePageToolbar } from "@/components/table-page-header"
import { tableColumnWidths } from "@/lib/table-layout"
import { ModelServerGroupResponseItem } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function ServerGroupPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelServerGroupResponseItem[]>(
        "/api/v1/server-group",
        swrFetcher,
    )

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<ModelServerGroupResponseItem>[] = [
        createSelectionColumn<ModelServerGroupResponseItem>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.group.id,
        },
        {
            header: t("TableHeaders.Name"),
            accessorKey: "name",
            accessorFn: (row) => row.group.name,
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-48 whitespace-normal break-words">{s.group.name}</div>
            },
        },
        {
            header: t("TableHeaders.Nodes"),
            accessorKey: "servers",
            accessorFn: (row) => row.servers,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 whitespace-normal break-words">
                        <span>{(s.servers || []).join(",")}</span>
                    </div>
                )
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
                        delete={{
                            fn: deleteServerGroups,
                            id: s.group.id,
                            mutate: mutate,
                        }}
                    >
                        <ServerGroupCard mutate={mutate} data={s} />
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
            <TablePageToolbar
                leading={<GroupTab />}
                deleteAction={{
                    fn: deleteServerGroups,
                    id: selectedRows.map((r) => r.original.group.id),
                    mutate: mutate,
                }}
            >
                <ServerGroupCard mutate={mutate} />
            </TablePageToolbar>
            <DataTable
                table={table}
                isLoading={isLoading}
                columnWidths={tableColumnWidths.serverGroup}
            />
        </div>
    )
}
