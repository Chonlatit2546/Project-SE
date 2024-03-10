import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

function Purchaseorders() {
  const [orders, setOrders] = useState([]); // Assuming orders data is fetched elsewhere
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added for loading state

  // Fetch orders (assuming an API endpoint)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('your_api_endpoint');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array to fetch only once

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase()); // Ensure case-insensitive search
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch = filter === "all" || order.poStatus === filter;
    const searchTermLower = searchTerm.toLowerCase(); // Lowercase search term for consistency
    const searchMatch =
      order.poNumber.toLowerCase().includes(searchTermLower) ||
      order.customer.toLowerCase().includes(searchTermLower) ||
      order.issuedDate.toLowerCase().includes(searchTermLower) ||
      order.expiredDate.toLowerCase().includes(searchTermLower) ||
      order.amount.toString().toLowerCase().includes(searchTermLower) ||
      order.poStatus.toLowerCase().includes(searchTermLower);

    return statusMatch && searchMatch;
  });

  return (
    <div className="purchase-orders">
      <Navbar />
      <div className="header">
        <h1>Purchase Orders</h1>
        <div className="search">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter">
          <label>Filter by status:</label>
          <div className="filter-buttons">
            <button
              className={filter === "all" ? 'active' : ''}
              onClick={() => handleFilterChange({ target: { value: 'all' } })}
            >
              All
            </button>
            <button
              className={filter === "Waiting for receipt creation" ? 'active' : ''}
              onClick={() => handleFilterChange({ target: { value: 'Waiting for receipt creation' } })}
            >
              Waiting for receipt creation
            </button>
            <button
              className={filter === "Expired" ? 'active' : ''}
              onClick={() => handleFilterChange({ target: { value: 'Expired' } })}
            >
              Expired
            </button>
            <button
              className={filter === "Closed" ? 'active' : ''}
              onClick={() => handleFilterChange({ target: { value: 'Closed' } })}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p>Loading orders...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>PO number</th>
              <th>Customer</th>
              <th>Issued Date</th>
              <th>Expired Date</th>
              <th>Amount</th>
              <th>Po Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.poNumber}</td>
                <td>{order.customer}</td>
                <td>{order.issuedDate}</td>
                <td>{order.expiredDate}</td>
                <td>{order.amount}</td>
                <td>{order.poStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Purchaseorders;