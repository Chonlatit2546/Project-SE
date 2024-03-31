import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useUser } from './UserContext';
import { Link } from 'react-router-dom';
import { DataGrid } from "@mui/x-data-grid";
import { collection, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Import your Firebase configuration

import './css/Home.css';
import './css/Quotation.css';

function Home() {
  const { username } = useUser();
  console.log("Username in Home:", username);
  const [menuActive, setMenuActive] = useState(true);
  const [combinedData, setCombinedData] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(''); // Assuming you use 'id' somewhere in your component
  const [quotations, setQuotations] = useState([]);
  const [product, setProduct] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [receipt, setReceipt] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); // Track sort order
  const [sortColumn, setSortColumn] = useState('issuedDate');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCombinedData();
  }, []);
  
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const quotationData = await fetchQuotationData();
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
  
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const pocollection = collection(db, 'po');
  
        // Real-time collection data
        const adddataPO = onSnapshot(pocollection, async (snapshot) => {
          const purchaseOrdersData = await Promise.all(snapshot.docs.map(async (doc) => {
            const poData = doc.data();
  
            // Reference productPO table
            const productPORef = poData.productPO;
            const productPODoc = await getDoc(productPORef);
            const productPOData = { id: productPORef.id, ...productPODoc.data() };
  
            // Reference quotation table
            const quotationRef = productPOData.quotationNo;
            const quotationDoc = await getDoc(quotationRef);
            const quotationData = quotationDoc.data();
  
            let grandTotal = 0;
            Object.keys(productPOData).forEach((key) => {
              if (key.startsWith('productNo')) {
                const product = productPOData[key];
                const subtotalProduct = product.quantity * product.unitPrice;
                grandTotal += subtotalProduct;
              }
            });
  
            const vat = 0.07;
            grandTotal *= 1 + vat;
  
            return {
              id: doc.id,
              ponumber: doc.id,
              customerId: quotationData?.cusName || 'Unknown',
              expiredDate: poData.expiredDate,
              issuedDate: poData.issuedDate,
              amount: grandTotal.toFixed(2),
              status: poData.status,
            };
          }));
  
          setPurchaseOrders(purchaseOrdersData);
        });
  
        return () => {
          adddataPO();
        };
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchPurchaseOrders();
  }, []);
  useEffect(() => {
    const fetchReceipt = async () => {
        try {
            const receiptCollection = collection(db, 'receipt');

            // Real-time collection data
            const unsubscribe = onSnapshot(receiptCollection, async (snapshot) => {
                const receiptData = snapshot.docs.map(async (doc) => {
                    const reData = doc.data();

                    // Reference PO table
                    const PORef = reData.POref;
                    const PODoc = await getDoc(PORef);
                    const POData = PODoc.data();

                    // Reference productPO table
                    const productPORef = POData.productPO;
                    const productPODoc = await getDoc(productPORef);
                    const productPOData = productPODoc.data();

                    // Reference quotation table
                    const quotationRef = productPOData.quotationNo;
                    const quotationDoc = await getDoc(quotationRef);
                    const quotationData = quotationDoc.data();

                    let grandTotal = 0;
                    Object.keys(productPOData).forEach(key => {
                        if (key.startsWith('productNo')) {
                            const product = productPOData[key];
                            const subtotalProduct = product.quantity * product.unitPrice;
                            grandTotal += subtotalProduct;
                        }
                    });

                    const vat = 0.07;
                    grandTotal *= 1 + vat;

                    return {
                        id: doc.id,
                        customerId: quotationData?.cusName || 'Unknown',
                        issuedDate: reData.issuedDate,
                        amount: grandTotal.toFixed(2),
                        status: reData.status,
                    };
                });

                Promise.all(receiptData).then((data) => setReceipt(data));
            });

            return () => {
                unsubscribe();
            };
        } catch (error) {
            console.error("Error fetching receipt data:", error);
        }
    };

    fetchReceipt();
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const receiptData = await fetchSearchReceiptData();
        setReceipt(receiptData);
      } catch (error) {
        console.error('Error fetching receipt data:', error);
      }
    };
  
    fetchData();
  }, []);
  
  
  const fetchCombinedData = async () => {
    try {
      const quotationData = await fetchQuotationData();
      const purchaseOrderData = await fetchPurchaseOrderData();
      const searchReceiptData = await fetchSearchReceiptData();
  
      const mergedData = [
        ...quotationData.map((item) => ({ ...item, type: 'Quotation' })),
        ...purchaseOrderData.map((item) => ({ ...item, type: 'Purchase Order' })),
        ...searchReceiptData.map((item) => ({ ...item, type: 'Receipt' })),
      ];
  
      // Combine all data types
      const allData = [
        ...quotationData.map((item) => ({ ...item, type: 'Quotation' })),
        ...purchaseOrderData.map((item) => ({ ...item, type: 'Purchase Order' })),
        ...searchReceiptData.map((item) => ({ ...item, type: 'Receipt' })),
      ];
  
      setCombinedData({
        all: allData,
        quotation: quotationData,
        purchaseOrder: purchaseOrderData,
        receipt: searchReceiptData,
      });
    } catch (error) {
      console.error('Error fetching combined data:', error);
      setError(error);
    }
  };
  

  const fetchQuotationData = async () => {
    try {
      const quotationSnapshot = await getDocs(collection(db, 'productPO'));
      const quotationData = await Promise.all(quotationSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const quotationNoRef = data.quotationNo;
        if (!quotationNoRef) {
          throw new Error('Quotation reference is null or undefined');
        }
        const quotationNoId = quotationNoRef.id;
        const quotationNoDoc = await getDoc(quotationNoRef);
        if (!quotationNoDoc.exists()) {
          throw new Error('Quotation document does not exist');
        }
        const quotationNoData = quotationNoDoc.data();
    
        let grandTotal = 0;
        Object.keys(data).forEach(key => {
          if (key.startsWith('productNo')) {
            const product = data[key];
            const subtotalProduct = product.quantity * product.unitPrice;
            grandTotal += subtotalProduct;
          }
        });
    
        const vat = 0.07;
        grandTotal *= 1 + vat;
    
        return {
          id: doc.id,
          No: quotationNoId,
          type: 'Quotation',
          cusName: quotationNoData.cusName,
          issuedDate: quotationNoData.issuedDate,
          expiredDate: quotationNoData.expiredDate, 
          grandTotal: grandTotal.toFixed(2),
          status: quotationNoData.status
        };
      }));
      return quotationData;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  };

  const fetchPurchaseOrderData = async () => {
    try {
      const poCollectionRef = collection(db, "po");
      const poSnapshot = await getDocs(poCollectionRef);
      const purchaseOrdersData = await Promise.all(poSnapshot.docs.map(async (doc) => {
        const data = doc.data();
  
        // Reference productPO table
        const productPORef = data.productPO;
        const productPODoc = await getDoc(productPORef);
        const productPOData = productPODoc.data();
  
        // Reference quotation table
        const quotationRef = productPOData.quotationNo;
        const quotationDoc = await getDoc(quotationRef);
        const quotationData = quotationDoc.data();
  
        let grandTotal = 0;
        Object.keys(productPOData).forEach((key) => {
          if (key.startsWith('productNo')) {
            const product = productPOData[key];
            const subtotalProduct = product.quantity * product.unitPrice;
            grandTotal += subtotalProduct;
          }
        });
  
        const vat = 0.07;
        grandTotal *= 1 + vat;
  
        return {
          id: doc.id,
          No: doc.id,
          type: 'Purchase Order',
          cusName: quotationData?.cusName || "Unknown",
          issuedDate: data.issuedDate,
          expiredDate: data.expiredDate,
          grandTotal: grandTotal.toFixed(2),
          status: data.status,
        };
      }));
      return purchaseOrdersData;
    } catch (error) {
      console.error("Error fetching purchase orders data:", error);
      throw error;
    }
  };
  
  const fetchSearchReceiptData = async () => {
    try {
      const receiptCollectionRef = collection(db, 'receipt');
      const snapshot = await getDocs(receiptCollectionRef);
      const receiptData = await Promise.all(snapshot.docs.map(async (doc) => {
        const reData = doc.data();
        const PORef = reData.POref;
        const PODoc = await getDoc(PORef);
        const POData = PODoc.data();
        const productPORef = POData.productPO;
        const productPODoc = await getDoc(productPORef);
        const productPOData = productPODoc.data();
        const quotationRef = productPOData.quotationNo;
        const quotationDoc = await getDoc(quotationRef);
        const quotationData = quotationDoc.data();
        let grandTotal = 0;
        Object.keys(productPOData).forEach((key) => {
          if (key.startsWith('productNo')) {
            const product = productPOData[key];
            const subtotalProduct = product.quantity * product.unitPrice;
            grandTotal += subtotalProduct;
          }
        });
        const vat = 0.07;
        grandTotal *= 1 + vat;
        return {
          id: doc.id,
          No: doc.id,
          type: 'Receipt',
          quoNo: quotationData?.quotationNo || '',
          ponumber: POData?.ponumber || '',
          cusName: quotationData?.cusName || 'Unknown',
          issuedDate: POData?.issuedDate || '',
          expiredDate: POData?.expiredDate || '',
          grandTotal: grandTotal.toFixed(2),
          status: reData?.status || 'Unknown',
        };
      }));
      return receiptData;
    } catch (error) {
      console.error('Error fetching receipt data:', error);
      throw error;
    }
  };
  
  const handleSort = (column) => {
    // Toggle sort order if same column is clicked
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, set new column and default to ascending order
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handleChangeTopic = (topic) => {
    setSelectedTopic(topic);
  };

  const sortedData = combinedData.all ? [...combinedData.all] : [];

  // Filter data based on selected topic
  const filteredData = selectedTopic === 'All' ? sortedData : sortedData.filter(item => item.type === selectedTopic);

  // Sort the filtered data based on the selected column and order
  filteredData.sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (sortOrder === 'asc') {
      return valA < valB ? -1 : valA > valB ? 1 : 0;
    } else {
      return valA > valB ? -1 : valA < valB ? 1 : 0;
    }
  });
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const columns = [
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'No', headerName: 'ID', width: 150 , renderCell: (params) => (
      <Link to={`/${params.row.type === 'Quotation' ? 'QuotationDetails' : params.row.type === 'Purchase Order' ? 'PurchaseOrderDetails' : 'ReceiptDetail'}/${params.row.id}`}>
        {params.value}
      </Link>
    )},
    { field: 'cusName', headerName: 'Customer', width: 200 },
    { field: 'issuedDate', headerName: 'Issued Date', width: 150 },
    { field: 'expiredDate', headerName: 'Expired Date', width: 150 },
    { field: 'grandTotal', headerName: 'Total', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
  ];
console.log(id)
  return (
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
      <Navbar setMenuActive={setMenuActive} />
      <div className="content" style={{ marginTop: '130px', marginLeft: '40px' }}> {/* Add margin top here */}
        <h1>Home</h1><br />
        <div>
          <label htmlFor="topic">Select Topic: </label>
          <select id="topic" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
            <option value="All">All</option>
            <option value="Quotation">Quotation</option>
            <option value="Purchase Order">Purchase Order</option>
            <option value="Receipt">Receipt</option>
          </select>
        </div><br />
        <div className='Searchquo'>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div style={{ height: 550, width: '100%' }}>
          <DataGrid
            rows={filteredData.filter((row) =>
              (row.quotationNo && row.quotationNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (row.ponumber && row.ponumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (row.id && row.id.toLowerCase().includes(searchTerm.toLowerCase())) 
            )}
            columns={columns}
            pageSize={10}
            checkboxSelection
          />
        </div>
      </div>
    </div>
  );
            }  

export default Home;
