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
    
    //------------------------ดึงข้อมูลจากฐานข้อมูลเข้ามาใช้-----------------------------------
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
    
      
    //----------------------------------หัวข้อ Columns------------------------------------
    const columns = [
        { field: "id",
         headerName: "RE Number",
          width: 230 ,
          renderCell: (params) => {
            const status = params.row.status;
            const id = params.row.id;
  
            if(status === "Closed"){
              return(
                <div>
                  <Link to={`/ReceiptDetail/${id}`}>{params.value}</Link>
                </div>
              );
            }
            
            else if(status === "On Hold" || status === "Draft"){
              return(
                <div>
                  <Link to={`/ApproveReceipt/${id}`}>{params.value}</Link>
                </div>
              );
              
            }
        }
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
            else if(status === "On Hold"){
              return <span style={{ color: "blue" }}>{status}</span>;
            }
            
            else if(status === "Draft"){
              return <span style={{ color: "gray" }}>{status}</span>;
            }
            else{
              return '' ;
            }
          } 
    
        },

    ];

    //--------------------------------HTML----------------------------------------
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
                  columns={columns} 
                  pageSize={10} 
                  rowsPerPageOptions={[10]}
                  
                  
                  
                  />
                ) : (
                  <div class="loader"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default SearchReceipt;