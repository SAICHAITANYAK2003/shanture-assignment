// run with: node seed/seed.js
const mongoose = require('mongoose');
const faker = require('faker'); // or @faker-js/faker
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/salesdb';

async function seed() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  await Customer.deleteMany({});
  await Product.deleteMany({});
  await Sale.deleteMany({});

  // create customers
  const regions = ['North','South','East','West','Central'];
  const customers = [];
  for (let i=0;i<50;i++){
    customers.push(await Customer.create({
      name: faker.name.findName(),
      region: faker.random.arrayElement(regions),
      type: faker.random.arrayElement(['Individual','Business']),
      email: faker.internet.email()
    }));
  }

  // create products
  const categories = ['Electronics','Clothing','Home','Sports','Food'];
  const products = [];
  for (let i=0;i<30;i++){
    products.push(await Product.create({
      name: faker.commerce.productName(),
      category: faker.random.arrayElement(categories),
      price: parseFloat(faker.commerce.price(10,500,2)),
      sku: `SKU-${faker.random.alphaNumeric(8)}`
    }));
  }

  // create ~1000 sales across last 2 years
  const start = new Date();
  start.setFullYear(start.getFullYear() - 2);

  const totalSalesToCreate = 1200;
  for (let i=0;i<totalSalesToCreate;i++){
    const saleDate = faker.date.between(start, new Date());
    const product = faker.random.arrayElement(products);
    const customer = faker.random.arrayElement(customers);
    const qty = faker.random.number({ min:1, max:10 });
    await Sale.create({
      saleDate,
      customerId: customer._id,
      productId: product._id,
      quantity: qty,
      unitPrice: product.price,
      totalAmount: +(qty * product.price).toFixed(2),
      region: customer.region
    });
  }

  console.log('Seed complete');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });
