import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Expense } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { Loader2, FileIcon, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Expenses() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    type: "",
    amount: "",
    supplierName: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    notes: ""
  });

  // Fetch expenses
  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // Create expense mutation
  const createExpense = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Échec de l'ajout de la dépense");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate expenses cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      
      // Reset form
      setExpenseForm({
        type: "",
        amount: "",
        supplierName: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        notes: ""
      });
      setSelectedFile(null);
      
      // Show success toast
      toast({
        title: "Dépense ajoutée",
        description: "La facture d'achat a été ajoutée avec succès",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }
    
    if (!expenseForm.type) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de dépense",
        variant: "destructive",
      });
      return;
    }
    
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un montant valide",
        variant: "destructive",
      });
      return;
    }
    
    if (!expenseForm.supplierName) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom du fournisseur",
        variant: "destructive",
      });
      return;
    }
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", expenseForm.type);
    formData.append("amount", (parseFloat(expenseForm.amount) * 100).toString());
    formData.append("supplierName", expenseForm.supplierName);
    formData.append("invoiceDate", expenseForm.invoiceDate);
    formData.append("notes", expenseForm.notes);
    
    createExpense.mutate(formData);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'processed':
        return <Badge variant="success">Traité</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Gestion des dépenses</CardTitle>
          <div className="space-x-2 mt-4 md:mt-0">
            <Button variant="default">
              <i className="fas fa-upload mr-1"></i> Ajouter une facture
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Téléverser des factures d'achat</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="expense-upload"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label 
                htmlFor="expense-upload" 
                className="cursor-pointer block"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Glissez-déposez vos fichiers ici ou cliquez pour parcourir</p>
                <p className="text-xs text-gray-400 mt-1">Formats acceptés: PDF, JPG, PNG</p>
              </label>
              {selectedFile && (
                <div className="mt-4 space-y-2">
                  <div className="p-2 border rounded mb-2 flex items-center">
                    <FileIcon className="h-4 w-4 text-danger mr-2" />
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                </div>
              )}
            </div>
            
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Informations complémentaires</h3>
              <div>
                <Label htmlFor="expense-type">Type de dépense</Label>
                <Select 
                  value={expenseForm.type} 
                  onValueChange={(value) => setExpenseForm({...expenseForm, type: value})}
                >
                  <SelectTrigger id="expense-type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplies">Fournitures</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="equipment">Équipement</SelectItem>
                    <SelectItem value="travel">Déplacements</SelectItem>
                    <SelectItem value="rent">Loyer</SelectItem>
                    <SelectItem value="utilities">Services publics</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="invoice-date">Date de facture</Label>
                <Input 
                  id="invoice-date" 
                  type="date" 
                  value={expenseForm.invoiceDate}
                  onChange={(e) => setExpenseForm({...expenseForm, invoiceDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="supplier-name">Nom du fournisseur</Label>
                <Input 
                  id="supplier-name" 
                  value={expenseForm.supplierName}
                  onChange={(e) => setExpenseForm({...expenseForm, supplierName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Montant TTC</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">€</span>
                  </div>
                  <Input 
                    id="amount" 
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  rows={2}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={createExpense.isPending}
              >
                {createExpense.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Enregistrer
              </Button>
            </form>
          </div>
          
          {/* Expenses List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Factures récentes</h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : expenses && expenses.length > 0 ? (
                expenses.slice(0, 4).map((expense) => (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{expense.supplierName}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {expense.fileName?.split('.')[0] || 'Facture'} • {new Date(expense.invoiceDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(expense.amount / 100)}
                      </span>
                    </div>
                    <div className="flex items-center mt-3">
                      <span className={`bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ${
                        expense.status !== 'pending' && 'mr-2'
                      }`}>
                        {expense.type === 'supplies' && 'Fournitures'}
                        {expense.type === 'services' && 'Services'}
                        {expense.type === 'equipment' && 'Équipement'}
                        {expense.type === 'travel' && 'Déplacements'}
                        {expense.type === 'rent' && 'Loyer'}
                        {expense.type === 'utilities' && 'Services publics'}
                        {expense.type === 'other' && 'Autre'}
                      </span>
                      {expense.status !== 'pending' && getStatusBadge(expense.status)}
                      <div className="flex ml-auto space-x-2">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  Aucune facture trouvée
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button variant="link" className="text-primary hover:text-primary-dark w-full">
                Voir toutes les factures <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
