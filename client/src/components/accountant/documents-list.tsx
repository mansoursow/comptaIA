import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Loader2, FileIcon, Eye, Check, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DocumentsList() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  // Fetch pending documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/pending-documents"],
  });
  
  // Filter documents by type
  const filteredDocuments = documents?.filter(doc => {
    if (documentType === "all") return true;
    return doc.type === documentType;
  });
  
  // Calculate pagination
  const totalDocuments = filteredDocuments?.length || 0;
  const totalPages = Math.ceil(totalDocuments / itemsPerPage);
  const currentDocuments = filteredDocuments?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Update document status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/documents/${id}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate documents cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/pending-documents"] });
      
      toast({
        title: "Document mis à jour",
        description: "Le statut du document a été mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">À traiter</Badge>;
      case 'processed':
        return <Badge variant="success">Traité</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get document type label
  const getDocumentTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'invoice': 'Facture client',
      'expense': 'Facture fournisseur',
      'bank_statement': 'Relevé bancaire',
      'receipt': 'Reçu',
      'other': 'Autre',
    };
    return typeMap[type] || type;
  };

  // Handle approve/reject document
  const handleProcessDocument = (id: number, status: 'processed' | 'rejected') => {
    updateStatus.mutate({ id, status });
  };
  
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Documents récents</CardTitle>
          <div className="flex items-center mt-4 md:mt-0">
            <Select 
              value={documentType} 
              onValueChange={setDocumentType}
            >
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="invoice">Factures clients</SelectItem>
                <SelectItem value="expense">Factures fournisseurs</SelectItem>
                <SelectItem value="bank_statement">Relevés bancaires</SelectItem>
                <SelectItem value="receipt">Reçus</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Exporter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading || updateStatus.isPending ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : currentDocuments && currentDocuments.length > 0 ? (
                currentDocuments.map((document) => (
                  <tr key={document.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3">
                      <div className="flex items-center">
                        <FileIcon className="h-5 w-5 text-danger mr-2" />
                        <span className="font-medium text-gray-900">{document.fileName}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {document.userId} {/* This should be the client name in a real implementation */}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {getDocumentTypeLabel(document.type)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(document.uploadDate)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {getStatusBadge(document.status)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary hover:text-primary-dark">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {document.status === "pending" ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-success hover:text-green-700"
                            onClick={() => handleProcessDocument(document.id, 'processed')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                            onClick={() => handleProcessDocument(document.id, 'rejected')}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                    {documentType !== "all" 
                      ? `Aucun document de type ${getDocumentTypeLabel(documentType)} trouvé` 
                      : "Aucun document à traiter"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalDocuments > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDocuments)}</span> sur <span className="font-medium">{totalDocuments}</span> documents
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
