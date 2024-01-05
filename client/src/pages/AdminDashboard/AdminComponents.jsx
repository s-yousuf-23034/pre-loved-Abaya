// AdminComponent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminComponent = () => {
  const [productCounts, setProductCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    // Fetch counts of products on component mount
    fetchProductCounts();
  }, []);

  const fetchProductCounts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/productCounts');
      setProductCounts(response.data);
    } catch (error) {
      console.error('Error fetching product counts:', error.message);
    }
  };

  const handleApprove = async (productId) => {
    try {
      const response = await axios.patch(`http://localhost:3000/admin/products/${productId}/approve`);
      console.log(response.data);
      // Fetch updated counts after approving a product
      fetchProductCounts();
    } catch (error) {
      console.error('Error approving product:', error.message);
    }
  };

  const handleReject = async (productId) => {
    try {
      const response = await axios.patch(`http://localhost:3000/admin/products/${productId}/reject`);
      console.log(response.data);
      // Fetch updated counts after rejecting a product
      fetchProductCounts();
    } catch (error) {
      console.error('Error rejecting product:', error.message);
    }
  };

  return (
    <div>
      <h2>Admin Component</h2>
      <div>
        <h3>Pending Products: {productCounts.pending}</h3>
        <h3>Approved Products: {productCounts.approved}</h3>
        <h3>Rejected Products: {productCounts.rejected}</h3>
      </div>
      <ul>
        {/* Display pending products */}
        {/* Loop through pending products and handle approval/rejection */}
      </ul>
    </div>
  );
};

export default AdminComponent;
