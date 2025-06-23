import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import SidebarNavigation from "@/components/sidebar-navigation";
import UserToggle from "@/components/ui/user-toggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import StatCard from "@/components/ui/stat-card";
import CashRegister from "@/components/client/cash-register";
import Invoices from "@/components/client/invoices";
import Expenses from "@/components/client/expenses";
import ClientsList from "@/components/accountant/clients-list";
import DocumentsList from "@/components/accountant/documents-list";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [userRole, setUserRole] = useState<"client" | "accountant">(
    (user?.role as "client" | "accountant") || "client"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const isClient = userRole === "client";
  const isAccountant = userRole === "accountant";

  const toggleUserRole = () => {
    if (user?.role === "accountant") {
      setUserRole(userRole === "client" ? "accountant" : "client");
    } else {
      toast({
        title: "Accès refusé",
        description:
          "Vous n'avez pas les droits pour accéder à l'interface comptable.",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background dark:text-foreground">
      {/* Contrôles Utilisateur : rôle + thème */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {user?.role === "accountant" && (
          <UserToggle
            value={userRole === "accountant"}
            onChange={toggleUserRole}
          />
        )}
        <ThemeToggle />
      </div>

      {/* Bouton menu mobile */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white dark:bg-card shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation latérale */}
      <SidebarNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={userRole}
        user={user}
      />

      {/* Contenu principal */}
      <main className={`pt-16 ${isMobile ? "px-4" : "lg:pl-64 px-8"}`}>
        {isClient && (
          <div>
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tableau de bord
              </h1>
              <p className="text-gray-500 dark:text-gray-300">
                Bienvenue sur votre espace de gestion financière
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Chiffre d'affaires"
                value="24 560,00 €"
                change="+5.3%"
                trend="up"
                icon="euro"
                color="primary"
              />
              <StatCard
                title="Dépenses"
                value="8 320,00 €"
                change="+2.1%"
                trend="up"
                icon="receipt"
                color="danger"
              />
              <StatCard
                title="Factures en attente"
                value="4"
                subtitle="Montant total: 3 450,00 €"
                icon="invoice"
                color="secondary"
              />
              <StatCard
                title="Documents à traiter"
                value="7"
                action={{
                  label: "Transmettre au comptable",
                  onClick: () => {
                    toast({
                      title: "Documents transmis",
                      description:
                        "Documents transmis au comptable avec succès!",
                      variant: "success",
                    });
                  },
                }}
                icon="upload"
                color="accent"
              />
            </div>

            <Tabs defaultValue="cash-register" className="mb-8">
              <TabsList>
                <TabsTrigger value="cash-register">Caisse</TabsTrigger>
                <TabsTrigger value="invoices">Factures</TabsTrigger>
                <TabsTrigger value="expenses">Dépenses</TabsTrigger>
              </TabsList>
              <TabsContent value="cash-register">
                <CashRegister />
              </TabsContent>
              <TabsContent value="invoices">
                <Invoices />
              </TabsContent>
              <TabsContent value="expenses">
                <Expenses />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {isAccountant && (
          <div>
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Espace comptable
              </h1>
              <p className="text-gray-500 dark:text-gray-300">
                Gestion des clients et de leurs documents
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                title="Clients actifs"
                value="24"
                change="+2 nouveaux ce mois"
                trend="up"
                icon="users"
                color="primary"
              />
              <StatCard
                title="Documents à traiter"
                value="42"
                change="8 documents urgents"
                trend="warning"
                icon="file"
                color="accent"
              />
              <StatCard
                title="Tâches complétées"
                value="128"
                subtitle="Ce mois : 36 tâches"
                icon="check"
                color="secondary"
              />
            </div>

            <ClientsList />
            <DocumentsList />
          </div>
        )}
      </main>
    </div>
  );
}
