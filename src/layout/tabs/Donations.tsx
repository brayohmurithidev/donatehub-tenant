import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Download, Heart, TrendingUp, Users, DollarSign, Phone, Mail, MessageSquare, Target, ArrowUpDown, ArrowUp, ArrowDown} from "lucide-react";
import {useGetDonations} from "@/hooks/api/useDonation";
import {LoadingSpinner} from "@/components/loadingSpinner";
import type {DonationType} from "@/lib/types";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import jsPDF from "jspdf";

// Import autoTable plugin
import autoTable from "jspdf-autotable";

// Extend jsPDF with autoTable method
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'danger';
    case 'PENDING':
      return 'warning';
    default:
      return 'secondary';
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case 'SUCCESS':
      return '✓';
    case 'FAILED':
      return '✗';
    case 'PENDING':
      return '⏳';
    default:
      return '?';
  }
}

// PDF Export Function
const exportToPDF = (donations: DonationType[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Donations Report', 14, 22);
  
  // Add subtitle with date
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 32);
  
  // Prepare table data
  const tableData = donations.map(donation => [
    donation.is_anonymous || !donation.donor_name ? 'Anonymous' : donation.donor_name || 'N/A',
    `KES ${parseFloat(donation.amount).toLocaleString()}`,
    donation.campaign?.title || 'N/A',
    donation.method,
    formatDate(donation.donated_at),
    donation.status === 'SUCCESS' ? 'PAID' : donation.status === 'FAILED' ? 'FAILED' : donation.status,
    donation.transaction_id || 'N/A'
  ]);
  
  // Add table using autoTable
  doc.autoTable({
    head: [['Donor', 'Amount', 'Campaign', 'Method', 'Date', 'Status', 'Transaction ID']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light gray
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Donor
      1: { cellWidth: 25 }, // Amount
      2: { cellWidth: 35 }, // Campaign
      3: { cellWidth: 20 }, // Method
      4: { cellWidth: 25 }, // Date
      5: { cellWidth: 20 }, // Status
      6: { cellWidth: 30 }, // Transaction ID
    },
  });
  
  // Add summary statistics
  const totalAmount = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);
  const successfulDonations = donations.filter(d => d.status === 'SUCCESS').length;
  const successRate = donations.length > 0 ? (successfulDonations / donations.length) * 100 : 0;
  
  const finalY = doc.lastAutoTable.finalY || 40;
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Summary Statistics', 14, finalY + 20);
  
  doc.setFontSize(10);
  doc.text(`Total Donations: ${donations.length}`, 14, finalY + 30);
  doc.text(`Total Amount: KES ${totalAmount.toLocaleString()}`, 14, finalY + 37);
  doc.text(`Success Rate: ${successRate.toFixed(1)}%`, 14, finalY + 44);
  doc.text(`Unique Donors: ${new Set(donations.map(d => d.donor_phone)).size}`, 14, finalY + 51);
  
  // Save the PDF
  doc.save(`donations-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Define table columns
const columns: ColumnDef<DonationType>[] = [
  {
    accessorKey: "donor_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-gray-700 hover:bg-transparent"
        >
          Donor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donation = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">
              {donation.is_anonymous || !donation.donor_name 
                ? 'A' 
                : donation.donor_name.charAt(0).toUpperCase()
              }
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">
              {donation.is_anonymous || !donation.donor_name 
                ? 'Anonymous Donor' 
                : donation.donor_name
              }
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{donation.donor_phone}</span>
            </div>
            {donation.donor_email && donation.donor_email !== 'user@example.com' && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{donation.donor_email}</span>
              </div>
            )}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.is_anonymous || !rowA.original.donor_name 
        ? 'Anonymous Donor' 
        : rowA.original.donor_name || '';
      const nameB = rowB.original.is_anonymous || !rowB.original.donor_name 
        ? 'Anonymous Donor' 
        : rowB.original.donor_name || '';
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-gray-700 hover:bg-transparent text-right w-full justify-end"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donation = row.original;
      return (
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">
            {formatCurrency(parseFloat(donation.amount))}
          </p>
          <p className="text-xs text-gray-500">
            Transaction: {donation.transaction_id}
          </p>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const amountA = parseFloat(rowA.original.amount);
      const amountB = parseFloat(rowB.original.amount);
      return amountA - amountB;
    },
  },
  {
    accessorKey: "campaign",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-gray-700 hover:bg-transparent"
        >
          Campaign
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donation = row.original;
      return (
        <div className="flex items-center gap-3">
          {donation.campaign?.image_url ? (
            <img
              src={donation.campaign.image_url}
              alt={donation.campaign.title}
              className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">
              {donation.campaign?.title || 'Unknown Campaign'}
            </p>
            <p className="text-xs text-gray-500">
              Goal: {donation.campaign?.goal_amount ? formatCurrency(parseFloat(donation.campaign.goal_amount)) : 'N/A'}
            </p>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const titleA = rowA.original.campaign?.title || '';
      const titleB = rowB.original.campaign?.title || '';
      return titleA.localeCompare(titleB);
    },
  },
  {
    accessorKey: "method",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-gray-700 hover:bg-transparent"
        >
          Method
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donation = row.original;
      return (
        <Badge 
          variant="outline" 
          className="border-gray-300 text-gray-700 bg-gray-50"
        >
          {donation.method}
        </Badge>
      );
    },
  },
  {
    accessorKey: "donated_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-gray-700 hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donation = row.original;
      return (
        <div className="text-sm">
          <p className="font-medium text-gray-900">
            {formatDate(donation.donated_at)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(donation.donated_at).toLocaleDateString()}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-gray-700 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donation = row.original;
      const statusColor = getStatusColor(donation.status);
      const statusIcon = getStatusIcon(donation.status);
      
      return (
        <Badge 
          className={`bg-${statusColor} text-white border-0 shadow-sm`}
        >
          <span className="mr-1">{statusIcon}</span>
          {donation.status === "SUCCESS" ? "PAID" : 
           donation.status === "FAILED" ? "FAILED" : 
           donation.status}
        </Badge>
      );
    },
  },
];

const Donations = () => {
  const { data: donations, isLoading } = useGetDonations();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Initialize TanStack Table - must be before any conditional returns
  const table = useReactTable({
    data: donations || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
          <p className="text-gray-600 mt-2">Track all donations received across your campaigns</p>
        </div>

        {/* Empty State */}
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Donations Yet</h3>
            <p className="text-gray-600 text-center max-w-md">
              When donors contribute to your campaigns, their donations will appear here with detailed information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate summary statistics
  const totalDonations = donations.length;
  const totalAmount = donations.reduce((sum: number, donation: DonationType) => sum + parseFloat(donation.amount), 0);
  const successfulDonations = donations.filter((d: DonationType) => d.status === 'SUCCESS').length;
  const successRate = totalDonations > 0 ? (successfulDonations / totalDonations) * 100 : 0;

  const handleExportPDF = () => {
    if (donations && donations.length > 0) {
      exportToPDF(donations);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
          <p className="text-gray-600 mt-1">Track all donations received across your campaigns</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExportPDF}
          disabled={!donations || donations.length === 0}
        >
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary-50 to-primary-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Raised</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-success-50 to-success-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-lg font-bold text-gray-900">{totalDonations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-info-50 to-info-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-lg font-bold text-gray-900">{successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-warning-50 to-warning-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Donors</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Set(donations.map((d: DonationType) => d.donor_phone)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Recent Donations</CardTitle>
          </div>
          <CardDescription>
            Detailed view of all donation transactions and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search donations..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="text-sm text-gray-500">
              {table.getFilteredRowModel().rows.length} of {table.getRowModel().rows.length} donations
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="h-24 text-center text-gray-500">
                        No donations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information - Donor Messages */}
      {donations.some((d: DonationType) => (d as any).message && (d as any).message !== 'string') && (
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-info" />
              <h3 className="font-semibold text-gray-900">Donor Messages</h3>
            </div>
            <div className="space-y-2">
              {donations
                .filter((d: DonationType) => (d as any).message && (d as any).message !== 'string')
                .map((donation: DonationType, index: number) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        {donation.is_anonymous || !donation.donor_name 
                          ? 'Anonymous Donor' 
                          : donation.donor_name
                        }:
                      </span> {(donation as any).message}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Donations;
