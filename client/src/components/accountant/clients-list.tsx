import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FolderOpen, MessageSquare, MoreVertical, Search, Filter } from "lucide-react";
import { getInitials, stringToColor } from "@/lib/utils";

export default function ClientsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  // Fetch clients
  const { data: clients, isLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/clients"],
  });
  
  // Filter clients by search term
  const filteredClients = clients?.filter(client => 
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination
  const totalClients = filteredClients?.length || 0;
  const totalPages = Math.ceil(totalClients / itemsPerPage);
  const currentClients = filteredClients?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return (
    <Card className="shadow-sm border border-gray-200 mb-8">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Liste des clients</CardTitle>
          <div className="flex items-center mt-4 md:mt-0">
            <div className="relative mr-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Rechercher un client"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <Button variant="default">
              <Filter className="h-4 w-4 mr-2" /> Filtrer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière activité</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : currentClients && currentClients.length > 0 ? (
                currentClients.map((client) => {
                  const initials = getInitials(client.fullName);
                  const avatarColor = stringToColor(client.fullName);
                  // Mock data for demonstration - will be replaced with real data
                  const hasNewDocs = Math.random() > 0.5;
                  const lastActivity = new Date(client.createdAt);
                  lastActivity.setDate(lastActivity.getDate() + Math.floor(Math.random() * 10));
                  
                  return (
                    <tr key={client.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div 
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                              style={{ backgroundColor: avatarColor }}
                            >
                              {initials}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{client.fullName}</div>
                            <div className="text-xs text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        Client
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">12</span>
                          {hasNewDocs && (
                            <Badge variant="destructive" className="text-xs">3 nouveaux</Badge>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lastActivity.toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <Badge variant="success" className="text-xs">Actif</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary hover:text-primary-dark">
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                    {searchTerm ? "Aucun client trouvé pour cette recherche" : "Aucun client disponible"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalClients > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalClients)}</span> sur <span className="font-medium">{totalClients}</span> clients
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
