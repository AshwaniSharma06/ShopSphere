import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';
import { calcDiscountedPrice } from '../utils/format';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync Cart state
  useEffect(() => {
    const syncCart = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && token) {
          // Check for local storage cart to merge
          const localCartStr = localStorage.getItem('shopsphere-cart');
          if (localCartStr) {
            try {
              const localCart = JSON.parse(localCartStr) || [];
              const validLocal = Array.isArray(localCart) ? localCart.filter(item => item && item.product) : [];
              if (validLocal.length > 0) {
                // Format for backend merging: array of { product: id, quantity }
                const mergePayload = validLocal.map((item) => {
                  const pid = typeof item.product === 'string' ? item.product : item.product?._id;
                  return pid ? { product: pid, quantity: item.quantity } : null;
                }).filter(Boolean);
                const data = await cartService.mergeCart(mergePayload);
                setCart(Array.isArray(data.cart) ? data.cart.filter(item => item && item.product) : []);
              } else {
                const data = await cartService.getCart();
                setCart(Array.isArray(data.cart) ? data.cart.filter(item => item && item.product) : []);
              }
            } catch (jsonErr) {
              const data = await cartService.getCart();
              setCart(Array.isArray(data.cart) ? data.cart.filter(item => item && item.product) : []);
            }
            // Clear local guest cart
            localStorage.removeItem('shopsphere-cart');
          } else {
            const data = await cartService.getCart();
            setCart(Array.isArray(data.cart) ? data.cart.filter(item => item && item.product) : []);
          }
        } else {
          // Guest Cart loading from localStorage
          const localCartStr = localStorage.getItem('shopsphere-cart');
          if (localCartStr) {
            try {
              const localCart = JSON.parse(localCartStr) || [];
              setCart(Array.isArray(localCart) ? localCart.filter(item => item && item.product) : []);
            } catch (jsonErr) {
              setCart([]);
            }
          } else {
            setCart([]);
          }
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
      } finally {
        setLoading(false);
      }
    };

    syncCart();
  }, [isAuthenticated, token]);

  // Save guest cart to localStorage when not authenticated
  const saveGuestCart = (newCart) => {
    const validCart = Array.isArray(newCart) ? newCart.filter(item => item && item.product) : [];
    setCart(validCart);
    localStorage.setItem('shopsphere-cart', JSON.stringify(validCart));
  };

  // Add Item to Cart
  const addToCart = async (product, quantity = 1) => {
    if (!product || !product._id) return;
    try {
      if (isAuthenticated) {
        const data = await cartService.addToCart(product._id, quantity);
        setCart(Array.isArray(data.cart) ? data.cart.filter(item => item && item.product) : []);
      } else {
        // Guest mode
        const existingItemIdx = cart.findIndex((item) => {
          if (!item || !item.product) return false;
          const id = typeof item.product === 'string' ? item.product : item.product._id;
          return id === product._id;
        });

        let newCart = [...cart];
        if (existingItemIdx > -1) {
          const newQty = newCart[existingItemIdx].quantity + quantity;
          if (newQty > product.stock) {
            throw new Error(`Cannot add more items. Maximum stock available is ${product.stock}`);
          }
          newCart[existingItemIdx].quantity = newQty;
        } else {
          if (quantity > product.stock) {
            throw new Error(`Cannot add more items. Maximum stock available is ${product.stock}`);
          }
          newCart.push({
            _id: product._id, // match structure of database cart item
            product,
            quantity,
          });
        }
        saveGuestCart(newCart);
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
      throw error;
    }
  };

  // Update Item Quantity
  const updateQuantity = async (productId, quantity) => {
    if (!productId) return;
    try {
      if (quantity < 1) return;
      if (isAuthenticated) {
        const data = await cartService.updateQuantity(productId, quantity);
        setCart(Array.isArray(data.cart) ? data.cart.filter(item => item && item.product) : []);
      } else {
        // Guest mode
        const updatedCart = cart.map((item) => {
          if (!item || !item.product) return item;
          const id = typeof item.product === 'string' ? item.product : item.product._id;
          if (id === productId) {
            if (quantity > (item.product.stock || 0)) {
              throw new Error(`Maximum available stock is ${item.product.stock}`);
            }
            return { ...item, quantity };
          }
          return item;
        });
        saveGuestCart(updatedCart);
      }
    } catch (error) {
      console.error('Update quantity failed:', error);
      throw error;
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (productId) => {
    if (!productId) return;
    try {
      if (isAuthenticated) {
        const data = await cartService.removeFromCart(productId);
        setCart(Array.isArray(data.cart) ? data.cart.filter(item => item && item.product) : []);
      } else {
        // Guest mode
        const filteredCart = cart.filter((item) => {
          if (!item || !item.product) return false;
          const id = typeof item.product === 'string' ? item.product : item.product._id;
          return id !== productId;
        });
        saveGuestCart(filteredCart);
      }
    } catch (error) {
      console.error('Remove from cart failed:', error);
    }
  };

  // Clear Cart
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await cartService.clearCart();
        setCart([]);
      } else {
        // Guest mode
        saveGuestCart([]);
      }
    } catch (error) {
      console.error('Clear cart failed:', error);
    }
  };

  // Totals calculations
  const cartCount = cart.reduce((count, item) => {
    if (!item) return count;
    return count + (item.quantity || 0);
  }, 0);
  
  const cartTotal = cart.reduce((total, item) => {
    if (!item || !item.product) return total;
    const price = calcDiscountedPrice(item.product.price, item.product.discountPercent);
    return total + price * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
