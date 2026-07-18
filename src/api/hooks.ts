import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';



// ==========================================
// 1. AUTHENTICATION API HOOKS
// ==========================================
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password?: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'default-password-123',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    }
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password?: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'default-password-123',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    }
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['session'], null);
    }
  });
}

// ==========================================
// 2. PRODUCTS & CATEGORIES HOOKS
// ==========================================
export function useProductsQuery(category?: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      let query = supabase.from('products').select('*');
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
}

export function useProductDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['product-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data || [];
    }
  });
}

// ==========================================
// 3. WISHLIST HOOKS (REALTIME SYNC)
// ==========================================
export function useWishlistQuery() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data, error } = await supabase.from('wishlist').select('*');
      if (error) return [];
      return data;
    }
  });
}

export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: any) => {
      const { data, error } = await supabase.from('wishlist').insert([product]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });
}

export function useRemoveFromWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wishlist').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });
}

// Real-time Wishlist subscription hook
export function useWishlistRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('wishlist-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist' }, () => {
        // Invalidate wishlist query to trigger fresh react-query refetch
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// ==========================================
// 4. CART HOOKS
// ==========================================
export function useCartQuery() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cart').select('*');
      if (error) return [];
      return data;
    }
  });
}

export function useUpdateCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase.from('cart').update({ quantity }).eq('id', id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cart').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

// ==========================================
// 5. ORDERS HOOKS (REALTIME STATUS TIMELINE)
// ==========================================
export function useOrdersQuery() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) return [];
      return data;
    }
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase.from('orders').insert([orderData]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}

// Real-time tracker for individual order status (Pending -> Shipped -> Delivered)
export function useOrderRealtime(orderId: string, onStatusChange?: (newStatus: string) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload: any) => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          if (onStatusChange && payload.new && payload.new.status) {
            onStatusChange(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient, onStatusChange]);
}

// ==========================================
// 6. REVIEWS HOOKS
// ==========================================
export function useReviewsQuery(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId);
      if (error) return [];
      return data;
    }
  });
}

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData: { product_id: string; rating: number; comment: string; name?: string }) => {
      const { data, error } = await supabase.from('reviews').insert([reviewData]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      if (data && data[0]) {
        queryClient.invalidateQueries({ queryKey: ['reviews', data[0].product_id] });
      }
    }
  });
}

// ==========================================
// 7. NOTIFICATIONS HOOKS (REALTIME INCOMING)
// ==========================================
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*');
      if (error) return [];
      return data;
    }
  });
}

export function useDismissNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useNotificationsRealtime(onNewAlert?: (payload: any) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload: any) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          if (onNewAlert) {
            onNewAlert(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onNewAlert]);
}

// ==========================================
// 8. ADDRESSES & COUPONS HOOKS
// ==========================================
export function useAddressesQuery() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('addresses').select('*');
      if (error) return [];
      return data;
    }
  });
}

export function useCouponsQuery() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('coupons').select('*');
      if (error) return [];
      return data;
    }
  });
}

export function useValidateCouponQuery(code: string) {
  return useQuery({
    queryKey: ['validate-coupon', code],
    enabled: !!code,
    queryFn: async () => {
      const { data, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).single();
      if (error || !data) {
        throw new Error('Invalid coupon promo code');
      }
      return { ...data, valid: true };
    }
  });
}
