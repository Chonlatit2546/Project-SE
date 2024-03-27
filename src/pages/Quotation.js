import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import Navbar from "../components/Navbar";

function Quotation() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const quotationSnapshot = await getDocs(collection(db, 'productPO'));

        const quotationData = [];
        await Promise.all(quotationSnapshot.docs.map(async doc => {
          const data = doc.data();
          const quotationNoRef = data.quotationNo;
          if (!quotationNoRef) {
            throw new Error('Quotation reference is null or undefined');
          }
          const quotationNoId = quotationNoRef.id;
          console.log('quotationNoId:', quotationNoId);

          const quotationNoDoc = await getDoc(quotationNoRef);
          if (!quotationNoDoc.exists()) {
            throw new Error('Quotation document does not exist');
          }
          const quotationNoData = quotationNoDoc.data();
          console.log('quotationNoData:', quotationNoData);

          let grandTotal = 0;
          Object.keys(data).forEach(key => {
            if (key.startsWith('productNo')) {
              const product = data[key];
              const subtotalProduct = product.quantity * product.unitPrice;
              grandTotal += subtotalProduct;
              console.log('qNoData:', product);
            }
          });

          const vat = 0.07;
          grandTotal *= 1 + vat;

          const quotation = {
            id: doc.id,
            quotationNo: quotationNoId,
            cusName: quotationNoData.cusName,
            issuedDate: quotationNoData.issuedDate,
            expiredDate: quotationNoData.expiredDate, 
            grandTotal: grandTotal.toFixed(2)
          };

          quotationData.push(quotation);
        }));

        setQuotations(quotationData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quotations:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <Navbar />
      <h1>Quotation</h1>
      <table>
        <thead>
          <tr>
            <th>QuotationNo</th>
            <th>Customer Name</th>
            <th>Issued Date</th>
            <th>Expired Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map(quotation => (
            <tr key={quotation.id}>
              <td>
                <Link to={`/QuotationDetails/${quotation.id}`}>{quotation.quotationNo}</Link>
              </td>
              <td>{quotation.cusName}</td>
              <td>{quotation.issuedDate}</td>
              <td>{quotation.expiredDate}</td>
              <td>{quotation.grandTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Quotation;
