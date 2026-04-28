'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Package, 
  Truck, 
  LogOut, 
  PlusCircle, 
  Loader2,
  MapPin,
  Clock,
  CheckCircle2,
  MapPinned
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PaqueteData {
  id: string;
  guia_numero: string;
  tipo: string;
  estado: string;
  direccion: string;
  valor_pedido: number;
  created_at: string;
}

export default function BusinessPackagesPage() {
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const [misPaquetes, setMisPaquetes] = useState<PaqueteData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        fetchMisPaquetes(session.user.id);
      } else {
        router.push('/');
      }
    };
    getSession();
  }, [router]);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('paquetes_empresa_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paquetes',
          filter: `empresa_id=eq.${userId}`
        },
        () => {
          // Refrescar la lista cuando hay cualquier cambio
          fetchMisPaquetes(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchMisPaquetes = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('paquetes')
        .select('*')
        .eq('empresa_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMisPaquetes(data || []);
    } catch (error: any) {
      console.error("Error fetching packages:", error);
    } finally {
      setFetchingPackages(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'entregado': 
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle2 className="w-3 h-3 mr-1"/> Entregado</Badge>;
      case 'llegado': 
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50"><MapPinned className="w-3 h-3 mr-1"/> He llegado</Badge>;
      case 'en_ruta': 
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50"><Truck className="w-3 h-3 mr-1"/> En Ruta</Badge>;
      case 'buscando_operador': 
        return <Badge variant="outline" className="text-accent border-accent/50 bg-accent/10"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Buscando</Badge>;
      default: 
        return <Badge variant="outline" className="text-orange-400 border-orange-400/50 bg-orange-400/10"><Clock className="w-3 h-3 mr-1"/> Pendiente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-white overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-black/20 border-r border-white/10 flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <Truck className="h-8 w-8 text-accent" />
          <span className="text-xl font-bold tracking-tight">Solucionex</span>
        </div>
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard/business-portal">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-3 transition-all",
                pathname === '/dashboard/business-portal' ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <PlusCircle className={cn("h-5 w-5", pathname === '/dashboard/business-portal' && "text-accent")} /> Nueva Solicitud
            </Button>
          </Link>
          <Link href="/dashboard/business-portal/packages">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-3 transition-all",
                pathname === '/dashboard/business-portal/packages' ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Package className={cn("h-5 w-5", pathname === '/dashboard/business-portal/packages' && "text-accent")} /> Mis Paquetes
            </Button>
          </Link>
        </nav>
        <div className="pt-6 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => {
            supabase.auth.signOut();
            router.push('/');
          }}>
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto pb-24 lg:pb-8">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/10 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-accent" />
            <span className="font-bold">Solucionex</span>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Portal Empresa
          </div>
        </header>

        <div className="p-4 lg:p-8 flex justify-center items-start">
          <div className="w-full max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold">Mis Paquetes</h2>
            {fetchingPackages ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
                <p className="text-slate-400">Cargando tus paquetes...</p>
              </div>
            ) : misPaquetes.length === 0 ? (
              <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center flex flex-col items-center">
                <Package className="h-12 w-12 text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-white">Sin paquetes registrados</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {misPaquetes.map((pkg) => (
                  <Card key={pkg.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                          <Package className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">Guía: {pkg.guia_numero}</p>
                            {getStatusBadge(pkg.estado)}
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-[150px] md:max-w-[300px] mt-1">
                            <MapPin className="inline h-3 w-3 mr-1" /> {pkg.direccion}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                            {isMounted ? new Date(pkg.created_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                         <p className="text-lg font-bold text-accent">${pkg.valor_pedido}</p>
                         <p className="text-[10px] text-slate-500 uppercase">{pkg.tipo}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex lg:hidden items-center justify-around z-50 shadow-2xl overflow-hidden px-2">
        <Link href="/dashboard/business-portal" className={cn("flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative", pathname === '/dashboard/business-portal' ? "text-accent" : "text-slate-400")}>
          <PlusCircle className="h-5 w-5" />
          <span className="text-[10px] font-bold">Solicitud</span>
          {pathname === '/dashboard/business-portal' && <div className="absolute top-0 w-8 h-1 bg-accent rounded-b-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" />}
        </Link>
        <Link href="/dashboard/business-portal/packages" className={cn("flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative", pathname === '/dashboard/business-portal/packages' ? "text-accent" : "text-slate-400")}>
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-bold">Paquetes</span>
          {pathname === '/dashboard/business-portal/packages' && <div className="absolute top-0 w-8 h-1 bg-accent rounded-b-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" />}
        </Link>
        <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="flex flex-col items-center justify-center gap-1 w-full h-full text-red-400">
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-bold">Salir</span>
        </button>
      </nav>
    </div>
  );
}