'use client';

import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4 border border-red-100 shadow-sm">
                <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h1>
            
            <p className="text-gray-600 max-w-md mb-6">
                A sua conta não possui permissões suficientes para aceder a esta secção do OmniCaixa. Contacte um administrador.
            </p>
            
            <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Pagina Principal
            </button>
        </div>
    );
}