import { deleteAlertRules } from "@/api/alert-rule"
import { swrFetcher } from "@/api/api"
import { ActionButtonGroup } from "@/components/action-button-group"
import { AlertRuleCard } from "@/components/alert-rule"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { NotificationTab } from "@/components/notification-tab"
import { createSelectionColumn } from "@/components/selection-column"
import { TablePageToolbar } from "@/components/table-page-header"
import { tableColumnWidths } from "@/lib/table-layout"
import { ModelAlertRule, triggerModes } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function AlertRulePage() {
    const { t } = useTranslation()

    const { data, mutate, error, isLoading } = useSWR<ModelAlertRule[]>(
        "/api/v1/alert-rule",
        swrFetcher,
    )

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", { error: error.message }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<ModelAlertRule>[] = [
        createSelectionColumn<ModelAlertRule>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.id,
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
            header: t("TableHeaders.NotifyGroup"),
            accessorKey: "ngroup",
            accessorFn: (row) => row.notification_group_id,
        },
        {
            header: t("TableHeaders.Mode"),
            accessorKey: "triggerMode",
            accessorFn: (row) => triggerModes[row.trigger_mode] || "",
        },
        {
            id: "rules",
            header: t("TableHeaders.Rules"),
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={JSON.stringify(s.rules)} />
            },
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
            header: t("TableHeaders.Enabled"),
            accessorKey: "enable",
            accessorFn: (row) => row.enable,
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
                            fn: deleteAlertRules,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <AlertRuleCard mutate={mutate} data={s} />
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
                leading={<NotificationTab />}
                deleteAction={{
                    fn: deleteAlertRules,
                    id: selectedRows.map((r) => r.original.id),
                    mutate: mutate,
                }}
            >
                <AlertRuleCard mutate={mutate} />
            </TablePageToolbar>

            <DataTable
                table={table}
                isLoading={isLoading}
                columnWidths={tableColumnWidths.alertRule}
            />
        </div>
    )
}
