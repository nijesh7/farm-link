import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/currency';

export default function SavedItems() {
  const { savedProducts, removeSavedProduct } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const addSavedProductToCart = (product) => {
    if (product.quantity <= 0) {
      showToast(`${product.name} is currently out of stock.`, 'warning');
      return;
    }
    addToCart(product);
    showToast(`${product.name} added to your cart.`, 'success');
  };

  const removeProduct = (product) => {
    removeSavedProduct(product.id);
    showToast(`${product.name} removed from saved items.`, 'info');
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '2.4rem', marginBottom: '0.5rem' }}>
              <Heart size={34} color="var(--danger)" fill="currentColor" /> Saved Fresh Picks
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Keep your favourite local produce ready for your next order.</p>
          </div>
          <Link to="/products" className="btn btn-outline">Browse Marketplace</Link>
        </div>

        {savedProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Heart size={52} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No saved produce yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Tap the heart on any item you want to remember.</p>
            <Link to="/products" className="btn btn-primary">Discover Fresh Produce</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: '1.25rem' }}>
            {savedProducts.map((product) => (
              <article className="card" key={product.id} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '165px', objectFit: 'cover' }} />
                <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>By {product.farmerName}</span>
                  <h2 style={{ fontSize: '1.15rem', margin: '0.35rem 0' }}>{product.name}</h2>
                  <strong style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{formatINR(product.price)} / {product.unit}</strong>
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={product.quantity <= 0} onClick={() => addSavedProductToCart(product)}>
                      <ShoppingCart size={16} /> Add to cart
                    </button>
                    <button className="btn btn-outline btn-sm" aria-label={`Remove ${product.name}`} title="Remove saved item" onClick={() => removeProduct(product)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
