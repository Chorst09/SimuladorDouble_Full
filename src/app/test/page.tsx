'use client';

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function TestPage() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return <div className="p-8">Carregando...</div>;
    }

    if (!user) {
        return <div className="p-8">Usuário não autenticado</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Página de Teste</h1>
            <p>Usuário: {user.email}</p>
            <p>Role: {user.role}</p>
            <Button onClick={logout} className="mt-4">Logout</Button>
        </div>
    );
}
