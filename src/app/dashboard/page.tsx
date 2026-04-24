
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus, 
  Search, 
  MoreVertical, 
  LogOut, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Trash2,
  Edit2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface PackageData {
  id: string;
  tracking: string;
  client: string;
  status: string;
  destiny: string;
  created_at: string;
}

export default function Dashboard() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ client: '', destiny: '', status: 'Pendiente' });
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchPackages();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        // En un entorno de prototipo, si falla la sesión (por falta de config), no redirigimos forzosamente
        // para permitir ver la UI del Dashboard si el usuario así lo desea.
        console.log("No se pudo obtener el usuario de Supabase.");
      }
    } catch (e) {
      console.error("Error al verificar usuario:", e);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      console.error("Error cargando paquetes:", error);
      // Solo mostramos el toast si realmente hay un error de red o similar, 
      // pero evitamos spam si es por falta de configuración inicial.
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        toast({ variant: "destructive", title: "Error al cargar datos", description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.client || !formData.destiny) {
      toast({ variant: "destructive", title: "Campos incompletos", description: "Por favor llena todos los campos." });
      return;
    }

    try {
      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update(formData)
          .eq('id', editingPackage.id);
        if (error) throw error;
        toast({ title: "Paquete actualizado" });
      } else {
        const tracking = `TRK-${Math.floor(1000 + Math.random() * 9000)}`;
        const { error } = await supabase
          .from('packages')
          .insert([{ ...formData, tracking }]);
        if (error) throw error;
        toast({ title: "Paquete registrado" });
      }
      setIsDialogOpen(false);
      setEditingPackage(null);
      setFormData({ client: '', destiny: '', status: 'Pendiente' });
      fetchPackages();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al guardar", description: error.message });
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
      setPackages(packages.filter(p => p.id !== id));
      toast({ title: "Paquete eliminado" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Entregado': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Entregado</Badge>;
      case 'En Ruta': return <Badge className="bg-blue-500 hover:bg-blue-600"><Truck className="w-3 h-3 mr-1"/> En Ruta</Badge>;
      default: return <Badge variant="outline" className="text-orange-500 border-orange-500"><Clock className="w-3 h-3 mr-1"/> Pendiente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-primary text-primary-foreground hidden lg:flex flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <Truck className="h-8 w-8 text-accent" />
          <span className="text-xl font-bold tracking-tight">FastDelivery</span>
        </div>
        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-white/10 text-white">
            <Package className="h-5 w-5 text-accent" /> Envíos
          </Button>
        </nav>
        <div className="pt-6 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-primary">Gestión de Paquetes</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por tracking o cliente..." 
                className="pl-10 h-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-primary hover:bg-accent/90 font-bold" onClick={() => { setEditingPackage(null); setFormData({ client: '', destiny: '', status: 'Pendiente' }); }}>
                  <Plus className="h-4 w-4 mr-2" /> Nuevo Envío
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPackage ? 'Editar Envío' : 'Registrar Nuevo Paquete'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Nombre del Cliente</Label>
                    <Input id="client" value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} placeholder="Ej: Juan Pérez" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="destiny">Dirección de Destino</Label>
                    <Input id="destiny" value={formData.destiny} onChange={(e) => setFormData({...formData, destiny: e.target.value})} placeholder="Av. Principal 123, Madrid" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Ruta">En Ruta</SelectItem>
                        <SelectItem value="Entregado">Entregado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Conectando con base de datos...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-primary">No hay paquetes registrados</h3>
              <p className="text-muted-foreground">Comienza agregando tu primer envío al sistema.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Tracking ID</TableHead>
                    <TableHead className="font-bold">Cliente</TableHead>
                    <TableHead className="font-bold">Destino</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="text-right font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages
                    .filter(p => 
                      p.client.toLowerCase().includes(search.toLowerCase()) || 
                      p.tracking.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-mono font-medium text-primary">{pkg.tracking}</TableCell>
                      <TableCell>{pkg.client}</TableCell>
                      <TableCell>{pkg.destiny}</TableCell>
                      <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => {
                              setEditingPackage(pkg);
                              setFormData({ client: pkg.client, destiny: pkg.destiny, status: pkg.status });
                              setIsDialogOpen(true);
                            }}>
                              <Edit2 className="h-4 w-4 text-blue-500" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-red-600 cursor-pointer"
                              onClick={() => deletePackage(pkg.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
