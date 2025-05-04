import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-green-700">Kacha Bazar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/') ? 'text-green-700' : 'text-gray-700 hover:text-green-600'
              )}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/products') ? 'text-green-700' : 'text-gray-700 hover:text-green-600'
              )}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/about') ? 'text-green-700' : 'text-gray-700 hover:text-green-600'
              )}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/contact') ? 'text-green-700' : 'text-gray-700 hover:text-green-600'
              )}
            >
              Contact
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="w-full cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="w-full cursor-pointer">
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                <Link to="/login">Login</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <Link
              to="/"
              className={cn(
                'block py-2 text-base font-medium',
                isActive('/') ? 'text-green-700' : 'text-gray-700'
              )}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={cn(
                'block py-2 text-base font-medium',
                isActive('/products') ? 'text-green-700' : 'text-gray-700'
              )}
              onClick={closeMobileMenu}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={cn(
                'block py-2 text-base font-medium',
                isActive('/about') ? 'text-green-700' : 'text-gray-700'
              )}
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={cn(
                'block py-2 text-base font-medium',
                isActive('/contact') ? 'text-green-700' : 'text-gray-700'
              )}
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};