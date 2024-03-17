import React, { useState, useEffect } from 'react';
import { getDocs, collection, addDoc, setDoc, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase'; 
import { useParams } from 'react-router-dom';

function CreateQuotation() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [productPOData, setProductPOData] = useState([]);
  const [approved, setApproved] = useState(false);
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

  /*const fetchQuotationByNumber = async (quotationNumber) => {
    try {
      const quotationQuery = query(collection(db, 'productPO'), where('quotationNo', '==', quotationNumber));
      const querySnapshot = await getDocs(quotationQuery);
      
      if (!querySnapshot.empty) {
        const productPOData = querySnapshot.docs[0].data();
  
        // Extract product information references from productPOData
        const productReferences = [];
        for (let key in productPOData) {
          if (key.startsWith('productNo')) {
            productReferences.push(productPOData[key][0]); // Assuming the reference is at index 0
          }
        }
  
        // Fetch product documents using the references
        const products = await Promise.all(productReferences.map(async (productRef) => {
          const productDoc = await getDoc(productRef);
          return productDoc.exists() ? productDoc.data() : null;
        }));
  
        console.log('Product Information:', products);
      } else {
        console.log('Quotation not found.');
      }
    } catch (error) {
      console.error('Error fetching quotation: ', error);
    }
  };*/

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
        const documentCount = querySnapshot.size;
        const nextQuotationNo = `Q${String(documentCount + 1).padStart(8, '0')}`;
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
/*
  useEffect(() => {
    const fetchQuotationByNumber = async (quotationNumber) => {
      try {
        const quotationQuery = query(collection(db, 'quotation'), where('quotationNo', '==', quotationNumber));
        const querySnapshot = await getDocs(quotationQuery);
        if (!querySnapshot.empty) {
          const productPOData = querySnapshot.docs[0].data();
          const quotationRef = productPOData.quotation;
          const quotationDoc = await getDoc(quotationRef);
          if (quotationDoc.exists()) {
            const quotationData = quotationDoc.data();
            setQuotation(quotationData);
          } else {
            console.log('Quotation not found.');
          }
        } else {
          console.log('Quotation not found.');
        }
      } catch (error) {
        console.error('Error fetching quotation: ', error);
      }
    };
    

    if (quotation.quotationNo) {
      fetchQuotationByNumber(quotation.quotationNo);
    }
  }, [quotation.quotationNo]);
 */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'account', username)); // Fetch user data from "account" collection
        if (userDoc.exists()) {
          setUser(userDoc.data()); // Update user state with user data
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, [username]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setQuotation((prevQuotation) => ({ ...prevQuotation, [name]: value }));
};
/*
const handleQuotationNoChange = (event) => {
  const { value } = event.target;
  setQuotation(prevQuotation => ({
    ...prevQuotation,
    quotationNo: value
  }));
  fetchQuotationByNumber(value); // Fetch quotation data when quotation number changes
};*/
  const handleItemChange = async(event, index) => {
    const { name, value } = event.target;
      setQuotation((prevQuotation) => ({
        ...prevQuotation,
        items: prevQuotation.items.map((item, i) =>
          i === index ? { ...item, [name]: value } : item
        ),
      }));
    
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
      if (!user) {
        console.error('User is not authenticated.');
        return;
      }
      const userDocRef = doc(db, 'account', username);
      const querySnapshot = await getDocs(collection(db, 'productPO'));
      const documentCount = querySnapshot.size;
      const currProductPONo = `pdPO${String(documentCount).padStart(4, '0')}`;
      const nextProductPONo = `pdPO${String(documentCount + 1).padStart(4, '0')}`;
      const nextQuotationNo = `Q${String(documentCount + 1).padStart(8, '0')}`;
      

    const productPOData = quotation.items.map((item, index) => {
    return {
    [`productNo${index + 1}`]: {
      description: doc(db, 'product', item.description), // Assuming productId is the ID of the product
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    },
    quotationNo: quotation.quotationNo,
  };
}).reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const quotationData = {
      ...quotation,
      empUser: userDocRef,
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
      setApproved(true);
      alert('Quotation approved successfully');
  } catch (error) {
    console.error('Error saving draft: ', error);
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

  const isEditable = !approved;

  return (
    <div>
      <header style={{ backgroundColor: '#9faed2', color: '#fff', padding: '10px' }}>
        <h1>SupplyPro</h1>
      </header>
      <main style={{ padding: '20px' }}>
        <h2 style={{ marginTop: '0' }}>Create Quotation</h2>

        {/* Quotation Info */}
        <section className="quotation-info">
        <div>
            <label>Quotation No.</label>
            <input
              type="text"
              name="quotationNo"
              value={quotation.quotationNo}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Issued Date</label>
            <input
              type="text"
              name="issuedDate"
              value={quotation.issuedDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Expired Date</label>
            <input
              type="text"
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
              <label>{index + 1}</label> {/* Number in front of description box */}
            <select
                name="description"
                value={item.description}
                onChange={(e) => handleItemChange(e, index)}
              >
                <option value="">Select Product</option>
                {products.map((product, idx) => (
                  <option key={idx} value={product.id}>{`${product.id}${product.name}${product.material ? ' - ' + product.material : ''}${product.color ? ', ' + product.color : ''}${product.size ? ', ' + product.size : ''}`}
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
              {item.unit && ( 
                <input
                    type="text"
                    name="unit"
                    placeholder="Unit"
                    value={item.unit}
                    onChange={(e) => handleItemChange(e, index)}
                />
      )}
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
          <button onClick={handleAddItem}>Add Item</button>
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
      </main>
    </div>
  );
}

export default CreateQuotation;
