
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
let currentFilter = 'All';
let menu = [];
const API_URL = 'https://681b582317018fe5057b2888.mockapi.io/menu'; 


const menuContainer = document.getElementById('menu');
const cartItemsContainer = document.getElementById('cart-items');
const totalElement = document.getElementById('total');
const resetCartBtn = document.getElementById('reset-cart');
const validateOrderBtn = document.getElementById('validate-order');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartSection = document.getElementById('cart');


document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  updateCart();

  // Event listeners
  resetCartBtn.addEventListener('click', resetCart);
  validateOrderBtn.addEventListener('click', validateOrder);
  cartIcon.addEventListener('click', () => {
    cartSection.scrollIntoView({ behavior: 'smooth' });
    cartSection.classList.add('highlight');
    setTimeout(() => cartSection.classList.remove('highlight'), 1000);
  });

  // Category buttons
  document.querySelectorAll('.category-buttons button').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.category-buttons button').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.textContent === 'Tous' ? 'All' : this.textContent;
      displayFilteredMenu();
    });
  });
});

// Fetch
async function renderMenu() {
  menuContainer.innerHTML = '<p>Chargement du menu...</p>';

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erreur lors du chargement du menu');
    menu = await response.json();
    displayFilteredMenu();
  } catch (error) {
    menuContainer.innerHTML = `<p class="error">Erreur: ${error.message}</p>`;
  }
}


function displayFilteredMenu() {
  menuContainer.innerHTML = '';

  const filteredItems = currentFilter === 'All'
    ? menu
    : menu.filter(item => item.category === currentFilter);

  const categories = {};
  filteredItems.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  for (const [category, items] of Object.entries(categories)) {
    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'category-title';
    categoryTitle.textContent = category;
    menuContainer.appendChild(categoryTitle);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'menu-items';

    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'menu-item';
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-item-img">
        <div class="menu-item-content">
          <h3 class="menu-item-title">${item.name}</h3>
          <p class="menu-item-desc">${item.description}</p>
          <div class="menu-item-price">
            <span>${item.price} DT</span>
            <button class="menu-item-btn" data-id="${item.id}">Ajouter</button>
          </div>
        </div>
      `;

      itemElement.querySelector('button').addEventListener('click', () => addToCart(item));
      itemsContainer.appendChild(itemElement);
    });

    menuContainer.appendChild(itemsContainer);
  }
}


function addToCart(item) {
  cart.push(item);
  saveCart();
  updateCart();
  showNotification(`${item.name} ajouté au panier`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

function updateCart() {
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
    totalElement.textContent = '0';
    cartCount.textContent = '0';
    validateOrderBtn.disabled = true;
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-price">${item.price} DT</span>
      <button data-index="${index}">×</button>
    `;

    cartItem.querySelector('button').addEventListener('click', () => removeFromCart(index));
    cartItemsContainer.appendChild(cartItem);
    total += item.price;
  });

  totalElement.textContent = total.toFixed(2);
  cartCount.textContent = cart.length;
  validateOrderBtn.disabled = false;
}

function resetCart() {
  if (cart.length === 0) return;

  if (confirm('Voulez-vous vraiment vider votre panier?')) {
    cart = [];
    saveCart();
    updateCart();
    validateOrderBtn.disabled = true;
    showNotification('Panier vidé!');
  }
}

function validateOrder() {
  if (cart.length === 0) return;
  confirm(`Commande validée Total: ${totalElement.textContent} DT`);

  cart = [];
  saveCart();
  updateCart();
}

function saveCart() {
  sessionStorage.setItem('cart', JSON.stringify(cart));
  cartCount.textContent = cart.length;
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
