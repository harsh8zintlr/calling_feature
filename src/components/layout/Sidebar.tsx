import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Phone,
  PhoneCall,
  Users,
  UserPlus,
  Contact,
  Settings,
  PhoneOutgoing,
  Activity,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Call Logs', href: '/calls', icon: Phone },
  { name: 'Live Calls', href: '/live', icon: Activity },
  { name: 'Click to Call', href: '/dial', icon: PhoneOutgoing },
  { name: 'Team Members', href: '/members', icon: Users },
  { name: 'Call Groups', href: '/groups', icon: UserPlus },
  { name: 'Contacts', href: '/contacts', icon: Contact },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Headphones className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">CallerDesk</h1>
            <p className="text-xs text-muted-foreground">Call Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {item.name}
                {item.name === 'Live Calls' && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-[10px] font-bold text-success call-pulse">
                    •
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Need Help?</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Contact CallerDesk support for assistance
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
