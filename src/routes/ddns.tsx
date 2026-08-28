import { swrFetcher } from "@/api/api"
import { deleteDDNSProfiles, getDDNSProviders } from "@/api/ddns"
import { ActionButtonGroup } from "@/components/action-button-group"
import { DataTable } from "@/components/data-table"
import { createSelectionColumn } from "@/components/selection-column"
import { DDNSCard } from "@/components/ddns"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { ModelDDNSProfile } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function DDNSPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<ModelDDNSProfile[]>(
        "/api/v1/ddns",
        swrFetcher,
    )
    const [providers, setProviders] = useState<string[]>([])

    useEffect(() => {
        const fetchProviders = async () => {
            const fetchedProviders = await getDDNSProviders()
            setProviders(fetchedProviders)
        }
        fetchProviders()
    }, [])

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", {
                    error: error.message,
                }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<ModelDDNSProfile>[] = [
        createSelectionColumn<ModelDDNSProfile>(),
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
                return <div className="max-w-24 whitespace-normal break-words">{s.name}</div>
            },
        },
        {
            header: "IPv4",
            accessorKey: "enableIPv4",
            accessorFn: (row) => row.enable_ipv4 ?? false,
        },
        {
            header: "IPv6",
            accessorKey: "enableIPv6",
            accessorFn: (row) => row.enable_ipv6 ?? false,
        },
        {
            header: t("Provider"),
            accessorKey: "provider",
            accessorFn: (row) => row.provider,
        },
        {
            header: t("Domains"),
            accessorKey: "domains",
            accessorFn: (row) => row.domains,
            cell: ({ row }) => {
                const s = row.original
                return <div className="max-w-24 whitespace-normal break-words">{s.domains}</div>
            },
        },
        {
            header: t("MaximumRetryAttempts"),
            accessorKey: "maxRetries",
            accessorFn: (row) => row.max_retries,
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
                            fn: deleteDDNSProfiles,
                            id: s.id,
                            mutate: mutate,
                        }}
                    >
                        <DDNSCard mutate={mutate} data={s} providers={providers} />
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
                <h1 className="flex-1 text-3xl font-bold tracking-tight">{t("DDNS")}</h1>
                <HeaderButtonGroup
                    className="flex ml-auto self-end sm:self-auto gap-2 flex-wrap shrink-0"
                    delete={{
                        fn: deleteDDNSProfiles,
                        id: selectedRows.map((r) => r.original.id),
                        mutate: mutate,
                    }}
                >
                    <DDNSCard mutate={mutate} providers={providers} />
                </HeaderButtonGroup>
            </div>

            <DataTable table={table} isLoading={isLoading} />
        </div>
    )
}
