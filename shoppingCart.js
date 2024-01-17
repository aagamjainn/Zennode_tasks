const readline = require('readline');

class Product {
      constructor(name, price) {
            this.name = name;
            this.price = price;
      }
}

class ShoppingCart {
      constructor() {
            this.cart = {};
            this.rules = {
                  flat_10_discount: (total) => (total > 200 ? 10 : 0),
                  bulk_5_discount: (qty, price) => (qty > 10 ? 0.05 * price : 0),
                  bulk_10_discount: (qty, price) => (qty > 20 ? 0.1 * price : 0),
                  tiered_50_discount: (qty, price, totalQty) =>
                        qty > 15 && totalQty > 30 ? 0.5 * price : 0,
            };
            this.giftWrapFee = 1;
            this.shippingFee = 5;
            this.unitsPerPackage = 10;
      }

      addToCart(product, quantity, isGiftWrapped) {
            this.cart[product.name] = {
                  quantity,
                  isGiftWrapped,
                  totalAmount: this.calculateTotalAmount(product, quantity),
            };
      }

      calculateTotalAmount(product, quantity) {
            const basePrice = product.price * quantity;
            const discount = this.calculateDiscount(product, quantity);
            const subtotal = basePrice - discount;
            const giftWrapFee = this.giftWrapFee * quantity;
            const total = subtotal + giftWrapFee;
            return total;
      }

      calculateDiscount(product, quantity) {
            const totalQuantity = Object.values(this.cart).reduce(
                  (acc, item) => acc + item.quantity,
                  0
            );

            const discounts = Object.entries(this.rules).map(([rule, applyRule]) =>
                  applyRule(quantity, product.price, totalQuantity)
            );

            return Math.max(...discounts);
      }

      calculateShippingFee() {
            const totalUnits = Object.values(this.cart).reduce(
                  (acc, item) => acc + item.quantity,
                  0
            );
            return Math.ceil(totalUnits / this.unitsPerPackage) * this.shippingFee;
      }

      displayReceipt() {
            Object.entries(this.cart).forEach(([productName, item]) => {
                  console.log(
                        `Product: ${productName}, Quantity: ${item.quantity}, Total Amount: $${item.totalAmount.toFixed(
                              2
                        )}, Gift Wrapped: ${item.isGiftWrapped ? 'Yes' : 'No'}`
                  );
            });

            const subtotal = Object.values(this.cart).reduce(
                  (acc, item) => acc + item.totalAmount,
                  0
            );

            const discountApplied = this.calculateDiscountApplied();

            const shippingFee = this.calculateShippingFee();

            const total = subtotal + shippingFee;

            console.log('\nSubtotal: $' + subtotal.toFixed(2));
            console.log('Discount Applied: ' + discountApplied.rule);
            console.log('Discount Amount: $' + discountApplied.amount.toFixed(2));
            console.log('Shipping Fee: $' + shippingFee.toFixed(2));
            console.log('\nTotal: $' + total.toFixed(2));
      }

      calculateDiscountApplied() {
            const discounts = Object.entries(this.rules).map(([rule, applyRule]) => {
                  const totalQuantity = Object.values(this.cart).reduce(
                        (acc, item) => acc + item.quantity,
                        0
                  );
                  const quantities = Object.values(this.cart).map((item) => item.quantity);
                  const maxQuantity = Math.max(...quantities);
                  const amount = applyRule(maxQuantity, 0, totalQuantity);
                  return { rule, amount };
            });

            return discounts.reduce((prev, current) =>
                  current.amount > prev.amount ? current : prev
            );
      }
}

const productA = new Product('Product A', 20);
const productB = new Product('Product B', 40);
const productC = new Product('Product C', 50);

const cart = new ShoppingCart();


function prompt(question) {
      const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
      });

      return new Promise((resolve) => {
            rl.question(question, (answer) => {
                  rl.close();
                  resolve(answer);
            });
      });
}

// Function to gather user input and add products to the cart
async function gatherUserInput(product) {
      const quantity = await prompt(`Enter quantity for ${product.name}: `);
      const isGiftWrapped = (
            await prompt(`Is ${product.name} gift-wrapped? (yes/no): `)
      ).toLowerCase() === 'yes';

      cart.addToCart(product, parseInt(quantity), isGiftWrapped);
}


(async () => {
      
      await gatherUserInput(productA);
      await gatherUserInput(productB);
      await gatherUserInput(productC);

      cart.displayReceipt();
})();
