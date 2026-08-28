import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useTranslation } from "react-i18next"

interface DataPaginationProps {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
}

function getPageNumbers(page: number, totalPages: number) {
    const pages: number[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    pages.push(1)

    let startPage = Math.max(2, page - 1)
    let endPage = Math.min(totalPages - 1, page + 1)

    if (page <= 3) {
        endPage = Math.min(maxVisiblePages - 1, totalPages - 1)
    } else if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxVisiblePages - 2))
    }

    if (startPage > 2) pages.push(-1)

    for (let current = startPage; current <= endPage; current++) {
        pages.push(current)
    }

    if (endPage < totalPages - 1) pages.push(-1)
    pages.push(totalPages)

    return pages
}

export function DataPagination({
    page,
    pageSize,
    total,
    onPageChange,
}: DataPaginationProps) {
    const { t } = useTranslation()
    const totalPages = Math.ceil(total / pageSize)

    if (!Number.isFinite(totalPages) || totalPages <= 1) return null

    const changePage = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) onPageChange(newPage)
    }

    return (
        <div data-slot="data-pagination" className="flex items-center justify-between px-2 py-4">
            <div className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
                {t("Total")}: {total}
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => changePage(page - 1)}
                            className={
                                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                            }
                        />
                    </PaginationItem>

                    {getPageNumbers(page, totalPages).map((pageNumber, index) =>
                        pageNumber === -1 ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    onClick={() => changePage(pageNumber)}
                                    isActive={pageNumber === page}
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        ),
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => changePage(page + 1)}
                            className={
                                page >= totalPages
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
