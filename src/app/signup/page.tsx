// src/app/signup/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';


const SignupPage = () => {
  const router = useRouter();

  // Redireciona para a página principal
  const redirectToHome = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Cadastro Desativado</CardTitle>
          <CardDescription className="text-center">
            O sistema de cadastro de novos usuários está temporariamente desativado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
           <Button onClick={redirectToHome}>
             Voltar para a Página Principal
           </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
