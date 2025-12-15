import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Temporary password for demo - in production, use proper auth
  const DEMO_PASSWORD = 'admin123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === DEMO_PASSWORD) {
      // In production, set a proper auth token/session
      sessionStorage.setItem('admin_authenticated', 'true');
      navigate('/admin');
    } else {
      toast({
        title: 'Acesso negado',
        description: 'Senha incorreta. Tente novamente.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-academic max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl text-foreground mb-2">
            Área Administrativa
          </h1>
          <p className="text-sm text-muted-foreground">
            Insira a senha para acessar o painel de gerenciamento
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Senha de Acesso</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Acessar Painel'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Demo:</strong> Use a senha <code className="bg-muted px-1 py-0.5 rounded">admin123</code>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            ← Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
}
