import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoc, doc, deleteDoc } from 'firebase/firestore';
import './css/QuotationDetails.css';
import { db } from '../firebase'; 
import Navbar from "../components/Navbar";
import { PDFDownloadLink } from '@react-pdf/renderer';
import FormPDF from './FormPDF';

function QuotationDetails() {
  const { id } = useParams();
  const [productPOData, setProductPOData] = useState(null);
  const [quotationData, setQuotationData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);


  useEffect(() => {
    const fetchQuotationAndProductPOData = async () => {
      try {
        // Fetch product PO data
        const productPODocRef = doc(db, 'productPO', id);
        const productPOSnapshot = await getDoc(productPODocRef);
  
        if (!productPOSnapshot.exists()) {
          throw new Error('Product PO document does not exist');
        }
  
        const productPOData = productPOSnapshot.data();
        setProductPOData(productPOData);
  
        // Fetch quotation data
        const quotationNoRef = productPOData.quotationNo;
        const quotationNoDoc = await getDoc(quotationNoRef);
        
  
        if (!quotationNoDoc.exists()) {
          throw new Error('Quotation document does not exist');
        }
  
        const quotationNoData = { id: quotationNoRef.id, ...quotationNoDoc.data() };
        setQuotationData(quotationNoData);
  
        // Fetch product data for each product in product PO
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
  
        const resolvedProductData = await Promise.all(productDataPromises);
        setProductData(resolvedProductData);
  
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
    if (productData.length > 0) {
      const calculatedTotal = productData.reduce((acc, product, index) => {
        const productNo = `productNo${index + 1}`;
        return acc + productPOData[productNo].quantity * productPOData[productNo].unitPrice;
      }, 0);
      setTotal(calculatedTotal.toFixed(2));
      
      const calculatedVat = calculatedTotal * 0.07;
      setVat(calculatedVat.toFixed(2));

      const calculatedGrandTotal = calculatedTotal + calculatedVat;
      setGrandTotal(calculatedGrandTotal.toFixed(2));
    }
  }, [productData, productPOData]);

  const handleDeleteQuotation = async (quotationId) => {
    try {
      await deleteDoc(doc(db, 'productPO', quotationId));
      setProductData(productData.filter(quotation => quotation.id !== quotationId)); // Fix this line
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
  };

  const handleConfirmation = (quotationId) => {
    setConfirmationDialogOpen(true);
    setQuotationToDelete(quotationId);
  };

  const confirmDelete = () => {
    handleDeleteQuotation(quotationToDelete);
    setConfirmationDialogOpen(false);
  };

  const cancelDelete = () => {
    setConfirmationDialogOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <Navbar />
      <header style={{ backgroundColor: '#9faed2', color: '#fff', padding: '10px' }}>
        <h1>Quotations - {quotationData.id} </h1>
        <div style={{ marginBottom: '20px' }}>
        <PDFDownloadLink className="download-btn"
          document={<FormPDF 
            quotationData={quotationData} 
            productData={productData} 
            productPOData={productPOData} 
            total={total}
            vat={vat}
            grandTotal={grandTotal}
          />}fileName={`quotation_${quotationData.id}.pdf`}
        >
          {({ blob, url, loading, error }) =>
            loading ? 'Loading document...' : 'Download'
          }
        </PDFDownloadLink>
        <div className="options-dropdown">
          <button className="options-btn">Options</button>
          <div className="options-dropdown-content">
            <Link to={`/EditQuotation/${quotationData.id}`} className="options-btn edit-btn">Edit Quotation</Link>
            <button onClick={() => handleConfirmation(quotationData.id)} className="options-btn cancel-btn">Cancel Quotation</button>
          </div>
        </div>
      </div>
      </header>
      <div>
        <h1>Quotation No. {quotationData.id}</h1>
        <p>Refer To: Issued Date: {quotationData.issuedDate} Expired Date: {quotationData.expiredDate}</p>
        <h3>Customer</h3> 
        <p>Customer Name: {quotationData.cusName} Customer Address: {quotationData.cusAddress || "-"} Customer Email: {quotationData.cusEmail || "-"}</p>
        <p>Customer Department: {quotationData.cusDepartment || "-"} Customer PhoneNumnber: {quotationData.cusPhoneNo}</p>
        <h3>Item | Description | Quantity | Unit | Unit Price | Amount</h3>
        {productData.map((product, index) => (
          <div key={index}>
            <p>{index + 1} {product.id} {product.productName} Color: {product.color} Material: {product.material} {productPOData[`productNo${index + 1}`].quantity} {product.unit} {productPOData[`productNo${index + 1}`].unitPrice} {productPOData[`productNo${index + 1}`].quantity * productPOData[`productNo${index + 1}`].unitPrice}</p>
          </div>
        ))}
        <h3>Summary</h3>
        <p>Total: {total} </p><p>VAT (7%): {vat}</p>
        <p> Grand Total: {grandTotal}</p>
      </div>
    </div>
  );
}

export default QuotationDetails;
