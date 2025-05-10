import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Invoices() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Calculate pagination
  const totalInvoices = invoices?.length || 0;
  const totalPages = Math.ceil(totalInvoices / itemsPerPage);
  const currentInvoices = invoices?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'sent':
        return <Badge variant="secondary">Envoyée</Badge>;
      case 'paid':
        return <Badge variant="success">Payée</Badge>;
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Gestion des factures</CardTitle>
          <div className="space-x-2 mt-4 md:mt-0">
            <Button variant="default">
              <i className="fas fa-plus mr-1"></i> Nouvelle facture
            </Button>
            <Button variant="outline">
              <i className="fas fa-filter mr-1"></i> Filtrer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Facture</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : currentInvoices && currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      {invoice.clientName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      {formatCurrency(invoice.amount / 100)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <i className="fas fa-download"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-sm text-gray-500">
                    Aucune facture trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalInvoices > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalInvoices)}</span> sur <span className="font-medium">{totalInvoices}</span> résultats
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
