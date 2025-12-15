import { Shield, Lock } from 'lucide-react';

export function PrivacyFooter() {
  return (
    <footer className="mt-12 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Seus dados são coletados de forma anônima</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>Nenhuma informação identificável é armazenada</span>
        </div>
      </div>
    </footer>
  );
}
