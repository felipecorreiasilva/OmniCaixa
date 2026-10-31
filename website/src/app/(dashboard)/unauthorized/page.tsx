'use client';

import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-zinc-950 text-zinc-100">
            <div className="bg-red-500/10 p-5 rounded-3xl mb-4 border border-red-500/20 shadow-sm">
                <ShieldAlert className="w-12 h-12 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
            
            <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
                A sua conta não possui permissões suficientes para aceder a esta secção do OmniCaixa. Contacte um administrador.
            </p>
            
            <button
                type="button"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                Voltar para Página Principal
            </button>
        </div>
    );
}