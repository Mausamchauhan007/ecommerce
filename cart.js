// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const elements = {
        cartItems: document.querySelector('.cart-items'),
        emptyCart: document.getElementById('empty-cart'),
        subtotal: document.querySelector('.subtotal'),
        shipping: document.querySelector('.shipping'),
        total: document.querySelector('.total-amount'),
        checkoutBtn: document.querySelector('.checkout-btn'),
        cartCount: document.querySelector('.cart-count')
    };

    // Initialize cart state
    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Cart display functions
    function updateCartDisplay() {
        try {
            if (!cart || cart.length === 0) {
                handleEmptyCart();
                return;
            }

            if (elements.emptyCart) elements.emptyCart.style.display = 'none';
            if (elements.checkoutBtn) elements.checkoutBtn.disabled = false;
            
            renderCartItems();
            updateCartCount();
            updateTotals();
        } catch (error) {
            console.error('Error updating cart display:', error);
            showNotification('Error updating cart display', 'error');
        }
    }

    function handleEmptyCart() {
        if (elements.emptyCart) elements.emptyCart.style.display = 'block';
        if (elements.checkoutBtn) elements.checkoutBtn.disabled = true;
        if (elements.cartCount) elements.cartCount.textContent = '0';
        if (elements.cartItems) elements.cartItems.innerHTML = '';
        if (elements.subtotal) elements.subtotal.textContent = '₹0.00';
        if (elements.shipping) elements.shipping.textContent = '₹0.00';
        if (elements.total) elements.total.textContent = '₹0.00';
    }

    function renderCartItems() {
        if (!elements.cartItems) return;
        elements.cartItems.innerHTML = '';

        cart.forEach((item, index) => {
            if (!item.price || isNaN(item.price) || !item.quantity || isNaN(item.quantity)) {
                console.error('Invalid item data:', item);
                return;
            }

            const itemTotal = (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2);
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">₹${parseFloat(item.price).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="10" class="quantity-input" data-index="${index}">
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                    <p class="cart-item-total">Total: ₹${itemTotal}</p>
                </div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            elements.cartItems.appendChild(cartItem);
        });

        attachCartItemListeners();
    }

    function attachCartItemListeners() {
        if (!elements.cartItems) return;

        // Quantity input listeners
        elements.cartItems.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.dataset.index);
                const newQuantity = parseInt(this.value);
                
                if (newQuantity >= 1 && newQuantity <= 10) {
                    updateQuantity(index, newQuantity - cart[index].quantity);
                } else {
                    this.value = cart[index].quantity;
                    showNotification('Quantity must be between 1 and 10', 'error');
                }
            });
        });

        // Plus/Minus button listeners
        elements.cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const change = this.classList.contains('minus') ? -1 : 1;
                updateQuantity(index, change);
            });
        });

        // Remove button listeners
        elements.cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                removeItem(index);
            });
        });
    }

    // Cart operations
    function updateQuantity(index, change) {
        try {
            if (!cart[index]) return;
            
            const newQuantity = parseInt(cart[index].quantity) + change;
            if (newQuantity >= 1 && newQuantity <= 10) {
                cart[index].quantity = newQuantity;
                saveCart();
                updateCartDisplay();
                showNotification('Cart updated');
            } else {
                showNotification('Quantity must be between 1 and 10', 'error');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            showNotification('Error updating quantity', 'error');
        }
    }

    function removeItem(index) {
        try {
            if (!cart[index]) return;
            cart.splice(index, 1);
            saveCart();
            updateCartDisplay();
            showNotification('Item removed from cart');
        } catch (error) {
            console.error('Error removing item:', error);
            showNotification('Error removing item', 'error');
        }
    }

    function updateTotals() {
        try {
            const subtotalAmount = cart.reduce((total, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 0;
                return total + (price * quantity);
            }, 0);

            const shippingAmount = subtotalAmount > 0 ? 50 : 0; // Fixed shipping cost
            const totalAmount = subtotalAmount + shippingAmount;

            if (elements.subtotal) elements.subtotal.textContent = `₹${subtotalAmount.toFixed(2)}`;
            if (elements.shipping) elements.shipping.textContent = `₹${shippingAmount.toFixed(2)}`;
            if (elements.total) elements.total.textContent = `₹${totalAmount.toFixed(2)}`;

            saveCart();
        } catch (error) {
            console.error('Error updating totals:', error);
            showNotification('Error updating cart totals', 'error');
        }
    }

    function updateCartCount() {
        if (!elements.cartCount) return;
        const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        elements.cartCount.textContent = totalItems.toString();
        elements.cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    function saveCart() {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Error saving cart:', error);
            showNotification('Error saving cart data', 'error');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Initialize cart
    updateCartDisplay();
    updateCartCount();

    // Add continue shopping success message
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent immediate navigation
            alert('Purchase successful! Thank you for shopping with us.');
            window.location.href = 'index.html'; // Navigate to home page after alert
        });
    }

    // Checkout handler
    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            // Add checkout logic here
            showNotification('Proceeding to checkout...');
        });
    }
});
