
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, ArrowRight, Loader2, ShieldCheck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (type: 'login' | 'register') => {
    setLoading(true);
    try {
      if (type === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: "Registro exitoso", description: "Revisa tu correo para confirmar la cuenta." });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="bg-primary p-4 rounded-2xl shadow-lg mb-4">
            <Truck className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            FastDelivery <span className="text-accent">Pro</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Logística impulsada por Supabase</p>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login">Ingresar</TabsTrigger>
                <TabsTrigger value="register">Registro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Correo Electrónico</Label>
                  <Input id="email-login" type="email" placeholder="tu@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass-login">Contraseña</Label>
                  <Input id="pass-login" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full group" disabled={loading} onClick={() => handleAuth('login')}>
                  {loading ? <Loader2 className="animate-spin" /> : <>Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-reg">Correo Electrónico</Label>
                  <Input id="email-reg" type="email" placeholder="admin@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass-reg">Contraseña</Label>
                  <Input id="pass-reg" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full bg-accent text-primary hover:bg-accent/90" disabled={loading} onClick={() => handleAuth('register')}>
                  {loading ? <Loader2 className="animate-spin" /> : "Crear Empresa"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 gap-4 mt-8 opacity-60">
          <div className="flex items-center gap-2 text-xs text-primary justify-center">
            <ShieldCheck className="h-4 w-4" />
            <span>Supabase Auth</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary justify-center">
            <Package className="h-4 w-4" />
            <span>CRUD en tiempo real</span>
          </div>
        </div>
      </div>
    </main>
  );
}
