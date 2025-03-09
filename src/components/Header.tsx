
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Practice', path: '/interview' },
    { name: 'Feedback', path: '/feedback' },
  ];
  
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300',
        isScrolled ? 'glass shadow-md py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight">InterviewGenius</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-foreground/80 hover:text-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="glass" size="sm">
            Sign In
          </Button>
        </div>
        
        <button
          className="block md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 glass-dark animate-fade-in md:hidden">
          <nav className="flex flex-col p-6 space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-lg font-medium transition-colors',
                  isActive(item.path) ? 'text-primary' : 'text-foreground/90'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button variant="primary" fullWidth>
              Sign In
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
