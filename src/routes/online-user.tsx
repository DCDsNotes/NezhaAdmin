import { swrFetcher } from "@/api/api"
import { blockUser } from "@/api/online-user"
import { BlockButtonGroup } from "@/components/action-button-group"
import { DataPagination } from "@/components/data-pagination"
import { DataTable } from "@/components/data-table"
import { createSelectionColumn } from "@/components/selection-column"
import { HeaderBlockButtonGroup } from "@/components/header-button-group"
import { SettingsTab } from "@/components/settings-tab"
import { useAuth } from "@/hooks/useAuth"
import { ModelOnlineUser, ModelOnlineUserApi } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import useSWR from "swr"

export default function OnlineUserPage() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get("page")) || 1
    const pageSize = Number(searchParams.get("pageSize")) || 10

    // 计算 offset
    const offset = (page - 1) * pageSize

    const { data, mutate, error, isLoading } = useSWR<ModelOnlineUserApi, Error>(
        `/api/v1/online-user?offset=${offset}&limit=${pageSize}`,
        swrFetcher,
    )

    const isAdmin = profile?.role === 0

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t(`Error fetching resource: ${error.message}.`),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    let columns: ColumnDef<ModelOnlineUser>[] = [
        createSelectionColumn<ModelOnlineUser>(),
        {
            header: "IP",
            accessorKey: "ip",
            accessorFn: (row) => row.ip ?? "",
        },
        {
            header: t("UserId"),
            accessorKey: "user_id",
            accessorFn: (row) => row.user_id || "",
        },
        {
            header: t("ConnectedAt"),
            accessorKey: "connected_at",
            accessorFn: (row) => row.connected_at,
            cell: ({ row }) => {
                const s = row.original
                const date = new Date(s.connected_at)
                return <span>{date.toISOString()}</span>
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const s = row.original
                return (
                    <BlockButtonGroup
                        className="flex gap-2"
                        block={{
                            fn: blockUser,
                            id: s.ip ?? "",
                            mutate: mutate,
                        }}
                    >
                        <></>
                    </BlockButtonGroup>
                )
            },
        },
    ]

    if (!isAdmin) {
        // 非管理员隐藏操作列
        columns = columns.filter((c) => c.id !== "actions")
    }

    const dataCache = useMemo(() => {
        return data?.value ?? []
    }, [data])

    const table = useReactTable<ModelOnlineUser>({
        data: dataCache,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const selectedRows = table.getSelectedRowModel().rows

    const renderPagination = () => {
        if (!data?.pagination) return null

        return (
            <DataPagination
                page={page}
                pageSize={pageSize}
                total={Number(data.pagination.total ?? dataCache.length)}
                onPageChange={(newPage) =>
                    setSearchParams({
                        page: newPage.toString(),
                        pageSize: pageSize.toString(),
                    })
                }
            />
        )
    }

    return (
        <div className="px-3">
            <SettingsTab className="mt-6 w-full" />
            <div className="flex mt-4 mb-4">
                {isAdmin && (
                    <HeaderBlockButtonGroup
                        className="flex-2 flex gap-2 ml-auto"
                        block={{
                            fn: blockUser,
                            id: selectedRows.map((r) => r.original.ip ?? ""),
                            mutate: mutate,
                        }}
                    >
                        <></>
                    </HeaderBlockButtonGroup>
                )}
            </div>
            <DataTable table={table} isLoading={isLoading} />
            {renderPagination()}
        </div>
    )
}
