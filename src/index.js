// Entry point for Express server
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const chatRoutes = require('./routes/chat');
const trainRoutes = require('./routes/train');
const authRoutes = require('./routes/auth');
const billingRoutes = require('./routes/billing');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/train', trainRoutes);
app.use('/chat', chatRoutes);
app.use('/billing', billingRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
