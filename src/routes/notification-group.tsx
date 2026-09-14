import { swrFetcher } from "@/api/api"
import { deleteNotificationGroups } from "@/api/notification-group"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { GroupTab } from "@/components/group-tab"
import { NotificationGroupCard } from "@/components/notification-group"
import { createSelectionColumn } from "@/components/selection-column"
import { TablePageToolbar } from "@/components/table-page-header"
import { tableColumnWidths } from "@/lib/table-layout"
import { ModelNotificationGroupResponseItem } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function NotificationGroupPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelNotificationGroupResponseItem[]>(
        "/api/v1/notification-group",
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

    const columns: ColumnDef<ModelNotificationGroupResponseItem>[] = [
        createSelectionColumn<ModelNotificationGroupResponseItem>(),
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
            header: t("TableHeaders.Notifiers"),
            accessorKey: "notifications",
            accessorFn: (row) => row.notifications,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 whitespace-normal break-words">
                        <span>{(s.notifications || []).join(",")}</span>
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
                            fn: deleteNotificationGroups,
                            id: s.group.id,
                            mutate: mutate,
                        }}
                    >
                        <NotificationGroupCard mutate={mutate} data={s} />
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
                    fn: deleteNotificationGroups,
                    id: selectedRows.map((r) => r.original.group.id),
                    mutate: mutate,
                }}
            >
                <NotificationGroupCard mutate={mutate} />
            </TablePageToolbar>

            <DataTable
                table={table}
                isLoading={isLoading}
                columnWidths={tableColumnWidths.notificationGroup}
            />
        </div>
    )
}
