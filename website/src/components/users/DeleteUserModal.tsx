import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function DeleteUserModal ({isOpen,onClose,onSuccess,user}:DeleteUserModalProps){
    const [loading, setLoading] = useState(false);
    
    if(!isOpen || !user) return

    async function handleDelete(){
        if (!user?.id) return;

        try {
            setLoading(true);
            await userService.deleteUser(user.id);
            onSuccess();
        } catch (err) {
            alert('Erro ao excluir o produto.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-md px-4">
            <div className="bg-white rounded-xl p-6 w-full mx-auto max-w-md shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 text-red-600">
                        <AlertTriangle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">Excluir Produto</h3>
                    
                    <p className="text-sm text-gray-600 mb-6">
                        Tem certeza que deseja excluir o produto <span className="font-semibold text-gray-900">"{user.name}"</span>? Esta ação não poderá ser desfeita.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'A excluir...' : 'Sim, Excluir'}
                    </button>
                </div>
            </div>
        </div>
    )
}