import Navbar from '../components/Navbar';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, } from "firebase/firestore";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import "./css/Vendorlist.css"

function Vendorlist() {
  const [vendor, setVendor] = useState([]);
  const [menuActive, setMenuActive] = useState(true);

  useEffect(() => {

    const addtolist = onSnapshot(
      collection(db, "vendor"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setVendor(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      addtolist();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "vendor", id));
      setVendor(vendor.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/VendorDetails/${params.row.id}`}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  const vendorColumns = [
    { field: "id", headerName: "Vendor ID", width: 230 },
    {
      field: "name",
      headerName: "Name",
      width: 230,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      width: 230,
    },

    {
      field: "type",
      headerName: "Vendor Type",
      width: 230,
      renderCell: (params) => {
        return (
          <div className={`cellWithType ${params.row.type}`}>
            {params.row.type}
          </div>
        );
      },
    },
  ];


  return (
    // <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
    //     <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
        <div className="list">
            <div className="listContainer">
                <div className="datatable">
                    <div className="datatableTitle">
                        <h1>Vendor list</h1>
                        <Link to="/Addvendor" className="link">
                            Add Vendor
                        </Link>
                    </div>
                    <div style={{height: 550, width: '100%' }}>
                        <DataGrid
                            rows={vendor}
                            columns={vendorColumns.concat(actionColumn)}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 10 },
                                },
                            }}     
                            checkboxSelection
                        />
                    </div>
                </div>
            </div>
        </div>
    // </div>
);
}

export default Vendorlist;
