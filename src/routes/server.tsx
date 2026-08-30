import { swrFetcher } from "@/api/api"
import { deleteServer, forceUpdateServer } from "@/api/server"
import { ActionButtonGroup } from "@/components/action-button-group"
import { BatchMoveServerIcon } from "@/components/batch-move-server-icon"
import { CopyButton } from "@/components/copy-button"
import { DataTable } from "@/components/data-table"
import { InstallCommandsMenu } from "@/components/install-commands"
import { NoteMenu } from "@/components/note-menu"
import { createSelectionColumn } from "@/components/selection-column"
import { ServerCard } from "@/components/server"
import { ServerConfigCard } from "@/components/server-config"
import { ServerConfigCardBatch } from "@/components/server-config-batch"
import { TablePageHeader } from "@/components/table-page-header"
import { TerminalButton } from "@/components/terminal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconButton } from "@/components/xui/icon-button"
import { useServer } from "@/hooks/useServer"
import { joinIP } from "@/lib/utils"
import { ModelServerTaskResponse, ModelServer as Server } from "@/types"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import useSWR from "swr"

export default function ServerPage() {
    const { t } = useTranslation()
    const { data, mutate, error, isLoading } = useSWR<Server[]>("/api/v1/server", swrFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })
    const { serverGroups } = useServer()

    useEffect(() => {
        if (error)
            toast(t("Error"), {
                description: t("Results.ErrorFetchingResource", { error: error.message }),
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const columns: ColumnDef<Server>[] = [
        createSelectionColumn<Server>(),
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: (row) => `${row.id}(${row.display_index})`,
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
            header: t("Group"),
            accessorKey: "groups",
            accessorFn: (row) => {
                return (
                    serverGroups
                        ?.filter((sg) => sg.servers?.includes(row.id))
                        .map((sg) => sg.group.id) || []
                )
            },
        },
        {
            id: "ip",
            header: "IP",
            cell: ({ row }) => {
                const s = row.original
                return (
                    <div className="max-w-24 whitespace-normal break-words">
                        {joinIP(s.geoip?.ip)}
                    </div>
                )
            },
        },
        {
            header: t("Version"),
            accessorKey: "host.version",
            accessorFn: (row) => row.host.version || t("Unknown"),
        },
        {
            header: t("EnableDDNS"),
            accessorKey: "enableDDNS",
            accessorFn: (row) => row.enable_ddns ?? false,
        },
        {
            header: t("HideForGuest"),
            accessorKey: "hideForGuest",
            accessorFn: (row) => row.hide_for_guest ?? false,
        },
        {
            id: "note",
            header: t("Note"),
            cell: ({ row }) => {
                const s = row.original
                return <NoteMenu note={{ private: s.note, public: s.public_note }} />
            },
        },
        {
            id: "uuid",
            header: "UUID",
            cell: ({ row }) => {
                const s = row.original
                return <CopyButton text={s.uuid} />
            },
        },
        {
            id: "actions",
            header: t("Actions"),
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup
                        className="flex gap-2"
                        delete={{ fn: deleteServer, id: s.id, mutate: mutate }}
                    >
                        <>
                            <ServerCard mutate={mutate} data={s} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <IconButton
                                        icon="more"
                                        variant="outline"
                                        aria-label="More actions"
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <TerminalButton id={s.id} menuItem />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <ServerConfigCard sid={s.id} variant="ghost" menuItem />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <InstallCommandsMenu uuid={s.uuid} menuItem />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                title={t("Server")}
                deleteAction={{
                    fn: deleteServer,
                    id: selectedRows.map((r) => r.original.id),
                    mutate: mutate,
                }}
            >
                <IconButton
                    icon="update"
                    onClick={async () => {
                        const id = selectedRows.map((r) => r.original.id)
                        if (id.length < 1) {
                            toast(t("Error"), {
                                description: t("Results.SelectAtLeastOneServer"),
                            })
                            return
                        }

                        let resp: ModelServerTaskResponse = {}
                        try {
                            resp = await forceUpdateServer(id)
                        } catch (e) {
                            console.error(e)
                            toast(t("Error"), {
                                description: t("Results.UnExpectedError"),
                            })
                            return
                        }
                        toast(t("Done"), {
                            description:
                                t("Results.ForceUpdate") +
                                (resp.success?.length
                                    ? t(`Success`) + ` [${resp.success.join(",")}]`
                                    : "") +
                                (resp.failure?.length
                                    ? t(`Failure`) + ` [${resp.failure.join(",")}]`
                                    : "") +
                                (resp.offline?.length
                                    ? t(`Offline`) + ` [${resp.offline.join(",")}]`
                                    : ""),
                        })
                    }}
                />
                <BatchMoveServerIcon serverIds={selectedRows.map((r) => r.original.id)} />
                <ServerConfigCardBatch
                    sid={selectedRows.map((r) => r.original.id)}
                    className="rounded-[var(--radius-control)] shadow-[inset_0_0.0625rem_0_rgba(255,255,255,0.2)] bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600"
                />
                <InstallCommandsMenu className="rounded-[var(--radius-control)] shadow-[inset_0_0.0625rem_0_rgba(255,255,255,0.2)] bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500" />
            </TablePageHeader>
            <DataTable
                table={table}
                isLoading={isLoading}
                className="min-w-[60rem]"
                headerClassName="sticky top-0 bg-background z-10"
            />
        </div>
    )
}
