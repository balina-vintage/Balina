const express = require('express');
const fs = require('fs');

const app = express();
      app.use(express.json());
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'images/',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const PORT = 3000;
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const ADMIN_PASSWORD = '2bac svt';

app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    res.cookie('isAdmin', 'true', { httpOnly: true, maxAge: 86400000 });
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

function requireAdmin(req, res, next) {
  if (req.cookies.isAdmin === 'true') {
    next();
  } else {
    res.redirect('/login.html');
  }
}

app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});
app.use(express.static(__dirname));
app.post('/api/upload', upload.array('images', 4), (req, res) => {
res.json({ filenames: req.files.map(file => file.filename) });
});
app.delete('/api/products/:id', (req, res) => {
  const data = fs.readFileSync('./products.json', 'utf8');
  const products = JSON.parse(data);

  const id = Number(req.params.id);
  const newProducts = products.filter(product => product.id !== id);

  fs.writeFileSync(
    './products.json',
    JSON.stringify(newProducts, null, 2)
  );

  res.json({ success: true });
});
app.put('/api/products/:id', (req, res) => {
  const data = fs.readFileSync('./products.json', 'utf8');
  const products = JSON.parse(data);

  const id = Number(req.params.id);

  const product = products.find(product => product.id === id);

  if (!product) {
    return res.status(404).json({ success: false });
  }

  Object.assign(product, req.body);

  fs.writeFileSync(
    './products.json',
    JSON.stringify(products, null, 2)
  );

  res.json(product);
});
app.post('/api/orders', (req, res) => {
  let orders = [];

  if (fs.existsSync('./orders.json')) {
    orders = JSON.parse(fs.readFileSync('./orders.json', 'utf8'));
  }

const newOrder = {
id: orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1,
  productName: req.body.productName,
  price: req.body.price,
  customerName: req.body.customerName,
  customerPhone: req.body.customerPhone,
  customerCity: req.body.customerCity,
  customerAddress: req.body.customerAddress,
status: 'جديد',  
date: new Date().toLocaleString('ar-MA')
};
  orders.push(newOrder);

  fs.writeFileSync('./orders.json', JSON.stringify(orders, null, 2));

  res.json(newOrder);
});
app.delete('/api/orders/:id', (req, res) => {
  if (!fs.existsSync('./orders.json')) {
    return res.status(404).json({ error: 'لا توجد طلبات' });
  }

  let orders = JSON.parse(fs.readFileSync('./orders.json', 'utf8'));

  const id = Number(req.params.id);
  const newOrders = orders.filter(order => order.id !== id);

  if (newOrders.length === orders.length) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }

  fs.writeFileSync('./orders.json', JSON.stringify(newOrders, null, 2));

  res.json({ success: true });
});
app.put('/api/orders/:id', (req, res) => {
  if (!fs.existsSync('./orders.json')) {
    return res.status(404).json({ error: 'لا توجد طلبات' });
  }

  let orders = JSON.parse(fs.readFileSync('./orders.json', 'utf8'));

  const order = orders.find(o => o.id === Number(req.params.id));

  if (!order) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }

  order.status = req.body.status;

  fs.writeFileSync('./orders.json', JSON.stringify(orders, null, 2));

  res.json(order);
});

app.get('/api/orders', (req, res) => {
  if (!fs.existsSync('./orders.json')) {
    return res.json([]);
  }
  const data = fs.readFileSync('./orders.json', 'utf8');
  res.json(JSON.parse(data));
});
app.get('/api/products', (req, res) => {
  const data = fs.readFileSync('./products.json', 'utf8');
  res.json(JSON.parse(data));
});
app.post('/api/products', (req, res) => {
  const data = fs.readFileSync('./products.json', 'utf8');
  const products = JSON.parse(data);

const newProduct = {
  id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
  status: 'available',
  ...req.body
};

  products.push(newProduct);

  fs.writeFileSync(
    './products.json',
    JSON.stringify(products, null, 2)
  );

  res.json(newProduct);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Balina running on port ${PORT}`);
});
