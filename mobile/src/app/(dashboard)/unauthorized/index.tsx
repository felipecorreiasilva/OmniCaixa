import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50 flex-col items-center justify-center px-6 text-center">
            <View className="bg-red-50 p-4 rounded-full mb-4 border border-red-100 shadow-sm items-center justify-center">
                <ShieldAlert size={48} color="#ef4444" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Acesso Restrito
            </Text>
            
            <Text className="text-sm text-gray-600 max-w-sm mb-6 text-center">
                A sua conta não possui permissões suficientes para aceder a esta secção do OmniCaixa. Contacte um administrador.
            </Text>
            
            <TouchableOpacity
                onPress={() => router.replace('/')}
                className="flex-row items-center justify-center gap-2 bg-slate-900 px-5 py-3 rounded-xl shadow-sm"
            >
                <ArrowLeft size={18} color="#ffffff" />
                <Text className="text-white font-medium text-sm">
                    Voltar para Página Principal
                </Text>
            </TouchableOpacity>
        </View>
    );
}