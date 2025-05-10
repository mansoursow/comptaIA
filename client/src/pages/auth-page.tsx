import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ ...registerForm, role: "client" });
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Connexion</CardTitle>
                <CardDescription>
                  Accédez à votre tableau de bord financier
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input 
                      id="username" 
                      required
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    type="submit"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Se connecter
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Créer un compte</CardTitle>
                <CardDescription>
                  Rejoignez CompFinance pour gérer vos finances
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegisterSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input 
                      id="fullName" 
                      required
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerUsername">Nom d'utilisateur</Label>
                    <Input 
                      id="registerUsername" 
                      required
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Mot de passe</Label>
                    <Input 
                      id="registerPassword" 
                      type="password" 
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    type="submit"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    S'inscrire
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="hidden md:flex md:w-1/2 bg-primary-light items-center justify-center">
        <div className="max-w-md p-8 text-white">
          <h1 className="text-4xl font-bold mb-6">CompFinance</h1>
          <h2 className="text-2xl font-semibold mb-4">Gestion financière simplifiée</h2>
          <p className="text-lg mb-6">
            Une solution complète pour gérer vos finances et collaborer efficacement avec votre comptable.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Gestion de caisse simplifiée
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Facturation rapide et professionnelle
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Communication fluide avec votre comptable
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Suivi financier en temps réel
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
