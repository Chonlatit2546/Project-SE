import Navbar from "../components/Navbar";
import React , { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import "./css/SearchReceipt.css";



function SearchReceipt() {

    const [receipt, setreceipt] = useState([]);
    const [menuActive, setMenuActive] = useState(true);
    
    useEffect(() => {
        const fetchreceipt = async () => {
          try {
            const receiptcollection = collection(db,'receipt')
    
            ///real-time collection data
            const adddataRE = onSnapshot(receiptcollection,async (snapshot) => {
              
              const receiptData = snapshot.docs.map(async (doc) => {
                
                const reData = doc.data();
    
                //reference PO table
                const PORef = reData.POref;
                const PODoc = await getDoc(PORef);
                const POData = PODoc.data();

                //reference productPO table
                const productPORef = POData.productPO;
                const productPODoc = await getDoc(productPORef);
                const productPOData = productPODoc.data();
    
                //reference quotation table
                const quotationRef = productPOData.quotationNo;
                const quotationDoc = await getDoc(quotationRef);
                const quotationData = quotationDoc.data();
    
                let grandTotal = 0;
                Object.keys(productPOData).forEach(key => {
                if (key.startsWith('productNo')) {
                  const product = productPOData[key];
                  const subtotalProduct = product.quantity * product.unitPrice;
                  grandTotal += subtotalProduct;
                  console.log('qNoData:', product);
                }
                });

                const vat = 0.07;
                grandTotal *= 1 + vat;
    
                return{
                  id:doc.id,
                  customerId: quotationData?.cusName || 'Unknown',
                  issuedDate: reData.issuedDate,
                  amount: grandTotal.toFixed(2),
                  status: reData.status,
                  
                };
              });
              Promise.all(receiptData).then((data) => setreceipt(data))
              
    
            });
    
            return () => {
              adddataRE()
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
    
        fetchreceipt();
    
    
      }, []);
    
      const actionColumn = {
        field: "action",
          headerName: "Action",
          width: 200,
          renderCell: (params) => {
              const status = params.row.status;
              const id = params.row.id;
    
              if(status === "Closed"){
                return(
                  <div>
                    <Link to={`/PurchaseOrderDetails/${id}`}>Details</Link>
                  </div>
                );
              }
              else if(status === "waiting for cheque cleared"){
                return(
                  <div>
                    <Link to={`/CreateReceipt/${id}`}>Cheque cleared</Link>
                  </div>
                );
              }
              else{
                return(
                  <div>
                    <Link to={`/ApproveReceipt/${id}`}>approve</Link>
                  </div>
                );
                
              }
          }
      }

    const columns = [
        { field: "id",
         headerName: "RE Number",
          width: 230 
        },
    
        { field: "customerId",
         headerName: "Customer", 
         width: 230 
        },
    
        { field: "issuedDate", 
        headerName: "Issued Date", 
        width: 230 
        },
    
        
    
        { field: "amount", 
        headerName: "Amount", 
        width: 230 
        },

        { field: "status"
        , headerName: "Status"
        , width: 320,
          renderCell: (params) => {
            const status = params.row.status;
    
            if(status === "Closed"){
              return <span style={{ color: "green" }}>{status}</span>;
    
            }
            else if(status === "waiting for cheque cleared"){
              return <span style={{ color: "blue" }}>{status}</span>;
            }
            else{
              return <span style={{ color: "turquoise" }}>{status}</span>;
            }
          } 
    
        },

    ];
    return (
        <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
        <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
        <div className="list">
          <div className="listContainer">
            <div className="datatable">
              <div className="datatableTitle">
                <h1>Receipt</h1>
              </div>
              <div >
                {receipt.length > 0 ? (
                  <DataGrid className="re-table"
                  rows={receipt} 
                  columns={columns.concat(actionColumn)} 
                  pageSize={10} 
                  rowsPerPageOptions={[10]}
                  
                  
                  
                  />
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default SearchReceipt;