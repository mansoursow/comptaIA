import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

export default function CashRegister() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [transactionForm, setTransactionForm] = useState({
    type: "income",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (data: typeof transactionForm) => {
      // Convert amount to cents for storage
      const amountInCents = Math.round(parseFloat(data.amount) * 100);
      
      await apiRequest("POST", "/api/transactions", {
        ...data,
        amount: amountInCents
      });
    },
    onSuccess: () => {
      // Invalidate transactions cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      // Reset form
      setTransactionForm({
        type: "income",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: ""
      });
      
      // Show success toast
      toast({
        title: "Opération enregistrée",
        description: "L'opération a été enregistrée avec succès",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un montant valide",
        variant: "destructive",
      });
      return;
    }
    
    if (!transactionForm.category) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie",
        variant: "destructive",
      });
      return;
    }
    
    createTransaction.mutate(transactionForm);
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Gestion de caisse</CardTitle>
          <div className="space-x-2 mt-4 md:mt-0">
            <Button variant="default">
              <i className="fas fa-plus mr-1"></i> Nouvelle opération
            </Button>
            <Button variant="outline">
              <i className="fas fa-download mr-1"></i> Exporter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Form */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Enregistrer une opération</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label>Type d'opération</Label>
                <RadioGroup 
                  className="flex space-x-4 mt-1" 
                  value={transactionForm.type}
                  onValueChange={(value) => setTransactionForm({...transactionForm, type: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="cursor-pointer">Encaissement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="cursor-pointer">Décaissement</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="amount">Montant</Label>
                <div className="mt-1 relative">
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
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={transactionForm.category} 
                  onValueChange={(value) => setTransactionForm({...transactionForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionForm.type === "income" ? (
                      <>
                        <SelectItem value="sale">Vente</SelectItem>
                        <SelectItem value="service">Prestation de service</SelectItem>
                        <SelectItem value="refund">Remboursement</SelectItem>
                        <SelectItem value="other_income">Autre recette</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="supplies">Fournitures</SelectItem>
                        <SelectItem value="rent">Loyer</SelectItem>
                        <SelectItem value="utilities">Services publics</SelectItem>
                        <SelectItem value="salary">Salaires</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="other_expense">Autre dépense</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  rows={2}
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Enregistrer
              </Button>
            </form>
          </div>
          
          {/* Transactions List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Dernières opérations</h3>
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : transactions && transactions.length > 0 ? (
                    transactions.slice(0, 4).map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'income' ? 'Encaissement' : 'Décaissement'}
                          </span>
                        </td>
                        <td className={`whitespace-nowrap px-3 py-3 text-sm font-medium ${
                          transaction.type === 'income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount / 100)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                          {transaction.category === 'sale' && 'Vente'}
                          {transaction.category === 'service' && 'Prestation'}
                          {transaction.category === 'refund' && 'Remboursement'}
                          {transaction.category === 'other_income' && 'Autre recette'}
                          {transaction.category === 'supplies' && 'Fournitures'}
                          {transaction.category === 'rent' && 'Loyer'}
                          {transaction.category === 'utilities' && 'Services publics'}
                          {transaction.category === 'salary' && 'Salaires'}
                          {transaction.category === 'transport' && 'Transport'}
                          {transaction.category === 'other_expense' && 'Autre dépense'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                        Aucune opération enregistrée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Button variant="link" className="text-primary hover:text-primary-dark">
                Voir toutes les opérations <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
