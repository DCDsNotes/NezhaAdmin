import { swrFetcher } from "@/api/api"
import { deleteNotification } from "@/api/notification"
import { ActionButtonGroup } from "@/components/action-button-group"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { createSelectionColumn } from "@/components/selection-column"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { NotificationTab } from "@/components/notification-tab"
import { NotifierCard } from "@/components/notifier"
import { useNotification } from "@/hooks/useNotfication"
import { ModelNotification } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function NotificationPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelNotification[]>(
        "/api/v1/notification",
        swrFetcher,
    )
    const { notifierGroup } = useNotification()

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<ModelNotification>[] = [
        createSelectionColumn<ModelNotification>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => row.id,
        },
        {
            header: t("Name"),
            accessorKey: "name",
            accessorFn: (row) => row.name,
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-32 whitespace-normal break-words">{s.name}</div>
            },
        },
        {
            header: t("Group"),
            accessorKey: "groups",
            accessorFn: (row) => {
                return (
                    notifierGroup
                        ?.filter((ng) => ng.notifications?.includes(row.id))
                        .map((ng) => ng.group.id) || []
                )
            },
        },
        {
            header: "URL",
            accessorKey: "url",
            accessorFn: (row) => row.url,
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={s.url} />
            },
        },
        {
            header: t("VerifyTLS"),
            accessorKey: "verify_tls",
            accessorFn: (row) => row.verify_tls,
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{
                            fn: deleteNotification,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <NotifierCard mutate={mutate} data={s} />
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
        <div className="px-3">
            <div className="flex mt-6 mb-4">
                <NotificationTab className="flex-1 mr-4 sm:max-w-[40%]" />
                <HeaderButtonGroup
                    className="flex ml-auto self-end sm:self-auto gap-2 flex-wrap shrink-0"
                    delete={{
                        fn: deleteNotification,
                        id: selectedRows.map((r) => r.original.id),
                        mutate: mutate,
                    }}
                >
                    <NotifierCard mutate={mutate} />
                </HeaderButtonGroup>
            </div>

            <DataTable table={table} isLoading={isLoading} />
        </div>
    )
}
