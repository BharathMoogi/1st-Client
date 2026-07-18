import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, doc, getDocs, getDoc, addDoc, deleteDoc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, DocumentData
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
} from 'firebase/auth';
import { db, auth } from './firebase';

// ==========================================
// 1. AUTHENTICATION HOOKS
// ==========================================

/** Returns the current auth session/user */
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () =>
      new Promise((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
          unsub();
          resolve(user);
        });
      }),
    staleTime: Infinity,
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session'] }),
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session'] }),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => signOut(auth),
    onSuccess: () => queryClient.setQueryData(['session'], null),
  });
}

// ==========================================
// 2. PRODUCTS & CATEGORIES HOOKS
// ==========================================

export function useProductsQuery(category?: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      let q = category && category !== 'All'
        ? query(collection(db, 'products'), where('category', '==', category), orderBy('name'))
        : query(collection(db, 'products'), orderBy('name'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useProductDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['product-detail', id],
    enabled: !!id,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'products', id));
      if (!snap.exists()) throw new Error('Product not found');
      return { id: snap.id, ...snap.data() };
    },
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'categories'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

// ==========================================
// 3. WISHLIST HOOKS (REALTIME)
// ==========================================

export function useWishlistQuery() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'wishlist'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: DocumentData) => {
      const ref = await addDoc(collection(db, 'wishlist'), { ...product, addedAt: serverTimestamp() });
      return ref.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useRemoveFromWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoc(doc(db, 'wishlist', id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

/** Real-time wishlist listener — call inside a component */
export function useWishlistRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'wishlist'), () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    });
    return () => unsub();
  }, [queryClient]);
}

// ==========================================
// 4. CART HOOKS
// ==========================================

export function useCartQuery() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'cart'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useUpdateCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await updateDoc(doc(db, 'cart', id), { quantity });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoc(doc(db, 'cart', id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// ==========================================
// 5. ORDERS HOOKS (REALTIME STATUS)
// ==========================================

export function useOrdersQuery() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: DocumentData) => {
      const ref = await addDoc(collection(db, 'orders'), { ...orderData, createdAt: serverTimestamp(), status: 'Pending' });
      return ref.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

/** Real-time listener for a single order's status (Pending → Shipped → Delivered) */
export function useOrderRealtime(orderId: string, onStatusChange?: (status: string) => void) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      const data = snap.data();
      if (onStatusChange && data?.status) onStatusChange(data.status);
    });
    return () => unsub();
  }, [orderId, queryClient, onStatusChange]);
}

// ==========================================
// 6. REVIEWS HOOKS
// ==========================================

export function useReviewsQuery(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    enabled: !!productId,
    queryFn: async () => {
      const q = query(collection(db, 'reviews'), where('product_id', '==', productId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: { product_id: string; rating: number; comment: string; name?: string }) => {
      const ref = await addDoc(collection(db, 'reviews'), { ...review, createdAt: serverTimestamp(), verified: false });
      return ref.id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
    },
  });
}

// ==========================================
// 7. NOTIFICATIONS HOOKS (REALTIME)
// ==========================================

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useDismissNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoc(doc(db, 'notifications', id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

/** Real-time listener — pushes new notifications live */
export function useNotificationsRealtime(onNewAlert?: (data: DocumentData) => void) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      snap.docChanges().forEach((change) => {
        if (change.type === 'added' && onNewAlert) {
          onNewAlert({ id: change.doc.id, ...change.doc.data() });
        }
      });
    });
    return () => unsub();
  }, [queryClient, onNewAlert]);
}

// ==========================================
// 8. ADDRESSES HOOKS
// ==========================================

export function useAddressesQuery() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'addresses'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: DocumentData) => {
      const ref = await addDoc(collection(db, 'addresses'), address);
      return ref.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

// ==========================================
// 9. COUPONS HOOKS
// ==========================================

export function useCouponsQuery() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'coupons'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useValidateCouponQuery(code: string) {
  return useQuery({
    queryKey: ['validate-coupon', code],
    enabled: !!code,
    queryFn: async () => {
      const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error('Invalid coupon code');
      const data = snap.docs[0].data();
      if (data.status !== 'Active') throw new Error('Coupon has expired');
      return { id: snap.docs[0].id, ...data, valid: true };
    },
  });
}
