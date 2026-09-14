import { swrFetcher } from "@/api/api"
import { deleteService } from "@/api/service"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { createSelectionColumn } from "@/components/selection-column"
import { ServiceCard } from "@/components/service"
import { TablePageHeader } from "@/components/table-page-header"
import { tableColumnWidths } from "@/lib/table-layout"
import { ModelService as Service } from "@/types"
import { serviceTypes } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function ServicePage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<Service[]>("/api/v1/service/list", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<Service>[] = [
        createSelectionColumn<Service>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.id,
        },
        {
            header: t("TableHeaders.Name"),
            accessorFn: (row) => row.name,
            accessorKey: "name",
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-24 whitespace-normal break-words">{s.name}</div>
            },
        },
        {
            header: t("TableHeaders.Target"),
            accessorFn: (row) => row.target,
            accessorKey: "target",
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-24 whitespace-normal break-words">{s.target}</div>
            },
        },
        {
            header: t("TableHeaders.Scope"),
            accessorKey: "cover",
            accessorFn: (row) => row.cover,
            cell: ({ row }) => {
                const s = row.original
                const coverageLabel = [t("CoverAll"), t("IgnoreAll")][s.cover]
                return (
                    <div className="max-w-48 whitespace-normal break-words">
                        <span>{coverageLabel}</span>
                    </div>
                )
            },
        },
        {
            id: "servers",
            header: t("TableHeaders.Nodes"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-32 whitespace-normal break-words">
                        {Object.keys(s.skip_servers ?? {}).join(",")}
                    </div>
                )
            },
        },
        {
            header: t("TableHeaders.Type"),
            accessorKey: "type",
            accessorFn: (row) => row.type,
            cell: ({ row }) => serviceTypes[row.original.type] || "",
        },
        {
            header: t("TableHeaders.Interval"),
            accessorKey: "duration",
            accessorFn: (row) => row.duration,
        },
        {
            header: t("TableHeaders.NotifyGroup"),
            accessorKey: "ngroup",
            accessorFn: (row) => row.notification_group_id,
        },
        {
            header: t("TableHeaders.Trigger"),
            accessorKey: "triggerTask",
            accessorFn: (row) => row.enable_trigger_task ?? false,
        },
        {
            header: t("TableHeaders.AlertTasks"),
            accessorKey: "failTriggerTasks",
            accessorFn: (row) => row.fail_trigger_tasks,
        },
        {
            header: t("TableHeaders.RecoveryTasks"),
            accessorKey: "recoverTriggerTasks",
            accessorFn: (row) => row.recover_trigger_tasks,
        },
        {
            id: "actions",
            header: t("TableHeaders.Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{ fn: deleteService, id: s.id, mutate: mutate }}
                    >
                        <ServiceCard mutate={mutate} data={s} />
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
        <div data-admin-page className="px-3 max-w-7xl mx-auto">
            <TablePageHeader
                title={t("Service")}
                deleteAction={{
                    fn: deleteService,
                    id: selectedRows.map((r) => r.original.id),
                    mutate: mutate,
                }}
            >
                <ServiceCard mutate={mutate} />
            </TablePageHeader>

            <DataTable
                table={table}
                isLoading={isLoading}
                columnWidths={tableColumnWidths.service}
            />
        </div>
    )
}
