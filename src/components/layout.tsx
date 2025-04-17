import { useState } from 'react';
import { Menu, Search, Globe, MoveIcon as DoveIcon, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useAuth } from '@/components/auth/auth-provider';
import { signOut } from '@/lib/auth';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-wilpf-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-sm">English</span>
              </div>
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-1" />
                <span className="text-sm">Search</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:text-wilpf-coral"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:text-wilpf-coral"
                  onClick={() => setIsAuthOpen(true)}
                >
                  Sign In
                </Button>
              )}
              <Button size="sm" className="bg-wilpf-coral hover:bg-wilpf-accent text-white">
                Join WILPF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-wilpf-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <DoveIcon className="h-8 w-8 text-wilpf-primary" />
                <span className="font-bold text-2xl text-wilpf-primary tracking-tight">WILPF</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                About Us
              </Link>
              <Link to="/work" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                Our Work
              </Link>
              <Link to="/news" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                News & Media
              </Link>
              <Link to="/get-involved" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                Get Involved
              </Link>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white">
                  <div className="flex items-center mb-8">
                    <DoveIcon className="h-6 w-6 text-wilpf-primary mr-2" />
                    <span className="font-bold text-xl text-wilpf-primary">WILPF</span>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    <Link to="/about" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                      About Us
                    </Link>
                    <Link to="/work" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                      Our Work
                    </Link>
                    <Link to="/news" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                      News & Media
                    </Link>
                    <Link to="/get-involved" className="text-wilpf-gray-600 hover:text-wilpf-primary transition-colors">
                      Get Involved
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with gradient background */}
        <div className="gradient-bg py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                Feminist Peace for Environment and Social Justice
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Join the oldest women's peace organization working for peace by non-violent means and promoting social, economic and political justice.
              </p>
              <div className="flex gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button 
                      size="lg" 
                      className="bg-white text-wilpf-primary hover:bg-wilpf-coral hover:text-white"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    className="bg-white text-wilpf-primary hover:bg-wilpf-coral hover:text-white"
                    onClick={() => setIsAuthOpen(true)}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                )}
                <Button size="lg" className="bg-wilpf-coral hover:bg-wilpf-accent text-white">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join WILPF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {children}
      </main>

      <footer className="bg-wilpf-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">About WILPF</h3>
              <p className="text-wilpf-gray-300">
                The Women's International League for Peace and Freedom (WILPF) is an international NGO working to bring together women of different political views and backgrounds to study and make known the causes of war and work for permanent peace.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-wilpf-coral transition-colors">About Us</Link></li>
                <li><Link to="/work" className="hover:text-wilpf-coral transition-colors">Our Work</Link></li>
                <li><Link to="/news" className="hover:text-wilpf-coral transition-colors">News & Media</Link></li>
                <li><Link to="/contact" className="hover:text-wilpf-coral transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Get Involved</h3>
              <ul className="space-y-2">
                <li><Link to="/join" className="hover:text-wilpf-coral transition-colors">Join WILPF</Link></li>
                <li><Link to="/donate" className="hover:text-wilpf-coral transition-colors">Make a Donation</Link></li>
                <li><Link to="/volunteer" className="hover:text-wilpf-coral transition-colors">Volunteer</Link></li>
                <li><Link to="/sections" className="hover:text-wilpf-coral transition-colors">Find a Section</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Stay Updated</h3>
              <p className="text-wilpf-gray-300 mb-4">
                Get the latest updates and news from WILPF.
              </p>
              <Button className="w-full bg-white text-wilpf-primary hover:bg-wilpf-coral hover:text-white transition-colors">
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-wilpf-gray-300">
              © {new Date().getFullYear()} Women's International League for Peace and Freedom. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default Layout;