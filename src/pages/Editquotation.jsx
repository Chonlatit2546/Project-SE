import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../components/Navbar";
import { getDoc, doc, updateDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import "./css/Createquotation.css"
import "./css/Vendor.css";

function Editquotation(){
  const { id } = useParams();
  const [quotationData, setQuotationData] = useState(null);
  const [productPOData, setProductPOData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuActive, setMenuActive] = useState(true);
  const [editedQuotationData, setEditedQuotationData] = useState({});
  const [newItemData, setNewItemData] = useState([]);
  const [quotation, setQuotation] = useState({
    quotationNo: '',
    items: [],
  });

  useEffect(() => {
    const fetchQuotationAndProductPOData = async () => {
      try {
        const productPODocRef = doc(db, 'productPO', id);
        const productPOSnapshot = await getDoc(productPODocRef);
  
        if (!productPOSnapshot.exists()) {
          throw new Error('Product PO document does not exist');
        }
        const productPOData = productPOSnapshot.data();
        setProductPOData(productPOData);
        const quotationNoRef = productPOData.quotationNo;
        const quotationNoDoc = await getDoc(quotationNoRef);
        
        if (!quotationNoDoc.exists()) {
          throw new Error('Quotation document does not exist');
        }
  
        const quotationData = { id: quotationNoRef.id, ...quotationNoDoc.data() };
        setQuotationData(quotationData);

        const productDataPromises = Object.values(productPOData)
          .filter(product => typeof product === 'object' && product.description)
          .map(async (product) => {
            const productDocRef = product.description;
            const productDocSnapshot = await getDoc(productDocRef);
            if (productDocSnapshot.exists()) {
              return { id: productDocRef.id, ...productDocSnapshot.data() };
            }
            return null;
          });
        const productData = await Promise.all(productDataPromises);
        setProductData(productData);
        
        setEditedQuotationData({
          ...quotationData,
          issuedDate: new Date().toISOString().split('T')[0], 
          expiredDate: calculateExpirationDate(new Date().toISOString().split('T')[0]) 
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data: ', error);
        setError(error);
        setLoading(false);
      }
    };
  
    fetchQuotationAndProductPOData();
  }, [id]);
  useEffect(() => {
    setEditedQuotationData(prevData => ({
      ...prevData,
      issuedDate: new Date().toISOString().split('T')[0],
      expiredDate: calculateExpirationDate(new Date().toISOString().split('T')[0])
    }));
  }, [productPOData]);

  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'product'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };
    fetchProducts();
  }, []);
  const calculateExpirationDate = (issuedDate) => {
    const issued = new Date(issuedDate);
    const expiration = new Date(issued);
    expiration.setMonth(expiration.getMonth() + 1); 
    return expiration.toISOString().split('T')[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedQuotationData({ ...editedQuotationData, [name]: value });
  };

  const handleItemChange = async (event, index) => {
    const { name, value } = event.target;
  
    if (name === 'description') {
      const selectedProduct = products.find(product => product.id === value);
      const unit = selectedProduct && selectedProduct.unit ? selectedProduct.unit : '';
      
      setQuotation(prevQuotation => ({
        ...prevQuotation,
        items: prevQuotation.items.map((item, i) =>
          i === index ? { ...item, [name]: value, unit: unit } : item
        ),
      }));
    } else {
      setQuotation(prevQuotation => ({
        ...prevQuotation,
        items: prevQuotation.items.map((item, i) =>
          i === index ? { ...item, [name]: value } : item
        ),
      }));
    }
  };
  
  const handleAddItem = () => {
    const newItem = {
      description: '',
      quantity: '',
      unit: '',
      unitPrice: '',
    };
    setQuotation((prevQuotation) => ({
      ...prevQuotation,
      items: [...prevQuotation.items, newItem],
    }));
  };
  const handleDeleteItem = (index, isExistingProduct) => {
    if (isExistingProduct) {
      const productKey = `productNo${index + 1}`;
    setProductPOData(prevProductPOData => {
      const { [productKey]: deletedProduct, ...restProductPOData } = prevProductPOData;
      return restProductPOData;
    });
    } else {
      setQuotation((prevQuotation) => ({
        ...prevQuotation,
        items: prevQuotation.items.filter((item, i) => i !== index),
      }));
    }
  };
  const handleExistedItemChange = async (event, index, name) => {
    const value = event.target.value;

  setProductPOData(prevProductPOData => ({
    ...prevProductPOData,
    [`productNo${index + 1}`]: {
      ...prevProductPOData[`productNo${index + 1}`],
      [name]: value,
    },
  }));
  };
  
  const handleSaveDraft = async () => {
    try {
      if (
        !editedQuotationData.issuedDate ||
        !editedQuotationData.expiredDate ||
        !editedQuotationData.cusName ||
        !editedQuotationData.cusAddress ||
        !editedQuotationData.cusPhoneNo
      ) {
        alert('Please fill in all required fields before saving the draft.');
        return;
      }

      const isEmptyItem = quotation.items.some(
        (item) =>
          item.description === '' ||
          item.quantity === '' ||
          item.unitPrice === ''
      );
  
      if (isEmptyItem) {
        alert('Please fill in all item details before saving the draft.');
        return; 
      }

      const productPOUpdatePromises = productData.map((product, index) => {
        const productNoKey = `productNo${index + 1}`;
        const updatedProduct = productPOData[productNoKey];
        return updateDoc(doc(db, 'productPO', id), {
          [productNoKey]: {
            ...updatedProduct,
            quantity: updatedProduct.quantity || 0, 
            unitPrice: updatedProduct.unitPrice || 0, 
          },
        });
      });
  
      const newItemPromises = quotation.items.map((item, index) => {
        const productNoKey = `productNo${productData.length + index + 1}`;
        return setDoc(doc(db, 'productPO', id), {
          [productNoKey]: {
            description: doc(db, 'product', item.description), 
            quantity: item.quantity || 0, 
            unitPrice: item.unitPrice || 0, 
          },
        }, { merge: true });
      });
  
      await Promise.all([...productPOUpdatePromises, ...newItemPromises]);
      delete editedQuotationData.id;
      delete editedQuotationData.productPOData;
      const quotationRef = doc(db, 'quotation', quotationData.id);
      await updateDoc(quotationRef, editedQuotationData);
      alert('Draft updated successfully');
      window.location.href = `/QuotationDetails/${id}`;
    } catch (error) {
      console.error('Error saving draft: ', error);
    }
  };
  const updateTotal = () => {
    let total = 0;
  productData.forEach((product, index) => {
    total += (productPOData[`productNo${index + 1}`]?.quantity || 0) * (productPOData[`productNo${index + 1}`]?.unitPrice || 0);
  });

  quotation.items.forEach((item, index) => {
    total += (item.quantity || 0) * (item.unitPrice || 0);
  });
  
    return total.toFixed(2);
  };
  const updateVat = () => {
    let total= updateTotal();
    const vat = total * 0.07;
    return vat.toFixed(2);
  };
  
  const updateGrandTotal = () => {
    const total = parseFloat(updateTotal());
    const vat = parseFloat(updateVat());
    return (total + vat).toFixed(2);
  };

    const handleGoBack = () => {
      const confirmGoBack = window.confirm("Are you sure you want to quit from editing the quotation?");
      if (confirmGoBack) {
        window.location.href = `/QuotationDetails/${id}`;
      }
    };

    return (
      <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
        <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
        <main style={{ padding: '20px', marginLeft: '30px', marginTop: '-30px' }}>
        <div className="header-wrapper">
        <button className="Back-btn" onClick={handleGoBack}>&lt;</button>
        <h2 style={{ marginLeft: '-20px', fontSize: '35px', color: '#1d438a', marginBottom: '58px' }}>Edit Quotation</h2>
      </div>
        <section style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column' ,marginTop: '-20px'}} className="quotation-info">
          <div style={{ textAlign: 'left' }}>
            <label>Quotation - {quotationData && quotationData.id}</label>
              <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ marginLeft: '10px' }}>
            <label>Refer To</label>
              <input type="text"  />
            </div>
      </div>
    
  </div>
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
      <div style={{ textAlign: 'right', marginRight: '10px' }}>
      <label>Issued Date</label>
          <input
            type="date"
            name="issuedDate"
            value={editedQuotationData.issuedDate}
            onChange={handleInputChange}
          />
        </div>
            <div style={{ textAlign: 'right' }}>
              <label>Expired Date</label>
              <input
                type="date"
                name="expiredDate"
                value={editedQuotationData.expiredDate}
                onChange={handleInputChange}
              />
            </div>
        </div>
        </section>
        <section style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column' }} className="customer-info">
            <div style={{ textAlign: 'left' }}>
              <label>Customer</label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right', marginRight: '10px' }}>
              <label>Customer Name</label>
              <input type="text" name="cusName" value={editedQuotationData.cusName || ''} onChange={handleInputChange} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <label>Department</label>
              <input type="text"  name="cusDepartment" value={editedQuotationData.cusDepartment || ''} onChange={handleInputChange} />
            </div>
            <div style={{ textAlign: 'right', marginRight: '10px' }}>
              <label>Email</label>
              <input type="text"name="cusEmail" value={editedQuotationData.cusEmail || ''} onChange={handleInputChange} />
            </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right', marginRight: '60px' }}>
                <label>Customer Address </label>
                <input type="text" name="cusAddress" value={editedQuotationData.cusAddress || ''} onChange={handleInputChange} />
              </div>
              <div style={{ textAlign: 'right', marginTop: '12px', marginRight: '10px' }}>
                <label>Phone Number </label>
                <input type="text" name="cusPhoneNo"value={editedQuotationData.cusPhoneNo || ''} onChange={handleInputChange}/>
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
    {productData.map((product, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td style={{ width: '1000px' }}>
          {`${product.productName}, ${product.color}, ${product.material ? product.material + ', ' : ''}${product.size ? product.size : ''}`}
        </td>
        <td>
          <input
            type="number"
            value={productPOData[`productNo${index + 1}`]?.quantity || ''}
            onChange={(e) => handleExistedItemChange(e, index, 'quantity')}
          />
        </td>
        <td>
          <input
            type="text"
            value={product.unit}
            onChange={(e) => handleExistedItemChange(e, index)}
          />
        </td>
        <td>
          <input
            type="number"
            value={productPOData[`productNo${index + 1}`]?.unitPrice || ''}
            onChange={(e) => handleExistedItemChange(e, index, 'unitPrice')}
          />
        </td>
        <td>
          <input
            type="number"
            value={productPOData[`productNo${index + 1}`]?.quantity ? productPOData[`productNo${index + 1}`]?.quantity * productPOData[`productNo${index + 1}`]?.unitPrice : 0}
            onChange={(e) => handleExistedItemChange(e, index)}
          />
        </td>
        <td>
        </td>
      </tr>
    ))}
    {quotation.items.map((item, index) => (
      <tr key={index}>
        <td>{productData.length + index + 1}</td>
        <td>
          <select
            name="description"
            value={item.description}
            onChange={(e) => handleItemChange(e, index)}
          >
            <option value="">Select Product</option>
            {products.map((product, idx) => (
              <option key={idx} value={product.id}>{`${product.id}${product.productName}${product.material ? ' - ' + product.material : ''}${product.color ? ', ' + product.color : ''}${product.size ? ', ' + product.size : ''}`}</option>
            ))}
          </select>
        </td>
        <td>
          <input
            type="number"
            name="quantity"
            value={item.quantity}
            onChange={(e) => handleItemChange(e, index)}
          />
        </td>
        <td>
          <input
            type="text"
            name="unit"
            value={item.unit}
            onChange={(e) => handleItemChange(e, index)}
          />
        </td>
        <td>
          <input
            type="number"
            name="unitPrice"
            value={item.unitPrice}
            onChange={(e) => handleItemChange(e, index)}
          />
        </td>
        <td>
          <input
            type="number"
            name="amount"
            value={item.unitPrice * item.quantity}
            readOnly
          />
        </td>
        <td>
        <button onClick={() => handleDeleteItem(index, false)}>Delete</button>
        </td>
      </tr>
    ))}
    <button className="item-btn" onClick={handleAddItem}>Add Item</button>
  </tbody>
  </table>

  </section> 
  <section style={{ border: '1px solid #ccc', padding: '10px' }} className="summary">
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <div style={{ textAlign: 'left' }}>
              <label>Summary</label>
            </div><br />
      <tbody>
        <tr>
          <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total:</td>
          <td>{updateTotal()} THB</td>
        </tr>
        <tr>
          <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Vat(7%):</td>
          <td>&nbsp;&nbsp;&nbsp;{updateVat()} THB</td>
        </tr>
        <tr>
          <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Grand Total:</td>
          <td>{updateGrandTotal()} THB</td>
        </tr>
      </tbody>
    </table>
  </section>
  <footer className="FooterVendor">
          <div className="footer-manageVendor">
            <div>
              <label><b>QuottationNo: :</b> {quotationData && quotationData.id}</label>
            </div>
              
            <div className="CancleVendorfoot">
              <button className="CancelButtonVendor" onClick={handleGoBack}>Cancle</button>
            </div>
            <div className="SaveButtonVendor">
              <button style={{ marginLeft: '10px' }}onClick={handleSaveDraft}>Save Draft</button>
            </div>
          </div>
        </footer>
        </main>
      </div>
    );
  
};
 export default Editquotation;

