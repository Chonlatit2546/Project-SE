import React, { useState } from 'react';

function EditQuotation(){
    const [items, setItems] = useState([]);
  
    const handleAddItem = () => {
      const newItem = {
        itemNumber: items.length + 1,
        quantity: 1.00,
        unit: 'Pcs.',
        unitPrice: 100.00
      };
  
      setItems([...items, newItem]);
    };
  
    const updateTotal = () => {
      let total = 0;
      items.forEach(item => {
        total += item.quantity * item.unitPrice;
      });
  
      return total.toFixed(2);
    };
  
    return (
      <div>
        <header style={{ backgroundColor: '#9faed2', color: '#fff', padding: '10px' }}>
          <h1>SupplyPro</h1>
        </header>
        <main style={{ padding: '20px' }}>
          <h2 style={{ marginTop: '0' }}>Edit Quotation</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
    <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
      <h3>Quotation</h3>
      {/* Add content for Quotation box if needed */}
    </div>

    <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
      <h3>Accepted</h3>
      {/* Add content for Accepted box if needed */}
    </div>

    <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
      <h3>PO</h3>
      {/* Add content for PO box if needed */}
    </div>

    <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
      <h3>Receipt</h3>
      {/* Add content for Receipt box if needed */}
    </div>

    <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
      <h3>Cheque Only Cleared</h3>
      {/* Add content for Cheque Only Cleared box if needed */}
    </div>
    </div>
          
          <section style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column' ,marginTop: '50px'}} className="quotation-info">
    <div style={{ textAlign: 'left' }}>
      <label>Quotation</label>
      <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
    <div style={{ marginLeft: '10px' }}>
      <label>Refer To </label>
      <input type="text" placeholder="" />
    </div>
    <div>
      <label>Quotation No. </label>
      <input type="text" placeholder="" />
    </div>
  </div>
    
  </div>
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
      <div style={{ textAlign: 'right', marginRight: '10px' }}>
        <label>Issued Date</label>
        <input type="text" placeholder="" />
      </div>
      <div style={{ textAlign: 'right' }}>
        <label>Expired Date</label>
        <input type="text" placeholder="" />
      </div>
    </div>
  </section>
           {/* Customer Section */}
           <section style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column' }} className="customer-info">
            <div style={{ textAlign: 'left' }}>
              <label>Customer</label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right', marginRight: '10px' }}>
                <label>Customer Name </label>
                <input type="text" id="customerName" placeholder="" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <label>Department </label>
                <input type="text" id="department " placeholder="" />
              </div>
              <div style={{ textAlign: 'right', marginRight: '10px' }}>
                <label>Email </label>
                <input type="text" id="email" placeholder="" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right', marginRight: '10px' }}>
                <label>Customer Address </label>
                <input type="text" id="email" placeholder="" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <label>Phone Number </label>
                <input type="text" id="phone" placeholder="" />
              </div>
            </div>
          </section>
          <section style={{ border: '1px solid #ccc', padding: '10px' }} className="item-list">
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Item</th>
          <th>Description</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Unit Price</th>
          <th>Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>
              <input type="text" placeholder="Description" />
            </td>
            <td>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].quantity = parseFloat(e.target.value);
                  setItems(updatedItems);
                }}
              />
            </td>
            <td>
              <input
                type="text"
                value={item.unit}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].unit = e.target.value;
                  setItems(updatedItems);
                }}
              />
            </td>
            <td>
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => {
                  const updatedItems = [...items];
                  updatedItems[index].unitPrice = parseFloat(e.target.value);
                  setItems(updatedItems);
                }}
              />
            </td>
            <td>{(item.quantity * item.unitPrice).toFixed(2)}</td>
            <td>
              <button
                onClick={() => {
                  const updatedItems = [...items];
                  updatedItems.splice(index, 1);
                  setItems(updatedItems);
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button className="add-item-btn" onClick={handleAddItem}>
      Add Item
    </button>
  </section>
  
  
  
  
  
  <section style={{ border: '1px solid #ccc', padding: '10px' }} className="summary">
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <div style={{ textAlign: 'left' }}>
              <label>Summary</label>
            </div>
      <tbody>
        <tr>
          <td>Total:</td>
          <td>{updateTotal()} THB</td>
        </tr>
      </tbody>
    </table>
  </section>
       
          
          <section style={{ marginTop: '10px' }} className="actions">
            <button className="cancel-btn">Cancel</button>
            <button className="save-draft-btn">Save </button>
           
          </section>
        </main>
      </div>
    );
  }
 
 export default EditQuotation;