document.addEventListener('DOMContentLoaded', () => {

    // --- User Authentication State ---
    let users = [];
    let currentUser = null;

    // --- DOM Elements ---
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const signInBtns = document.querySelectorAll('.sign-in-btn');
    const logoutBtns = document.querySelectorAll('.logout-btn');
    const authOverlay = document.querySelector('.auth-overlay');
    const closeAuthBtn = document.querySelector('.close-auth-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const orderNowBtn = document.querySelector('.order-now-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const emailInput = document.getElementById('email');
    const accountLink = document.querySelector('.account-link');

    // --- UI Update Functions ---
    function updateUIForLogin() {
        signInBtns.forEach(btn => btn.classList.add('hidden'));
        logoutBtns.forEach(btn => btn.classList.remove('hidden'));
    }

    function updateUIForLogout() {
        signInBtns.forEach(btn => btn.classList.remove('hidden'));
        logoutBtns.forEach(btn => btn.classList.add('hidden'));
    }

    // --- Local Storage Functions ---
    function saveUsersToStorage() {
        localStorage.setItem('foodieUsers', JSON.stringify(users));
    }

    function loadUsersFromStorage() {
        const storedUsers = localStorage.getItem('foodieUsers');
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        }
    }
    
    function checkLoginStatus() {
        const loggedInUser = sessionStorage.getItem('foodieCurrentUser');
        if (loggedInUser) {
            currentUser = JSON.parse(loggedInUser);
            updateUIForLogin();
        } else {
            updateUIForLogout();
        }
    }

    // --- Event Listeners ---
    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                openCart();
            } else {
                alert("Please sign in to start your order.");
                if (authOverlay) authOverlay.classList.add('active');
            }
        });
    }

    if (subscribeBtn && emailInput) {
        subscribeBtn.addEventListener('click', () => {
            if (emailInput.value && emailInput.value.includes('@')) {
                alert('Thank you for subscribing!');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    if (accountLink) {
        accountLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (authOverlay) authOverlay.classList.add('active');
        });
    }

    signInBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (authOverlay) authOverlay.classList.add('active');
    }));

    logoutBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        currentUser = null;
        sessionStorage.removeItem('foodieCurrentUser');
        updateUIForLogout();
        alert('You have been logged out.');
    }));

    if (closeAuthBtn) closeAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (authOverlay) authOverlay.classList.remove('active');
    });

    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginForm.querySelector('.auth-error').textContent = '';
    });

    if (showLoginLink) showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.querySelector('.auth-error').textContent = '';
    });
    
    if (loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const errorEl = loginForm.querySelector('.auth-error');
        
        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            currentUser = foundUser;
            sessionStorage.setItem('foodieCurrentUser', JSON.stringify(currentUser));
            updateUIForLogin();
            alert("Login successful!");
            if (authOverlay) authOverlay.classList.remove('active');
            loginForm.reset();
            errorEl.textContent = '';
        } else {
            errorEl.textContent = "Invalid email or password.";
        }
    });

    if (registerForm) registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = registerForm.querySelector('input[type="email"]').value;
        const mobile = registerForm.querySelector('input[type="tel"]').value;
        const address = registerForm.querySelector('textarea').value;
        const password = registerForm.querySelector('input[type="password"]').value;
        const errorEl = registerForm.querySelector('.auth-error');

        const emailExists = users.some(user => user.email === email);
        if (emailExists) {
            errorEl.textContent = 'An account with this email already exists.';
            return;
        }

        const newUser = { email, mobile, address, password };
        users.push(newUser);
        saveUsersToStorage();
        
        alert("Account created successfully! Please login.");
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.reset();
        errorEl.textContent = '';
    });


    // --- Mobile Menu Toggle ---
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('mobile-menu-active');
        });
    }

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignore empty hashes

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            
            if (mobileMenu && mobileMenu.classList.contains('mobile-menu-active')) {
                mobileMenu.classList.remove('mobile-menu-active');
            }
        });
    });

    // --- Swiper Initialization ---
    var swiper = new Swiper(".mySwiper", {
        loop: true,
        navigation: {
            nextEl: "#next",
            prevEl: "#prev",
        },
    });

    // --- Shopping Cart Functionality ---
    const cartIcon = document.querySelector('.cart-icon');
    const cartOverlay = document.querySelector('.cart-overlay');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const closeBtn = document.querySelector('.close-btn');
    const menuList = document.querySelector('.card.list');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.total-section p');
    const cartValueElement = document.querySelector('.cart-value');

    let cart = [];

    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
        if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
        if (closeBtn) closeBtn.addEventListener('click', closeCart);
    }

    if (menuList) {
        menuList.addEventListener('click', event => {
            if (event.target.classList.contains('btn')) {
                const card = event.target.closest('.order-card');
                if (card) {
                    if (!currentUser) {
                        alert("Please sign in to order food.");
                        if (authOverlay) authOverlay.classList.add('active');
                        return;
                    }
                    const id = card.dataset.id;
                    const name = card.querySelector('h4').textContent;
                    const priceText = card.querySelector('.price').textContent;
                    const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
                    const image = card.querySelector('img').src;
                    addItemToCart(id, name, price, image);
                }
            }
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', event => {
            const target = event.target;
            const parentItem = target.closest('.cart-item');
            if (!parentItem) return;
            const id = parentItem.dataset.id;
            if (target.classList.contains('plus')) {
                updateItemQuantity(id, 1);
            } else if (target.classList.contains('minus')) {
                updateItemQuantity(id, -1);
            }
        });
    }

    function openCart() {
        if (cartOverlay) cartOverlay.classList.add('active');
    }

    function closeCart() {
        if (cartOverlay) cartOverlay.classList.remove('active');
    }

    function addItemToCart(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }
        renderCart();
        openCart();
    }

    function updateItemQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(cartItem => cartItem.id !== id);
            }
        }
        renderCart();
    }

    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItemElement = document.createElement('li');
            cartItemElement.classList.add('cart-item');
            cartItemElement.dataset.id = item.id;
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="price">₹${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="quantity-control">
                    <button class="quantity-btn minus">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
        updateCartTotals();
    }

    function updateCartTotals() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalElement) cartTotalElement.textContent = `₹${total.toFixed(2)}`;
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartValueElement) cartValueElement.textContent = totalItems;
    }

    function populateMenu() {
        if (!menuList) return;
        menuList.innerHTML = '';
        const menuItems = [
             { id: 'p1', name: 'Pizza', price: 199.00, image: 'image/pizza.png' },
            { id: 'b1', name: 'Burger', price: 99.50, image: 'image/burger.png' },
            { id: 's1', name: 'Spaghetti', price: 150.00, image: 'image/spaghetti.png' },
            { id: 'i1', name: 'chicken-roll', price: 99.00, image: 'image/chicken-roll.png' },
            { id: 'l2', name: 'Lasagna', price: 120.00, image: 'image/lasagna.png' },
            { id: 'f2', name: 'Fried Chicken', price: 150.00, image: 'image/fried-chicken.png' },
            { id: 's3', name: 'Sandwich', price: 80.00, image: 'image/sandwich.png' },
            { id: 'i2', name: 'Spring Roll', price: 70.00, image: 'image/spring-roll.png' },
            { id: 'm3', name: 'Manchurian', price: 120.00, image: 'image/manchurian.png' },
            { id: 'c1', name: 'Coffee', price: 50.00, image: 'image/coffee.png' },
            { id: 't1', name: 'Tea', price: 20.00, image: 'image/Tea.png' },
            { id: 'f1', name: 'Fries', price: 70.00, image: 'image/fries.png' }
        ];
        menuItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'order-card';
            card.dataset.id = item.id;
            card.innerHTML = `
                <div class="card-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <h4>${item.name}</h4>
                <h4 class="price">₹${item.price.toFixed(2)}</h4>
                <a href="#" class="btn">Add to Cart</a>
            `;
            menuList.appendChild(card);
        });
    }

    // --- Initial Load ---
    loadUsersFromStorage();
    checkLoginStatus();
    populateMenu();
});
