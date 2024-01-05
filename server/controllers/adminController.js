const Product = require('../models/Product');

// Function to send product to pending status
const sendToPending = async (newProduct) => {
  try {
    newProduct.status = 'pending';
    await newProduct.save();
  } catch (error) {
    console.error(error.message);
    throw new Error('Failed to send product to pending');
  }
}

// Admin controller to handle pending products
const handlePending = async (req, res) => {
  try {
    const newProduct = req.body; // Product data sent by seller
    await sendToPending(newProduct);
    res.status(201).json({ message: 'Product sent to pending' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Admin controller to approve a product
const approveProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(productId, { status: 'approved' }, { new: true });
    res.json({ message: 'Product approved', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Admin controller to reject a product
const rejectProduct = async (req, res)=> {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json({ message: 'Product rejected', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  handlePending,
  approveProduct,
  rejectProduct,
};

// const mongoose = require('mongoose');
// const Product = require('../models/Product');
// const Seller = require('../models/Seller');
// const Admin = require('../models/Admin');

// const approveProduct = async (req, res) => {
//   const productId = req.params.productId;

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ success: false, msg: 'Product not found' });
//     }

//     // Logic to approve the product (update its status, etc.)
//     product.status = 'Approved';
//     await product.save();

//     res.json({ success: true, msg: 'Product approved successfully' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, msg: 'Server error' });
//   }
// };

// const rejectProduct = async (req, res) => {
//   const productId = req.params.productId;

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ success: false, msg: 'Product not found' });
//     }

//     // Logic to reject the product (update its status, etc.)
//     product.status = 'Rejected';
//     await product.save();

//     res.json({ success: true, msg: 'Product rejected successfully' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, msg: 'Server error' });
//   }
// };
// const adminGetDashboard = async (req, res) => {
//     try {
//       // Fetch details for admin dashboard
//       const sellerCount = await Seller.countDocuments();
//       const productCount = await Product.countDocuments();
//       // Get other necessary details like product sales, revenue, etc.
      
//       const dashboardData = {
//         sellerCount,
//         productCount,
//         // Other necessary dashboard data for admin
//       };
  
//       res.json(dashboardData);
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ msg: 'Server error' });
//     }
//   };
//   const adminGetSellers = async (req, res) => {
//     try {
//       const sellers = await Seller.find({}, 'shopName email status');
//       res.json(sellers);
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ msg: 'Server error' });
//     }
//   };
//   const adminApproveSeller = async (req, res) => {
//     const { sellerId } = req.params;
//     try {
//       const seller = await Seller.findById(sellerId);
//       if (!seller) {
//         return res.status(404).json({ msg: 'Seller not found' });
//       }
//       seller.status = 'Approved'; // Assuming there's a 'status' field in the Seller model
//       await seller.save();
//       res.json({ msg: 'Seller approved successfully' });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ msg: 'Server error' });
//     }
//   };

// module.exports = { approveProduct, rejectProduct, adminGetDashboard, adminGetSellers, adminApproveSeller };

