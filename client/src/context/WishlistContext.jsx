import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import wishlistService from '../services/wishlistService';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

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
            const localWishlist = JSON.parse(localWishlistStr);
            if (localWishlist.length > 0) {
              const mergePayload = localWishlist.map((item) => item._id);
              const data = await wishlistService.mergeWishlist(mergePayload);
              setWishlist(data.wishlist || []);
            } else {
              const data = await wishlistService.getWishlist();
              setWishlist(data.wishlist || []);
            }
            // Clear local guest wishlist
            localStorage.removeItem('shopsphere-wishlist');
          } else {
            const data = await wishlistService.getWishlist();
            setWishlist(data.wishlist || []);
          }
        } else {
          // Guest Wishlist loading
          const localWishlistStr = localStorage.getItem('shopsphere-wishlist');
          if (localWishlistStr) {
            setWishlist(JSON.parse(localWishlistStr));
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
    setWishlist(newWishlist);
    localStorage.setItem('shopsphere-wishlist', JSON.stringify(newWishlist));
  };

  // Add Item to Wishlist
  const addToWishlist = async (product) => {
    try {
      if (isAuthenticated) {
        const data = await wishlistService.addToWishlist(product._id);
        setWishlist(data.wishlist || []);
      } else {
        // Guest mode
        const exists = wishlist.some((item) => item._id === product._id);
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
    try {
      if (isAuthenticated) {
        const data = await wishlistService.removeFromWishlist(productId);
        setWishlist(data.wishlist || []);
      } else {
        // Guest mode
        const filteredWishlist = wishlist.filter((item) => item._id !== productId);
        saveGuestWishlist(filteredWishlist);
      }
    } catch (error) {
      console.error('Remove from wishlist failed:', error);
    }
  };

  // Toggle Item in Wishlist
  const toggleWishlist = async (product) => {
    try {
      if (isAuthenticated) {
        const data = await wishlistService.toggleWishlist(product._id);
        setWishlist(data.wishlist || []);
      } else {
        // Guest mode
        const exists = wishlist.some((item) => item._id === product._id);
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
    return wishlist.some((item) => item._id === productId);
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
