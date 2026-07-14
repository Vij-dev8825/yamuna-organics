import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProductImage } from '../utils/productImages';
import { loadRazorpay } from '../utils/loadRazorpay';
import ChakkiWheel from '../components/ChakkiWheel';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { isLoggedIn, token, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'razorpay'
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);

  useEffect(() => {
    api.getProducts().then((d) => setProducts(d.products));
    api.getConfig().then((d) => setRazorpayEnabled(!!d.razorpayEnabled)).catch(() => {});
  }, []);

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const sizeInfo = product.sizes.find((s) => s.label === item.size);
        return { ...item, product, sizeInfo };
      })
      .filter(Boolean);
  }, [items, products]);

  const subtotal = lines.reduce((sum, l) => sum + l.sizeInfo.price * l.quantity, 0);
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 60;
  const total = subtotal + shipping;

  function validAddress() {
    return address.line1 && address.city && address.state && address.pincode && address.phone;
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!validAddress()) {
      showToast('Please fill in your complete delivery address.', 'error');
      return;
    }
    setPlacing(true);
    const orderItems = lines.map((l) => ({ productId: l.productId, size: l.size, quantity: l.quantity }));
    try {
      if (paymentMethod === 'razorpay') {
        await payWithRazorpay(orderItems);
      } else {
        await api.placeOrder(token, { items: orderItems, address, paymentMethod: 'cod' });
        clearCart();
        showToast('Order placed! We will call to confirm delivery.');
        navigate('/profile');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPlacing(false);
    }
  }

  async function payWithRazorpay(orderItems) {
    const rzpOrder = await api.createRazorpayOrder(token, orderItems);
    await loadRazorpay();

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.razorpayOrderId,
        name: 'Yamuna Organic',
        description: `Order · ${orderItems.length} item(s)`,
        prefill: {
          name: user?.name || '',
          contact: address.phone,
        },
        theme: { color: '#c9962c' },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            reject(new Error('Payment cancelled.'));
          },
        },
        handler: async (response) => {
          try {
            await api.verifyRazorpayPayment(token, { items: orderItems, address, ...response });
            clearCart();
            showToast('Payment successful — order placed!');
            navigate('/profile');
            resolve();
          } catch (err) {
            showToast(err.message, 'error');
            reject(err);
          }
        },
      });
      rzp.on('payment.failed', () => {
        setPlacing(false);
        reject(new Error('Payment failed. Please try again or choose Cash on Delivery.'));
      });
      rzp.open();
    });
  }

  if (!products.length && items.length) {
    return (
      <div className="center" style={{ padding: '120px 0' }}>
        <ChakkiWheel size={56} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container">
        <div className="empty-state">
          <ChakkiWheel size={70} spin={false} />
          <h2>Your cart is empty</h2>
          <p className="muted">Add some cold-pressed goodness to get started.</p>
          <Link to="/shop" className="btn btn-gold">Browse the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="breadcrumb">Home / Cart</div>
      <h2>Your Cart</h2>

      <div className="cart-layout">
        <div>
          {lines.map((l) => (
            <div className="cart-line" key={`${l.productId}-${l.size}`}>
              <img src={getProductImage(l.product.image)} alt={l.product.name} />
              <div className="cart-line-details">
                <h3 style={{ marginBottom: 4 }}>{l.product.name}</h3>
                <span className="muted" style={{ fontSize: '0.85rem' }}>Size: {l.size}</span>
                <div>
                  <button
                    className="btn-sm btn-ghost btn"
                    style={{ marginTop: 8 }}
                    onClick={() => removeItem(l.productId, l.size)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQuantity(l.productId, l.size, l.quantity - 1)}>−</button>
                <span>{l.quantity}</span>
                <button onClick={() => updateQuantity(l.productId, l.size, l.quantity + 1)}>+</button>
              </div>
              <div className="price" style={{ fontFamily: 'var(--font-mono)' }}>
                ₹{l.sizeInfo.price * l.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="summary-row">
            <span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
          </div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>

          {!showAddressForm ? (
            <button
              className="btn btn-gold btn-block"
              style={{ marginTop: 18 }}
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login', { state: { from: '/cart' } });
                  return;
                }
                setShowAddressForm(true);
              }}
            >
              {isLoggedIn ? 'Proceed to checkout' : 'Log in to checkout'}
            </button>
          ) : (
            <form onSubmit={handlePlaceOrder} style={{ marginTop: 18 }}>
              <div className="checkout-step">
                <span className="checkout-step-num">1</span>
                <h4>Delivery Address</h4>
              </div>
              <div className="field">
                <label>Address line</label>
                <input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              </div>
              <div className="field">
                <label>City</label>
                <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              </div>
              <div className="field">
                <label>State</label>
                <input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              </div>
              <div className="field">
                <label>Pincode</label>
                <input required value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              </div>

              <div className="checkout-step" style={{ marginTop: 22 }}>
                <span className="checkout-step-num">2</span>
                <h4>Payment Method</h4>
              </div>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <span className="filter-radio" aria-hidden="true" />
                  <span className="payment-option-body">
                    <b>Cash on Delivery</b>
                    <span className="muted">Pay in cash when your order arrives</span>
                  </span>
                </label>
                <label className={`payment-option ${paymentMethod === 'razorpay' ? 'active' : ''} ${!razorpayEnabled ? 'disabled' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'razorpay'}
                    disabled={!razorpayEnabled}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <span className="filter-radio" aria-hidden="true" />
                  <span className="payment-option-body">
                    <b>Pay Online</b>
                    <span className="muted">
                      {razorpayEnabled
                        ? 'Cards, UPI, NetBanking & wallets — secured by Razorpay'
                        : 'Currently unavailable — please use Cash on Delivery'}
                    </span>
                  </span>
                </label>
              </div>

              <button className="btn btn-gold btn-block" style={{ marginTop: 18 }} disabled={placing}>
                {placing
                  ? 'Processing…'
                  : paymentMethod === 'razorpay'
                    ? `Pay ₹${total} securely`
                    : `Place order · Cash on Delivery · ₹${total}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
