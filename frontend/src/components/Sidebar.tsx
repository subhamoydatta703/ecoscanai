'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Leaf, Code, FileText, Settings } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Activity },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Green Patterns', href: '/green-patterns', icon: Code },
  ];

  return (
    <aside className="w-64 h-screen bg-charcoal-900 border-r border-emerald-900/30 flex flex-col antialiased">
      <div className="p-6 flex items-center space-x-3 text-emerald-400">
        <Leaf className="w-8 h-8" />
        <span className="text-xl font-bold uppercase tracking-widest text-emerald-50">EcoScan AI</span>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-900/50' 
                  : 'text-gray-400 hover:text-emerald-300 hover:bg-emerald-900/10 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-emerald-900/30">
        <a href="#" onClick={(e) => { e.preventDefault(); alert("Settings page is coming soon!"); }} className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-emerald-300 transition-all rounded-xl border border-transparent">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </a>
      </div>
    </aside>
  );
};
