import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import "./css/Product_list.css";
import { useNavigate } from "react-router-dom";

function Product_list() {

  const navigate = useNavigate(); //navigate  ใช้สำหรับการเปลี่ยนหน้า

  const [menuActive, setMenuActive] = useState(true); // state สำหรับ Navbar

  const [search, setSearch] = useState(""); // state สำหรับการ Search

  const [product, setProduct] = useState([]); // state สำหรับ product

  
//----------------------------------------------- จัดการกับการเปลี่ยนค่าใน Search ----------------------------------------------------------------
  const handleSearch = (event) => {
    setSearch(event.target.value);
  };
  
  useEffect(() => {

// ---------------------------------------------- ดึงข้อมูล Product ------------------------------------------------------------------------
    const addtolist = onSnapshot(
      collection(db, "product"),
      (snapShot) => {
        let list = []; // สร้าง array สำหรับเก็บ Object แต่ละตัวของ Product
        snapShot.docs.forEach((doc) => { // loop เพื่อเพิ่ม Object ลง array
          list.push({ id: doc.id, ...doc.data() }); //เพิ่ม Object ลง array
        });
        setProduct(list); //set product State ด้วยค่าใน array
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      addtolist();
    };
  }, []);

 // --------------------------------------------------Setting Column ในตาราง-----------------------------------------------------------
  const ProductColumns = [

    { field: "id", // กำหนด field สำหรับนำค่าจาก state มา match
    headerName: "Product ID", //กำหนดชื่อ Column
    width: 300, //กำหนดความกว้าง
    renderCell:(params) => { // เมื่อกด productID จะสามารถ link ไปที่หน้า ViewProduct
      return(
        <div>
          <Link className="Product-list-link" to= {`/ViewProduct/${params.row.id}`}>{params.value}</Link>
        </div>
      );
    }
   },
    {
      field: "productName", // กำหนด field สำหรับนำค่าจาก state มา match
      headerName: "Name", //กำหนดชื่อ Column
      width: 400, //กำหนดความกว้าง
    },
    {
      field: "size", // กำหนด field สำหรับนำค่าจาก state มา match
      headerName: "Size", //กำหนดชื่อ Column
      width: 300, //กำหนดความกว้าง
    },

    {
      field: "unit", // กำหนด field สำหรับนำค่าจาก state มา match
      headerName: "Unit", //กำหนดชื่อ Column
      width: 300, //กำหนดความกว้าง
    },
  ];

  // ---------------------------------------------------------- H T M L ---------------------------------------------------------------
  return (

    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
      <div className="product-list">
        <div className="product-listContainer">
          <div className="product-datatable">
            <div className="product-datatableTitle">
              <h1>Product list</h1>
              <Link to="/Addproduct" className="add-product-link">
                add product
              </Link>
            </div>
            <div className='product-Search'>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <DataGrid
              className="product-datagrid"
              rows={product.filter((row) =>
                row.id.toLowerCase().includes(search.toLowerCase()) ||
                row.productName.toLowerCase().includes(search.toLowerCase())
              )}
              columns={ProductColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product_list;
