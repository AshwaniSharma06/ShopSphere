import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import wishlistService from '../services/wishlistService';

const WishlistContext = createContext();

/**
 * Custom hook to access Wishlist Context.
 * @returns {object} Wishlist context state and methods.
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

/**
 * Context Provider component for managing product wishlist state (guest & auth modes).
 */
export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync Wishlist state
  useEffect(() => {
    const syncWishlist = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && token) {
          // Check for guest wishlist to merge
          const localWishlistStr = localStorage.getItem('shopsphere-wishlist');
          if (localWishlistStr) {
            try {
              const localWishlist = JSON.parse(localWishlistStr) || [];
              const validLocal = Array.isArray(localWishlist) ? localWishlist.filter(Boolean) : [];
              if (validLocal.length > 0) {
                const mergePayload = validLocal.map((item) => typeof item === 'string' ? item : item._id).filter(Boolean);
                const data = await wishlistService.mergeWishlist(mergePayload);
                setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter(Boolean) : []);
              } else {
                const data = await wishlistService.getWishlist();
                setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter(Boolean) : []);
              }
            } catch (jsonErr) {
              const data = await wishlistService.getWishlist();
              setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter(Boolean) : []);
            }
            // Clear local guest wishlist
            localStorage.removeItem('shopsphere-wishlist');
          } else {
            const data = await wishlistService.getWishlist();
            setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter(Boolean) : []);
          }
        } else {
          // Guest Wishlist loading
          const localWishlistStr = localStorage.getItem('shopsphere-wishlist');
          if (localWishlistStr) {
            try {
              const localWishlist = JSON.parse(localWishlistStr) || [];
              setWishlist(Array.isArray(localWishlist) ? localWishlist.filter(Boolean) : []);
            } catch (jsonErr) {
              setWishlist([]);
            }
          } else {
            setWishlist([]);
          }
        }
      } catch (error) {
        console.error('Error syncing wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    syncWishlist();
  }, [isAuthenticated, token]);

  const saveGuestWishlist = (newWishlist) => {
    const validWishlist = Array.isArray(newWishlist) ? newWishlist.filter(Boolean) : [];
    setWishlist(validWishlist);
    localStorage.setItem('shopsphere-wishlist', JSON.stringify(validWishlist));
  };

  // Add Item to Wishlist
  const addToWishlist = async (product) => {
    if (!product || !product._id) return;
    try {
      if (isAuthenticated) {
        const data = await wishlistService.addToWishlist(product._id);
        setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter(Boolean) : []);
      } else {
        // Guest mode
        const exists = wishlist.some((item) => {
          if (!item) return false;
          const id = typeof item === 'string' ? item : item._id;
          return id === product._id;
        });
        if (!exists) {
          const newWishlist = [...wishlist, product];
          saveGuestWishlist(newWishlist);
        }
      }
    } catch (error) {
      console.error('Add to wishlist failed:', error);
    }
  };

  // Remove Item from Wishlist
  const removeFromWishlist = async (productId) => {
    if (!productId) return;
    try {
      if (isAuthenticated) {
        const data = await wishlistService.removeFromWishlist(productId);
        setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter(Boolean) : []);
      } else {
        // Guest mode
        const filteredWishlist = wishlist.filter((item) => {
          if (!item) return false;
          const id = typeof item === 'string' ? item : item._id;
          return id !== productId;
        });
        saveGuestWishlist(filteredWishlist);
      }
    } catch (error) {
      console.error('Remove from wishlist failed:', error);
    }
  };

  // Toggle Item in Wishlist
  const toggleWishlist = async (product) => {
    if (!product || !product._id) return;
    try {
      if (isAuthenticated) {
        const data = await wishlistService.toggleWishlist(product._id);
        setWishlist(Array.isArray(data.wishlist) ? data.wishlist.filter(Boolean) : []);
      } else {
        // Guest mode
        const exists = wishlist.some((item) => {
          if (!item) return false;
          const id = typeof item === 'string' ? item : item._id;
          return id === product._id;
        });
        if (exists) {
          await removeFromWishlist(product._id);
        } else {
          await addToWishlist(product);
        }
      }
    } catch (error) {
      console.error('Toggle wishlist failed:', error);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!productId) return false;
    return Array.isArray(wishlist) && wishlist.some((item) => {
      if (!item) return false;
      const id = typeof item === 'string' ? item : item._id;
      return id === productId;
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
