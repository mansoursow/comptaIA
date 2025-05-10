import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import { X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'accountant';
  user: Omit<User, "password"> | null;
}

export default function SidebarNavigation({ 
  isOpen, 
  onClose, 
  userRole,
  user 
}: SidebarNavigationProps) {
  const { logoutMutation } = useAuth();
  const isMobile = useMobile();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside 
      className={`fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary">CompFinance</h1>
            <p className="text-sm text-gray-500">Gestion financière simplifiée</p>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {userRole === 'client' ? (
              <>
                <li>
                  <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestion</span>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-home w-5 h-5 mr-2 text-primary"></i>
                    <span>Tableau de bord</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-cash-register w-5 h-5 mr-2 text-primary"></i>
                    <span>Caisse</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-file-invoice-dollar w-5 h-5 mr-2 text-primary"></i>
                    <span>Factures clients</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-file-upload w-5 h-5 mr-2 text-primary"></i>
                    <span>Factures d'achat</span>
                  </a>
                </li>
                <li>
                  <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comptabilité</span>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-chart-pie w-5 h-5 mr-2 text-primary"></i>
                    <span>Rapports</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-user-tie w-5 h-5 mr-2 text-primary"></i>
                    <span>Mon comptable</span>
                  </a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</span>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-tachometer-alt w-5 h-5 mr-2 text-primary"></i>
                    <span>Tableau de bord</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-users w-5 h-5 mr-2 text-primary"></i>
                    <span>Clients</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-file-alt w-5 h-5 mr-2 text-primary"></i>
                    <span>Documents</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-tasks w-5 h-5 mr-2 text-primary"></i>
                    <span>Tâches</span>
                  </a>
                </li>
                <li>
                  <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rapports</span>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-chart-bar w-5 h-5 mr-2 text-primary"></i>
                    <span>Statistiques</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-900 hover:bg-gray-100">
                    <i className="fas fa-file-export w-5 h-5 mr-2 text-primary"></i>
                    <span>Exports</span>
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
        
        {/* Account Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.fullName || 'Utilisateur'}</p>
              <button 
                className="text-xs text-gray-500 hover:text-primary"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
