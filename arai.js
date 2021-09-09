const ANSWER = "ANSWER";

class Product {
  constructor({ name, price, brand }) {
    this.name = name;
    this.price = price;
    this.brand = brand;
  }

  getDisplayName() {
    return `${this.name} - ${this.brand}`;
  }

  doublePrice() {
    this.price = this.price * 2;
  }
}

class Calculator {
  constructor() {
    this.total = 0;
  }

  plus = (num) => {
    this.total += num;

    return this;
  }

  minus(num) {
    this.total -= num;

    return this;
  }
}

const iPhone = new Product({
  name: "iPhone",
  price: 40000,
  brand: "Apple"
});
const iPad = new Product({
  name: "iPad",
  price: 60000,
  brand: "Apple"
});
const calculator = new Calculator();
const products = [iPhone, iPad];

function power (num) {
  this.price = Math.pow(this.price, num);
};
// console.log(power.bind(iPhone)(2));
// console.log(power.bind(iPad)(2));

products
  .map((product) => product.price)
  .forEach(calculator.plus);
console.log(calculator);
console.log()