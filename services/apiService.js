const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Product creation failed');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Product update failed');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Product deletion failed');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const seedDB = async (data) => {
  try {
    const response = await fetch(`${API_URL}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Seeding failed');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Order creation failed');
    return await response.json();
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    throw error;
  }
};

export const fetchReviews = async () => {
  try {
    const response = await fetch(`${API_URL}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return await response.json();
  } catch (error) {
    console.error('Error in fetchReviews:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error('Review creation failed');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('API health check error:', error);
    return { status: 'offline', database: 'unknown' };
  }
};

export const fetchUserProfile = async (uid) => {
  try {
    const response = await fetch(`${API_URL}/users/${uid}`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return await response.json();
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return {};
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    const response = await fetch(`${API_URL}/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('User update failed');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createUroPayOrder = async (paymentData) => {
  try {
    console.log('Sending createUroPayOrder request...', paymentData);
    const response = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const text = await response.text();
    console.log('Response from server (raw):', text.substring(0, 200));

    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }
      return data;
    } catch (e) {
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error('Error in createUroPayOrder:', error);
    throw error;
  }
};

export const verifyUroPayPayment = async (verificationData) => {
  try {
    const response = await fetch(`${API_URL}/payments/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in verifyUroPayPayment:', error);
    throw error;
  }
};

export const fetchUroPayStatus = async (uroPayOrderId) => {
  try {
    const response = await fetch(`${API_URL}/payments/status/${uroPayOrderId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payment status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchUroPayStatus:', error);
    throw error;
  }
};
