import { swrFetcher } from "@/api/api"
import { deleteWAF } from "@/api/waf"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataPagination } from "@/components/data-pagination"
import { DataTable } from "@/components/data-table"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { createSelectionColumn } from "@/components/selection-column"
import { SettingsTab } from "@/components/settings-tab"
import { useAuth } from "@/hooks/useAuth"
import { tableColumnWidths } from "@/lib/table-layout"
import {
    GithubComNezhahqNezhaModelValueArrayModelWAFApiMock,
    ModelWAFApiMock,
    wafBlockIdentifiers,
    wafBlockReasons,
} from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import useSWR from "swr"

export default function WAFPage() {
    const { t } = useTranslation()
    const { profile } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get("page")) || 1
    const pageSize = Number(searchParams.get("pageSize")) || 10

    // 计算 offset
    const offset = (page - 1) * pageSize

    const { data, mutate, error, isLoading } =
        useSWR<GithubComNezhahqNezhaModelValueArrayModelWAFApiMock>(
            `/api/v1/waf?offset=${offset}&limit=${pageSize}`,
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

    let columns: ColumnDef<ModelWAFApiMock>[] = [
        createSelectionColumn<ModelWAFApiMock>(),
        {
            header: "IP",
            accessorKey: "ip",
            accessorFn: (row) => row.ip,
        },
        {
            header: t("TableHeaders.Count"),
            accessorKey: "count",
            accessorFn: (row) => row.count,
        },
        {
            header: t("TableHeaders.BlockReason"),
            accessorKey: "lastBlockReason",
            accessorFn: (row) => row.block_reason,
            cell: ({ row }) => <span>{wafBlockReasons[row.original.block_reason] || ""}</span>,
        },
        {
            header: t("TableHeaders.BlockId"),
            accessorKey: "blockIdentifier",
            accessorFn: (row) => {
                return wafBlockIdentifiers[row.block_identifier] || row.block_identifier
            },
        },
        {
            header: t("TableHeaders.BlockTime"),
            accessorKey: "lastBlockTime",
            accessorFn: (row) => row.block_timestamp,
            cell: ({ row }) => {
                const s = row.original
                const date = new Date((s.block_timestamp || 0) * 1000)
                return <span>{date.toISOString()}</span>
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
                            fn: deleteWAF,
                            id: s.ip || "",
                            mutate: mutate,
                        }}
                    >
                        <></>
                    </ActionButtonGroup>
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

    const table = useReactTable({
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
        <div data-admin-page className="px-3">
            <SettingsTab className="mt-6 w-full" />
            <div className="flex mt-4 mb-4">
                {isAdmin && (
                    <HeaderButtonGroup
                        className="flex-2 flex gap-2 ml-auto"
                        delete={{
                            fn: deleteWAF,
                            id: selectedRows.map((r) => r.original.ip || ""),
                            mutate: mutate,
                        }}
                    >
                        <></>
                    </HeaderButtonGroup>
                )}
            </div>
            <DataTable table={table} isLoading={isLoading} columnWidths={tableColumnWidths.waf} />
            {renderPagination()}
        </div>
    )
}
