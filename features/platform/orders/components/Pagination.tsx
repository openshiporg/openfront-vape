"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function Pagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const searchParams = useSearchParams() ?? new URLSearchParams();

  if (totalItems <= 0) return null;

  // Helper function to create pagination URLs that preserve other query params
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set('page', page.toString());
    return `/dashboard/platform/orders?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex-1 flex justify-between sm:hidden">
        <Link
          href={createPageUrl(Math.max(1, currentPage - 1))}
          className={`relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-background text-foreground hover:bg-muted'}`}
        >
          Previous
        </Link>
        <Link
          href={createPageUrl(Math.min(totalPages, currentPage + 1))}
          className={`relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-background text-foreground hover:bg-muted'}`}
        >
          Next
        </Link>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-foreground">
            Showing <span className="font-medium">{Math.min(1 + (currentPage - 1) * 10, totalItems)}</span> to <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md -space-x-px" aria-label="Pagination">
            <Link
              href={createPageUrl(Math.max(1, currentPage - 1))}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-background text-sm font-medium ${currentPage === 1 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <span className="sr-only">Previous</span>
              &larr;
            </Link>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Link
                  key={pageNum}
                  href={createPageUrl(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ? 'z-10 border-foreground bg-foreground text-background' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {pageNum}
                </Link>
              );
            })}
            <Link
              href={createPageUrl(Math.min(totalPages, currentPage + 1))}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-background text-sm font-medium ${currentPage === totalPages ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <span className="sr-only">Next</span>
              &rarr;
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}