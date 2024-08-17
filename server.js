const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 5000;
const uri = "mongodb+srv://Rakib:rakib111@cluster0.drqortc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let db;

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('SCIC');
    console.log('Connected to Database');
  })
  .catch(error => console.error(error));

app.use(cors());
app.use(bodyParser.json());

const productsCollection = () => db.collection('products');



// Fetch products with pagination, search, categorization, and sorting
// app.get('/products', async (req, res) => {
//     const {
//       page = 1,
//       limit = 10,
//       search = '',
//       category,
//       brands,
//       sort = 'productCreationDate',
//       order = 'desc'
//     } = req.query;
//    console.log(      brands
//    )
//     // Create a query object
//     const query = {};
//     if (search) query.productName = { $regex: search, $options: 'i' }; // Case-insensitive search
//     if (category) query.category = category;
//     if (brands) query.brands = brands;
  
//     // Define the sort order
//     const sortOrder = order === 'desc' ? -1 : 1;
  
//     try {
//       const products = await productsCollection()
//         .find(query)
//         .sort({ [sort]: sortOrder })
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit))
//         .toArray();
  
//       const total = await productsCollection().countDocuments(query);
  
//       res.json({
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         totalProducts: total,
//         products,
//       });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to fetch products' });
//     }
//   });
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

  console.log(minPrice, " ", maxPrice);

  // Converting brands to an array if it is a comma separated string.
  const brandArray = brands ? brands.split(',') : [];

  // Creating a query object.
  const query = {};
  if (search) query.productName = { $regex: search, $options: 'i' }; // Case-insensitive searching.
  if (category) query.category = category;
  if (brandArray.length > 0) query.brand = { $in: brandArray };

  // Adding price range to the query object.
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice); 
    if (maxPrice) query.price.$lte = parseFloat(maxPrice); 
  }

  // Defining the sort order.
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



  
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
