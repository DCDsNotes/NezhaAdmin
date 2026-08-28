import { swrFetcher } from "@/api/api"
import { deleteCron, runCron } from "@/api/cron"
import { ActionButtonGroup } from "@/components/action-button-group"
import { CopyButton } from "@/components/copy-button"
import { CronCard } from "@/components/cron"
import { DataTable } from "@/components/data-table"
import { createSelectionColumn } from "@/components/selection-column"
import { TablePageHeader } from "@/components/table-page-header"
import { IconButton } from "@/components/xui/icon-button"
import { ModelCron } from "@/types"
import { cronTypes } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function CronPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelCron[]>("/api/v1/cron", swrFetcher)

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<ModelCron>[] = [
        createSelectionColumn<ModelCron>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.id,
        },
        {
            header: t("Name"),
            accessorKey: "name",
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-32 whitespace-normal break-words">{s.name}</div>
            },
        },
        {
            header: t("Type"),
            accessorKey: "taskType",
            accessorFn: (row) => cronTypes[row.task_type] || "",
        },
        {
            header: t("CronExpression"),
            accessorKey: "scheduler",
            accessorFn: (row) => row.scheduler,
        },
        {
            header: t("Command"),
            accessorKey: "command",
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={s.command} />
            },
        },
        {
            header: t("NotifierGroup"),
            accessorKey: "ngroup",
            accessorFn: (row) => row.notification_group_id,
        },
        {
            header: t("SendSuccessNotification"),
            accessorKey: "pushSuccessful",
            accessorFn: (row) => row.push_successful ?? false,
        },
        {
            header: t("Coverage"),
            accessorKey: "cover",
            accessorFn: (row) => row.cover,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-48 whitespace-normal break-words">
                        {(() => {
                            switch (s.cover) {
                                case 0: {
                                    return <span>{t("IgnoreAll")}</span>
                                }
                                case 1: {
                                    return <span>{t("CoverAll")}</span>
                                }
                                case 2: {
                                    return <span>{t("OnAlert")}</span>
                                }
                            }
                        })()}
                    </div>
                )
            },
        },
        {
            header: t("SpecificServers"),
            accessorKey: "servers",
            accessorFn: (row) => row.servers,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-16 whitespace-normal break-words">
                        <span>{(s.servers || []).join(",")}</span>
                    </div>
                )
            },
        },
        {
            header: t("LastExecution"),
            accessorKey: "lastExecution",
            accessorFn: (row) => row.last_executed_at,
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-24 whitespace-normal break-words">
                        {s.last_executed_at}
                    </div>
                )
            },
        },
        {
            header: t("Result"),
            accessorKey: "lastResult",
            accessorFn: (row) => row.last_result ?? false,
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{ fn: deleteCron, id: s.id, mutate: mutate }}
                    >
                        <>
                            <IconButton
                                variant="outline"
                                icon="play"
                                onClick={async () => {
                                    try {
                                        await runCron(s.id)
                                    } catch (e) {
                                        console.error(e)
                                        toast(t("Error"), {
                                            description: t("Results.UnExpectedError"),
                                        })
                                        await mutate()
                                        return
                                    }
                                    toast(t("Success"), {
                                        description: t("Results.TaskTriggeredSuccessfully"),
                                    })
                                    await mutate()
                                }}
                            />
                            <CronCard mutate={mutate} data={s} />
                        </>
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
        <div className="px-3 max-w-7xl mx-auto">
            <TablePageHeader
                title={t("Task")}
                deleteAction={{
                    fn: deleteCron,
                    id: selectedRows.map((r) => r.original.id),
                    mutate: mutate,
                }}
            >
                <CronCard mutate={mutate} />
            </TablePageHeader>

            <DataTable table={table} isLoading={isLoading} />
        </div>
    )
}
