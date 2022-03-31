const productsContainer = document.querySelector(".products");
const cartProductsContainer = document.querySelector(".cart-products");
let totalPrice = document.querySelector(".total-price-span");
const shoppingCartContent = document.querySelector(".shopping-cart-content");
const initialShoppingCartContent = document.querySelector(
  ".initial-shopping-cart-content"
);
const currencyBtnsList = document.querySelectorAll(".currency-btns-list");
const currencyBtns = document.querySelectorAll(".currency-btn");
const totalCurrencyIcon = document.querySelector(".total-currency-icon");

let data = [];
let dataChanged = []; //for currency changes
let addToCartBtns = [];
let productCard;
let newData = {};
let currentCurrency;
let converter;
let currencySign = "$";

// Getting product data
async function getData() {
  const response = await fetch(
    "https://private-32dcc-products72.apiary-mock.com/product"
  );
  data = await response.json();
  data.sort((a, b) => b.price - a.price);
  dataChanged = data.map((d) => {
    return Object.assign({}, d);
  });
  renderResults(data, currencySign);
  addToCart(addToCartBtns, currencySign);
}
getData();

//Rendering products
const renderResults = function (results, currencySign) {
  for (let i = 0; i < results.length; i++) {
    productCard = document.createElement("div");
    productCard.classList.add("card");
    productCard.innerHTML = `
    <h3>${results[i].name}</h3>
    <h4>Price: <span class="currency-icon">${currencySign}</span><span class="price currency">${results[i].price}</span></h4>
    <button class="add-to-cart-btn product${i}"><img src="/shopping-cart.png" alt="" /> Add to cart</button>
    `;
    productsContainer.appendChild(productCard);
    results[i].product = `product${i}`;
  }
  newData = results;
  addToCartBtns = Array.from(document.querySelectorAll(".add-to-cart-btn"));
};

// Add products to cart
const addToCart = function (buttons, currencySign) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", (e) => {
      if (buttons[i].classList.contains(`product${i}`)) {
        e.target.parentElement.classList.add("delete-item");
        initialShoppingCartContent.classList.add("hidden");
        shoppingCartContent.classList.remove("hidden");

        if (newData[i].product === `product${i}`) {
          cartProductCard = document.createElement("div");
          cartProductCard.classList.add("cart-card");
          cartProductCard.innerHTML = `
          <div>
            <h4 class="cart-product-name">${newData[i].name}</h4>
            <img src="/info-icon.png" class="product-info-icon" alt="" />
             <div class="product-info">${
               newData[i].description || "no information"
             }</div>
          </div>
          <div>
            <input class="cart-quantity" type="number" value="1"/>
            <button class="remove-btn">Delete</button>
          </div>
          <div>
            <span class="currency-icon">${currencySign}</span><h4 class="cart-price currency">${
            newData[i].price
          }</h4>
          </div>`;
          cartProductsContainer.appendChild(cartProductCard);
        }
      }
      removeFromCart();
      updateQuantity();
      UpdateTotal();
    });
  }
};

const UpdateTotal = function () {
  let cartProducts = cartProductsContainer.querySelectorAll(".cart-card");
  let total = 0;
  for (let i = 0; i < cartProducts.length; i++) {
    const price = +cartProducts[i].querySelector(".cart-price").innerHTML;
    const quantity = +cartProducts[i].querySelector(".cart-quantity").value;
    total = total + price * quantity;
  }
  totalPrice.innerHTML = total.toFixed(2);
};

// Remove from cart
const removeFromCart = function () {
  let removeBtns = document.querySelectorAll(".remove-btn");
  for (let i = 0; i < removeBtns.length; i++) {
    removeBtns[i].addEventListener("click", (e) => {
      const cartProductName =
        e.target.parentElement.parentElement.querySelector(
          ".cart-product-name"
        ).innerHTML;
      e.target.parentElement.parentElement.remove();
      UpdateTotal();
      addBack(cartProductName);
    });
  }
};

//Add back to product list
const addBack = function (NameInCart) {
  for (let i = 0; i < addToCartBtns.length; i++) {
    if (newData[i].name === NameInCart) {
      addToCartBtns[i].parentElement.classList.remove("delete-item");
    }
  }
};

//update quantity
const updateQuantity = function () {
  let quantityInputs = document.querySelectorAll(".cart-quantity");
  for (let i = 0; i < quantityInputs.length; i++) {
    quantityInputs[i].addEventListener("change", () => {
      if (quantityInputs[i].value <= 0) {
        quantityInputs[i].value = 1;
      }
      UpdateTotal();
    });
  }
};

//currency convertion
async function getCurrencyRates() {
  const res = await fetch(
    "http://data.fixer.io/api/latest?access_key=4cf368650538178276632e65d729a3e8&format=1"
  );
  ratesData = await res.json();
  EURrate = ratesData.rates.EUR / ratesData.rates.USD;
  GBPrate = ratesData.rates.GBP / ratesData.rates.USD;
  // console.log(EURrate);
  // console.log(GBPrate);
  convertMoney(EURrate, GBPrate);
}

//event listener for currency buttons
currencyBtnsList.forEach((li) => {
  li.addEventListener("click", function (e) {
    if (e.target.classList.contains("clicked")) return;
    currencyBtns.forEach((btn) => {
      btn.classList.add("hidden");
    });
    e.target.classList.remove("hidden");
    if (e.target.innerHTML === "EUR") {
      currentCurrency = "EUR";
    } else if (e.target.innerHTML === "GBP") {
      currentCurrency = "GBP";
    } else if (e.target.innerHTML === "USD") {
      currentCurrency = "USD";
    }
    getCurrencyRates();
    e.target.classList.add("clicked");
  });
});

const converting = function (sign, rate) {
  for (let i = 0; i < dataChanged.length; i++) {
    dataChanged[i].price = `${(data[i].price * rate).toFixed(2)}`;
  }
  productsContainer.innerHTML = "";
  renderResults(dataChanged, sign);
  addToCart(addToCartBtns, sign);
  initialShoppingCartContent.classList.remove("hidden");
  cartProductsContainer.innerHTML = "";
  shoppingCartContent.classList.add("hidden");
  totalCurrencyIcon.innerHTML = sign;
};

const convertMoney = function (toEUR, toGBP) {
  const currencyChangingPrices = Array.from(
    document.querySelectorAll(".currency")
  );
  const currencyIcons = Array.from(document.querySelectorAll(".currency-icon"));

  if (currentCurrency === "EUR") {
    converting("€", toEUR);
  } else if (currentCurrency === "GBP") {
    converting("£", toGBP);
  } else if (currentCurrency === "USD") {
    converting("$", "1");
  }
};
