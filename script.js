// Cache DOM elements at the start
const elements = {
    cartButtons: document.querySelectorAll('.crdText button'),
    cartCount: document.querySelector('.cart-count'),
    cartOverlay: document.querySelector('.cart-overlay'),
    cartProducts: document.querySelector('.cart-products'),
    totalAmount: document.querySelector('.total-amount'),
    closeCartBtn: document.querySelector('#close-cart'),
    checkoutBtn: document.querySelector('.checkout-btn'),
    hamburger: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),
    cartIcon: document.querySelector('.cart-icon'),
    sections: {
        mainPage: document.querySelector(".main"),
        trend: document.querySelector(".trend"),
        trendSec: document.querySelector("#trendSec"),
        trends: document.querySelector(".trends"),
        about: document.querySelector(".about"),
        contact: document.querySelector(".contact")
    }
};

// Initialize cart state
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Navigation functions
function updateNavColors(activeId) {
    ["blog", "home", "shop", "contact", "about"].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.color = id === activeId ? "#2ecc71" : "black";
        }
    });
}

function hideAllSections() {
    Object.values(elements.sections).forEach(section => {
        if (section) {
            section.style.display = 'none';
        }
    });
}

function showSection(section, display = 'block') {
    if (section) {
        section.style.display = display;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Navigation functions
function blogs() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('men-collection.html') || currentPage.includes('women-collection.html')) {
        window.location.href = 'index.html#blogs';
    } else if (elements.sections.trends) {
        hideAllSections();
        showSection(elements.sections.trends);
        updateNavColors("blog");
    }
}

function abouts() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('men-collection.html') || currentPage.includes('women-collection.html')) {
        window.location.href = 'index.html#about';
    } else if (elements.sections.about) {
        hideAllSections();
        showSection(elements.sections.about);
        updateNavColors("about");
    }
}

function contacts() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('men-collection.html') || currentPage.includes('women-collection.html')) {
        window.location.href = 'index.html#contact';
    } else if (elements.sections.contact) {
        hideAllSections();
        showSection(elements.sections.contact);
        updateNavColors("contact");
    }
}

function homes() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('men-collection.html') || currentPage.includes('women-collection.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    if (elements.sections.mainPage) elements.sections.mainPage.style.display = "flex";
    if (elements.sections.trend) elements.sections.trend.style.display = "block";
    if (elements.sections.trendSec) elements.sections.trendSec.style.display = "block";
    if (elements.sections.trends) elements.sections.trends.style.display = "block";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateNavColors("home");
}

// Cart functions
function addToCart(button) {
    try {
        const cardElement = button.closest('.crd');
        const textElement = button.closest('.crdText');
        
        if (!cardElement || !textElement) {
            throw new Error('Product elements not found');
        }

        // Get price from either price-current span or direct p element
        const priceElement = textElement.querySelector('.price-current') || textElement.querySelector('p.price');
        if (!priceElement) {
            throw new Error('Price element not found');
        }

        const cartProduct = {
            id: Date.now(),
            name: textElement.querySelector('h2').textContent,
            price: parseFloat(priceElement.textContent.replace('₹', '')),
            image: cardElement.querySelector('img').src,
            quantity: 1
        };

        // Check if product already exists in cart
        const existingProductIndex = cartItems.findIndex(item => 
            item.name === cartProduct.name && item.price === cartProduct.price
        );

        if (existingProductIndex !== -1) {
            if (cartItems[existingProductIndex].quantity < 10) {
                cartItems[existingProductIndex].quantity++;
                showNotification('Product quantity updated in cart');
            } else {
                showNotification('Maximum quantity limit reached', 'error');
                return;
            }
        } else {
            cartItems.push(cartProduct);
            showNotification('Product added to cart');
        }

        // Save to localStorage immediately
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Update cart UI
        updateCartDisplay();
        updateCartCount();
        animateCartIcon();

    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding product to cart', 'error');
    }
}

function updateCartDisplay() {
    if (!elements.cartProducts) return;

    elements.cartProducts.innerHTML = '';
    
    if (cartItems.length === 0) {
        elements.cartProducts.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        if (elements.checkoutBtn) elements.checkoutBtn.disabled = true;
        updateCartTotal();
        return;
    }

    if (elements.checkoutBtn) elements.checkoutBtn.disabled = false;

    cartItems.forEach((item, index) => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                </div>
                <p class="cart-item-total">Total: ₹${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button class="remove-item" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        elements.cartProducts.appendChild(cartItemElement);
    });

    attachCartItemListeners();
    updateCartTotal();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    
    // Add bounce animation
    cartCount.classList.remove('bounce');
    void cartCount.offsetWidth; // Trigger reflow
    cartCount.classList.add('bounce');
}

function updateCartTotal() {
    if (!elements.totalAmount) return;
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    elements.totalAmount.textContent = `₹${total.toFixed(2)}`;
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

function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('bounce');
        setTimeout(() => {
            cartIcon.classList.remove('bounce');
        }, 300);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    loadCartFromLocalStorage();
    updateCartDisplay();
    updateCartCount();

    // Navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const id = this.id;
            const href = this.getAttribute('href');
            const currentPage = window.location.pathname;
            
            // Don't prevent default for shop dropdown
            if (id === 'shop') return;

            // Handle onclick attributes for collection pages
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                e.preventDefault();
                switch(onclickAttr) {
                    case 'blogs()':
                        blogs();
                        break;
                    case 'abouts()':
                        abouts();
                        break;
                    case 'contacts()':
                        contacts();
                        break;
                }
                return;
            }

            // Handle href navigation
            if (href === 'index.html') {
                if (currentPage.includes('index.html')) {
                    e.preventDefault();
                    homes();
                }
                // else let the default navigation happen
                return;
            }

            // Handle section navigation on home page
            if (currentPage.includes('index.html')) {
                e.preventDefault();
                switch(id) {
                    case 'home':
                        homes();
                        break;
                    case 'blog':
                        blogs();
                        break;
                    case 'about':
                        abouts();
                        break;
                    case 'contact':
                        contacts();
                        break;
                }
            }
        });
    });

    // Add click handler for brand logo
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // Add click handler for home navigation
    const homeLink = document.querySelector('a[href="index.html"]');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            const currentPage = window.location.pathname;
            if (!currentPage.includes('index.html')) {
                // We're on a different page, let the default navigation happen
                return;
            }
            // We're on the home page, prevent default and use smooth scroll
            e.preventDefault();
            homes();
        });
    }

    // Cart icon click handler with hamburger menu support
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            // Close hamburger menu if open
            if (elements.hamburger && elements.hamburger.classList.contains('active')) {
                elements.hamburger.classList.remove('active');
                elements.navMenu.classList.remove('active');
            }
            const cartOverlay = document.querySelector('.cart-overlay');
            if (cartOverlay) {
                cartOverlay.style.display = 'flex';
                updateCartDisplay();
            }
        });
    }

    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Explore button
    const exploreBtn = document.querySelector('.mainText button');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            const trendSection = document.querySelector('.trend');
            if (trendSection) {
                trendSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Collection buttons
    const mensBtn = document.querySelector('.collection-btn-container.men button');
    if (mensBtn) {
        mensBtn.addEventListener('click', () => {
            window.location.href = 'men-collection.html';
        });
    }

    const womensBtn = document.querySelector('.collection-btn-container.women button');
    if (womensBtn) {
        womensBtn.addEventListener('click', () => {
            window.location.href = 'women-collection.html';
        });
    }

    // Add to cart buttons with improved error handling
    document.querySelectorAll('.crdText button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                addToCart(this);
                const cartOverlay = document.querySelector('.cart-overlay');
                if (cartOverlay) {
                    cartOverlay.style.display = 'flex';
                    updateCartDisplay();
                }
            } catch (error) {
                console.error('Error in cart operation:', error);
                showNotification('Failed to add product to cart', 'error');
            }
        });
    });

    // Close cart
    const closeCartBtn = document.querySelector('#close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }

    // Continue shopping
    const continueShoppingBtn = document.querySelector('.continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            alert('Purchase successful! Thank you for shopping with us.');
            closeCart();
            window.location.href = 'cart.html';
        });
    }

    // Checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            window.location.href = 'cart.html';
        });
    }

    // If we're on cart.html, initialize cart page specific elements
    if (window.location.pathname.includes('cart.html')) {
        initializeCartPage();
    }

    // Initialize Firebase Auth
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAh7b6iJUGXIV8eBbbOtAOT1Cgyt_p2f6Q",
        authDomain: "anicosmos-653e0.firebaseapp.com",
        projectId: "anicosmos-653e0",
        storageBucket: "anicosmos-653e0.firebasestorage.app",
        messagingSenderId: "846778707154",
        appId: "1:846778707154:web:b424c516b0d8d27dd5910b",
        measurementId: "G-M699RP2N9Q"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Auth state observer
    auth.onAuthStateChanged((user) => {
        const profileSection = document.getElementById('profileSection');
        const loginBtn = document.getElementById('loginBtn');
        const userEmail = document.getElementById('userEmail');

        if (user) {
            // User is signed in
            profileSection.style.display = 'block';
            loginBtn.style.display = 'none';
            userEmail.textContent = user.email;
        } else {
            // User is signed out
            profileSection.style.display = 'none';
            loginBtn.style.display = 'block';
        }
    });

    // Logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Error signing out:", error);
            alert('Error signing out. Please try again.');
        }
    });

    // View Profile functionality
    document.getElementById('viewProfile')?.addEventListener('click', (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            // You can implement a modal or redirect to a profile page
            alert(`Email: ${user.email}\nUID: ${user.uid}`);
        }
    });
});

function initializeCartPage() {
    updateCartDisplay();
    
    // Close cart button (for cart.html)
    const closeCartBtn = document.querySelector('#close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            window.history.back(); // Go back to previous page
        });
    }

    // Continue shopping button (for cart.html)
    const continueShoppingBtn = document.querySelector('.continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.history.back(); // Go back to previous page
        });
    }

    // Checkout button (for cart.html)
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cartItems.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            alert('Proceeding to checkout...');
            cartItems = [];
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCartDisplay();
            updateCartCount();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
}

// Utility functions
function closeCart() {
    if (elements.cartOverlay) {
        elements.cartOverlay.style.display = 'none';
    }
}

function loadCartFromLocalStorage() {
    try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            updateCartDisplay();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        cartItems = [];
    }
}

function attachCartItemListeners() {
    // Quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const change = this.classList.contains('minus') ? -1 : 1;
            
            if (cartItems[index]) {
                const newQuantity = cartItems[index].quantity + change;
                if (newQuantity >= 1 && newQuantity <= 10) {
                    cartItems[index].quantity = newQuantity;
                    localStorage.setItem('cartItems', JSON.stringify(cartItems));
                    updateCartDisplay();
                    updateCartCount();
                }
            }
        });
    });

    // Remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (cartItems[index]) {
                cartItems.splice(index, 1);
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                updateCartDisplay();
                updateCartCount();
                showNotification('Item removed from cart');
            }
        });
    });
}
