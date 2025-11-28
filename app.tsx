import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import UserOrders from './components/UserOrders';
import { CartItem, Product, Order, Slide } from './types';
import { useProducts } from './contexts/ProductContext';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useSiteConfig } from './contexts/SiteConfigContext';
import { useOrders } from './contexts/OrderContext';
import { useMetrics } from './contexts/MetricsContext';
import { Check, Clock, CreditCard, ShieldCheck, Truck, Package, Star, Heart, MapPin, Phone, ArrowRight } from 'lucide-react';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<'home' | 'admin' | 'profile' | 'orders'>('home');
  
  const { products } = useProducts();
  const { user, isAuthenticated } = useAuth();
  const { backgroundColor } = useTheme();
  const { config } = useSiteConfig();
  const { addOrder } = useOrders();
  const { trackVisit, trackAddToCart } = useMetrics();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({ message: '', isVisible: false });

  useEffect(() => {
    trackVisit();
  }, []);

  const displayCategories = ["All", ...config.categories];

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    trackAddToCart();
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setToast({ message: `Added ${quantity} x ${product.name} to cart`, isVisible: true });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAuthSuccess = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      setToast({ message: "Please sign in to complete your purchase.", isVisible: true });
      setIsAuthModalOpen(true);
      return;
    }
    if (user) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 50 ? 0 : 9.99;
      const total = subtotal + shipping;

      const newOrder: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        date: new Date().toISOString().split('T')[0],
        total: total,
        status: 'processing',
        items: [...cartItems],
        statusHistory: [{ status: 'processing', date: new Date().toISOString(), changedBy: 'System', changedById: 'sys' }]
      };

      addOrder(newOrder);
      setCartItems([]);
      setToast({ message: "Order placed successfully!", isVisible: true });
      setView('orders');
    }
  };

  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSlideAction = (slide: Slide) => {
    if (slide.linkType === 'category' && slide.linkTarget) {
      setActiveCategory(slide.linkTarget);
      scrollToProducts();
    } else if (slide.linkType === 'product' && slide.linkTarget) {
      const product = products.find(p => p.id === slide.linkTarget);
      if (product) {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
      } else {
        scrollToProducts();
      }
    } else {
      scrollToProducts();
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'check': return <Check className="w-8 h-8" />;
      case 'clock': return <Clock className="w-8 h-8" />;
      case 'card': return <CreditCard className="w-8 h-8" />;
      case 'shield': return <ShieldCheck className="w-8 h-8" />;
      case 'truck': return <Truck className="w-8 h-8" />;
      case 'package': return <Package className="w-8 h-8" />;
      case 'star': return <Star className="w-8 h-8" />;
      case 'heart': return <Heart className="w-8 h-8" />;
      case 'map-pin': return <MapPin className="w-8 h-8" />;
      case 'phone': return <Phone className="w-8 h-8" />;
      default: return <Check className="w-8 h-8" />;
    }
  };

  const hasAdminAccess = user?.role === 'admin' || user?.role === 'assistant' || user?.role === 'agent';

  if (view === 'admin') {
     if (hasAdminAccess) {
       return <AdminDashboard onBack={() => setView('home')} />;
     } else {
       setView('home');
     }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500 ease-in-out" style={{ backgroundColor }}>
      <Header 
        cartItems={cartItems} 
        onOpenCart={() => setIsCartOpen(true)} 
        onSearch={setSearchQuery}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setView('admin')}
        onOpenProfile={() => setView('profile')}
        onOpenOrders={() => setView('orders')}
        onGoHome={() => setView('home')}
      />
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <Hero onSlideAction={handleSlideAction} />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24" id="products">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Trending Products</h2>
                  <p className="text-gray-500 mt-1">Handpicked by our expert pharmacists</p>
                </div>
                <span className="text-sm font-medium bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-gray-600 self-start md:self-auto border border-gray-100">
                  {filteredProducts.length} items found
                </span>
              </div>
              <div className="flex overflow-x-auto pb-6 gap-2 mb-4 scrollbar-hide">
                {displayCategories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeCategory === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'}`}>{cat}</button>
                ))}
              </div>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={(p) => handleAddToCart(p, 1)} onQuickView={handleQuickView} />
                  ))}
                </div>
              ) : (
                 <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg font-medium">No products found.</p>
                    <button onClick={() => {setActiveCategory("All"); setSearchQuery("");}} className="mt-4 text-primary-600 hover:text-primary-700 font-medium hover:underline">Clear Filters</button>
                 </div>
              )}
            </section>
            {config.promoBanner?.isVisible && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="rounded-2xl overflow-hidden shadow-lg relative flex flex-col md:flex-row items-center md:items-stretch" style={{ backgroundColor: config.promoBanner.backgroundColor }}>
                  <div className="flex-1 p-8 md:p-12 flex flex-col justify-center text-center md:text-left z-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: config.promoBanner.textColor }}>{config.promoBanner.title}</h2>
                    <p className="text-lg mb-8 opacity-90 max-w-lg mx-auto md:mx-0" style={{ color: config.promoBanner.textColor }}>{config.promoBanner.subtitle}</p>
                    <button onClick={scrollToProducts} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm bg-white text-gray-900 hover:bg-gray-50 hover:scale-105 transition-transform">{config.promoBanner.buttonText} <ArrowRight size={20} className="ml-2" /></button>
                  </div>
                  <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                     <img src={config.promoBanner.image} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
                     <div className="absolute inset-0 md:bg-gradient-to-r" style={{ background: `linear-gradient(to right, ${config.promoBanner.backgroundColor} 0%, transparent 100%)` }}></div>
                  </div>
                </div>
              </section>
            )}
            <section className="bg-white/80 backdrop-blur-md border-y border-gray-100 py-16">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {config.features.map((feature) => (
                      <div key={feature.id} className="p-6 group cursor-pointer">
                        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2">{renderFeatureIcon(feature.icon)}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">{feature.description}</p>
                      </div>
                    ))}
                 </div>
               </div>
            </section>
          </>
        )}
        {view === 'profile' && isAuthenticated && <UserProfile onBack={() => setView('home')} />}
        {view === 'orders' && isAuthenticated && <UserOrders onBack={() => setView('home')} />}
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onCheckout={handleCheckout} />
      <ProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} product={selectedProduct} onAddToCart={handleAddToCart} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      <Toast message={toast.message} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
}
export default App;