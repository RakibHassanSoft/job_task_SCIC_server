const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 5000;

// MongoDB URI and Database Connection
const uri = "mongodb+srv://Rakib:rakib111@cluster0.drqortc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
const productsCollection = () => db.collection('products');

app.use(cors());
app.use(bodyParser.json());

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('SCIC');
    console.log('Connected to Database');
  } catch (error) {
    console.error('Failed to connect to database', error);
  }
}

connectToDatabase();

// Fetch products with pagination, search, categorization, sorting, and price filtering
app.get('/products', async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    category,
    brands,
    sort = 'productCreationDate',
    order = 'desc',
    minPrice,
    maxPrice
  } = req.query;

  // Convert brands to an array if it's a comma-separated string
  const brandArray = brands ? brands.split(',') : [];

  // Create query object
  const query = {};
  if (search) query.productName = { $regex: search, $options: 'i' }; // Case-insensitive search
  if (category) query.category = category;
  if (brandArray.length > 0) query.brand = { $in: brandArray };

  // Add price range to the query
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Define the sort order
  const sortOrder = order === 'desc' ? -1 : 1;

  try {
    const products = await productsCollection()
      .find(query)
      .sort({ [sort]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    const total = await productsCollection().countDocuments(query);

    res.json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
