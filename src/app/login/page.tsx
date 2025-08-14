// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
// Importação de useAuth removida
// import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Importação de Loader2 removida se não for mais usada
// import { Loader2 } from 'lucide-react';
// Importação de useToast removida se não for mais usada
// import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';


const LoginPage = () => {
  // Estados de email/senha podem ser removidos se não houver formulário
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // Chamada e uso de useAuth removidos
  // const { user, loading, error, login, loginWithEmailPassword } = useAuth();
  const router = useRouter();
  // Chamada a useToast removida
  // const { toast } = useToast();

  // Efeito para redirecionar removido
  // useEffect(() => { ... }, [user, loading, router]);

  // Lógica para login com email e senha removida
  // const handleEmailPasswordLogin = async (e: React.FormEvent) => { ... };

  // Lógica para login com Google removida
  // const handleGoogleLogin = async () => { ... };

  // Lógica para continuar sem login mantida
  const handleContinueWithoutLogin = () => {
    router.push('/'); // Redireciona para a página principal
  };


  // Renderiza o formulário simplificado (apenas com a opção de continuar sem login)
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Acesso</CardTitle>
          <CardDescription className="text-center">
            Continue para acessar a aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {/* Botão Continuar sem Login */}
           <Button
             onClick={handleContinueWithoutLogin}
             className="w-full mt-4 text-center"
           >
             Continuar
           </Button>

          {/* Links de cadastro e login removidos ou modificados */}
          {/* <div className="mt-4 text-center text-sm"> ... </div> */}

        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
