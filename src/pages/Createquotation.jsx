import React, { useState, useEffect } from 'react';
import { getDocs, collection, addDoc, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import Navbar from "../components/Navbar";
import { useUser } from './UserContext';
import "./css/Createquotation.css"

function CreateQuotation() {
  const { user, setUser } = useState(); 
  const [productPOData, setProductPOData] = useState([]);
  const [approved, setApproved] = useState(false);
  const [menuActive, setMenuActive] = useState(true);
  const isEditable = !approved;
  const [storedUsername, setStoredUsername] = useState('');
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setStoredUsername(storedUsername);
    }
    console.log("Username in Homew:", storedUsername);
  }, []);
  const [requiredFields, setRequiredFields] = useState({
    issuedDate: false,
    expiredDate: false,
    cusName: false,
    cusAddress: false,
    cusPhoneNo: false,
  });
  const [quotation, setQuotation] = useState({
    empUser: '',
    issuedDate: '',
    expiredDate: '',
    cusName: '',
    cusDepartment: '',
    cusEmail: '',
    cusAddress: '',
    cusPhoneNo: '',
    quotationNo: '',
    items: [{
      description: '',
      quantity: '',
      unit: '',
      unitPrice: '',
    }],
  });

  
  
  useEffect(() => {
    const fetchProductPOData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productPO'));
        const documentCount = querySnapshot.size;
        const nextProductPONo = `pdPO${String(documentCount + 1).padStart(4, '0')}`; 
        setProductPOData((prevQuotation) => ({
          ...prevQuotation,
          quotationNo: nextProductPONo,
        }));
      } catch (error) {
          console.error('Error fetching productPO data:', error);
        }
      };
  
  fetchProductPOData();
}, []);
  
  useEffect(() => {
    const fetchLatestDocumentId = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quotation'));
        let maxQuotationNo = 0;
        querySnapshot.forEach(doc => {
        const currentQuotationNo = parseInt(doc.id.substr(1)); // Extract the numeric part of the quotation number
          if (currentQuotationNo > maxQuotationNo) {
            maxQuotationNo = currentQuotationNo;
          }
      });
      const nextQuotationNo = `Q${String(maxQuotationNo + 1).padStart(8, '0')}`;
      setQuotation((prevQuotation) => ({
      ...prevQuotation,
      quotationNo: nextQuotationNo,
    }));
      } catch (error) {
        console.error('Error fetching latest document ID: ', error);
      }
    };
    fetchLatestDocumentId();
  }, []);

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (storedUsername) {
          const userDoc = await getDoc(doc(db, 'account', storedUsername));
          if (userDoc.exists()) {
            setUser(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, [storedUsername]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setQuotation((prevQuotation) => ({ ...prevQuotation, [name]: value }));
    if (requiredFields.hasOwnProperty(name)) {
      setRequiredFields((prevFields) => ({ ...prevFields, [name]: !!value }));
    }
  };

const handleItemChange = async(event, index) => {
  const { name, value } = event.target;
   if (name === 'description') {
    const selectedProduct = products.find(product => product.id === value);
    const unit = selectedProduct && selectedProduct.unit ? selectedProduct.unit : '';
    setQuotation((prevQuotation) => ({
      ...prevQuotation,
      items: prevQuotation.items.map((item, i) =>
        i === index ? { ...item, [name]: value, unit: unit } : item
      ),
    }));
  } else {
    setQuotation((prevQuotation) => ({
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

  const handleDeleteItem = (index) => {
    setQuotation((prevQuotation) => ({
      ...prevQuotation,
      items: prevQuotation.items.filter((item, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    if (quotation.items) {
      quotation.items.forEach((item) => {
        total += item.quantity * item.unitPrice;
      });
    }
    return total.toFixed(2);
  };
  
  const calculateVAT = () => {
    const total = calculateTotal();
    const vat = total * 0.07;
    return vat.toFixed(2);
  };

  const calculateGrandTotal = () => {
    const total = parseFloat(calculateTotal());
    const vat = parseFloat(calculateVAT());
    return (total + vat).toFixed(2);
  };

  const handleSaveDraft = async () => {
    try {
      if (
        !quotation.issuedDate ||
        !quotation.expiredDate ||
        !quotation.cusName ||
        !quotation.cusAddress ||
        !quotation.cusPhoneNo
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

      const userDocRef = doc(db, 'account', storedUsername);
      const querySnapshot = await getDocs(collection(db, 'productPO'));
      const documentCount = querySnapshot.size;
      const currProductPONo = `pdPO${String(documentCount).padStart(4, '0')}`;
      const nextProductPONo = `pdPO${String(documentCount + 1).padStart(4, '0')}`;
      const nextQuotationNo = `Q${String(documentCount + 1).padStart(8, '0')}`;
      

    const productPOData = quotation.items.map((item, index) => {
    return {
    [`productNo${index + 1}`]: {
      description: doc(db, 'product', item.description), 
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    },
    quotationNo: doc(db, 'quotation', quotation.quotationNo),
  };
}).reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const quotationData = {
      ...quotation,
      empUser: userDocRef,
      status: 'Pending Approval',
    };
    delete quotationData.quotationNo;
    delete quotationData.items;
    if (quotation.quotationNo !== nextQuotationNo) {
      await setDoc(doc(db, 'quotation', quotation.quotationNo), quotationData);
      await setDoc(doc(db, 'productPO', currProductPONo), productPOData);
      console.log('Draft updated with ID: ', quotation.quotationNo);
      alert('Draft updated successfully');
    } else {
      await setDoc(doc(db, 'quotation', nextQuotationNo), quotationData);
      await setDoc(doc(db, 'productPO', nextProductPONo), productPOData);
      console.log('New draft saved with ID: ', nextQuotationNo);
      alert('Draft saved successfully');
    }
    
  } catch (error) {
    console.error('Error saving draft: ', error);
  }
};

  const handleApproveQuotation = async () => {
    try {
      await handleSaveDraft();

    const quotationRef = doc(db, 'quotation', quotation.quotationNo);
    const quotationSnapshot = await getDoc(quotationRef);

    const userDocRef = doc(db, 'account', storedUsername);
    if (quotationSnapshot.exists()) {
      await updateDoc(quotationRef, { status: 'Waiting for Response' });
      setApproved(true);
      alert('Quotation approved successfully');
    } else {
       const quotationData = {
        ...quotation,
        empUser: userDocRef,
        status: 'Waiting for Response',
      };
      delete quotationData.quotationNo;
      delete quotationData.items;

      await setDoc(quotationRef, quotationData);
      setApproved(true);
      alert('New quotation created and approved successfully');
    }
    }   catch (error) {
      console.error('Error approving quotation: ', error);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this quotation?");
    if (confirmCancel) {
      setQuotation({
        issuedDate: '',
    expiredDate: '',
    cusName: '',
    cusDepartment: '',
    cusEmail: '',
    cusAddress: '',
    cusPhoneNo: '',
    quotationNo: '',
    items: [{
      description: '',
      quantity: '',
      unit: '',
      unitPrice: '',
        }],
      });
    }
  };

  const handleGoBack = () => {
    const confirmGoBack = window.confirm("Are you sure you want to quit from creating the quotation?");
    if (confirmGoBack) {
      window.location.href = '/quotation';
    }
  };

  return (
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
    <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
    <div className="main-container">
      <div className="header-wrapper">
        <button className="back-btn" onClick={handleGoBack}>&lt;</button>
        <h1 className='cq'>Create Quotation</h1>
      </div>
      <div className='data-contain'>
        {/* Quotation Info */}
        <section className="quotation-info">
        <div>
            <label>Quotation No.</label>
            <input
              type="text"
              name="quotationNo"
              value={quotation.quotationNo}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div>
            <label>Issued Date</label>
            <input
              type="date"
              name="issuedDate"
              value={quotation.issuedDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Expired Date</label>
            <input
              type="date"
              name="expiredDate"
              value={quotation.expiredDate}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Customer Section */}
        <section className="customer-info">
          <div>
            <label>Customer Name</label>
            <input
              type="text"
              name="cusName"
              value={quotation.cusName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Department</label>
            <input
              type="text"
              name="cusDepartment"
              value={quotation.cusDepartment}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="cusEmail"
              value={quotation.cusEmail}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Address</label>
            <input
              type="text"
              name="cusAddress"
              value={quotation.cusAddress}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Phone Number</label>
            <input
              type="text"
              name="cusPhoneNo"
              value={quotation.cusPhoneNo}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Item List */}
        <section className="item-list">
          {quotation.items.map((item, index) => (
            <div key={index}>
              <label>{index + 1}</label> 
            <select
                name="description"
                value={item.description}
                onChange={(e) => handleItemChange(e, index)}
              >
                <option value="">Select Product</option>
                {products.map((product, idx) => (
                  <option key={idx} value={product.id}>{`${product.id}${product.productName}${product.material ? ' - ' + product.material : ''}${product.color ? ', ' + product.color : ''}${product.size ? ', ' + product.size : ''}`}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(e, index)}
              />
              <input
                type="text"
                name="unit"
                placeholder="Unit"
                value={item.unit}
                onChange={(e) => handleItemChange(e, index)}
              />
    <input
      type="number"
      name="unitPrice"
      placeholder="Unit Price"
      value={item.unitPrice}
      onChange={(e) => handleItemChange(e, index)}
    />
    <button onClick={() => handleDeleteItem(index)}>Delete</button>
  </div>
))}
          <button className="item-btn" onClick={handleAddItem}>Add Item</button>
        </section>
        {/* Summary */}
        <section className="summary">
        <div>
            <label>Total:</label>
            <span>{calculateTotal()} THB</span>
        </div>
        <div>
            <label>VAT (7%):</label>
            <span>{calculateVAT()} THB</span>
          </div>
          <div>
            <label>Grand Total:</label>
            <span>{calculateGrandTotal()} THB</span>
          </div>

        </section>
        {/* Actions */}
        <section className="actions">
        <button className="cancel-btn"onClick={handleCancel}>Cancel</button>
        {isEditable && (<button className="save-draft-btn"onClick={handleSaveDraft}>Save Draft</button>)}
        {!approved && <button className="approve-btn" onClick={handleApproveQuotation}>Approve Quotation</button>}
        </section>
      </div>
    </div>
    </div>
  );
}

export default CreateQuotation;
