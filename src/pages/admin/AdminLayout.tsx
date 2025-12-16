import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Lightbulb, Image, Scale, Download, Menu, X, LogOut, FileText } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/tcle', icon: FileText, label: 'TCLE' },
  { to: '/admin/aut', icon: Lightbulb, label: 'Estímulos AUT' },
  { to: '/admin/fiq', icon: Image, label: 'Estímulos FIQ' },
  { to: '/admin/dilemas', icon: Scale, label: 'Dilemas Éticos' },
  { to: '/admin/exportar', icon: Download, label: 'Exportar Dados' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => { sessionStorage.removeItem('admin_authenticated'); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn('fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:transform-none', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <span className="font-heading font-semibold text-foreground">Painel Admin</span>
            <button className="lg:hidden p-2 hover:bg-muted rounded-lg" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (<NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('admin-nav-item', isActive && 'admin-nav-item-active')} onClick={() => setSidebarOpen(false)}><item.icon className="h-5 w-5" />{item.label}</NavLink>))}
          </nav>
          <div className="p-4 border-t border-border"><button onClick={handleLogout} className="admin-nav-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-5 w-5" />Sair</button></div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 lg:px-6">
          <button className="lg:hidden p-2 hover:bg-muted rounded-lg mr-4" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <h1 className="font-heading text-lg font-semibold text-foreground">Gerenciamento do Experimento</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
