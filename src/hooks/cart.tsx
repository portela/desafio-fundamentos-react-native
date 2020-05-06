import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Product } from '../pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarket:products');
      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify([products]),
      );
    }
    updateStorage();
  }, [products]);

  const addToCart = useCallback(
    product => {
      // Add product to cart
      const productIndex = products.findIndex(p => p.id === product.id);

      if (productIndex < 0) {
        const productWithQnt = { ...product, quantity: 1 };
        setProducts([...products, productWithQnt]);
        return;
      }

      increment(product.id);
    },
    [products, increment],
  );

  const increment = useCallback(
    id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(p => p.id === id);

      if (productIndex < 0) {
        return;
      }

      const product = products[productIndex];

      const updatedProduct: Product = {
        ...product,
        quantity: products[productIndex].quantity + 1,
      };

      const newProducts = products.slice();
      newProducts.splice(productIndex, 1, updatedProduct);
      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(p => p.id === id);

      if (productIndex < 0) {
        return;
      }

      const product = products[productIndex];
      const newProducts = products.slice();

      if (product.quantity === 1) {
        newProducts.splice(productIndex, 1);
        setProducts(newProducts);
        return;
      }

      const updatedProduct = {
        ...product,
        quantity: product.quantity - 1,
      };
      newProducts.splice(productIndex, 1, updatedProduct);
      setProducts(newProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
