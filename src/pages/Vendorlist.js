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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const addtolist = onSnapshot(
      collection(db, "vendor"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setVendor(list);
        setLoading(false);
      },
      (error) => {
        console.log('Error fetching vendors:',error);
        setError(error);
        setLoading(false);
      }
    );

    return () => {
      addtolist();
    };
  }, []);
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Vendor?");
    if(confirmDelete){
      try {
        await deleteDoc(doc(db, "vendor", id));
        setVendor(vendor.filter((item) => item.id !== id));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 230,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/VendorDetails/${params.row.id}`} style={{ textDecoration: "none" }}>
              <div className="viewButtonVen">View</div>
            </Link>
            <div
              className="deleteButtonVen"
              onClick={() => handleDelete(params.row.id)}>
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  const vendorColumns = [
    { field: "id", headerName: "Vendor ID", width: 150 },
    {
      field: "name",
      headerName: "Name",
      width: 180,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      width: 180,
    },

    {
      field: "type",
      headerName: "Vendor Type",
      width: 180,
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
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
        <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
        <div className="list">
            <div className="listContainer">
                <div className="datatable">
                    <div className="datatableTitle">
                        <h1>Vendor list</h1>
                        <Link to="/Addvendor" className="link">
                            Add Vendor
                        </Link>
                    </div>
                    <div style={{ width: '100%' }}>
                        <DataGrid
                            rows={vendor}
                            columns={vendorColumns.concat(actionColumn)}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 10 },
                                },
                            }}     
                            pageSizeOptions={[5, 10]}
                            checkboxSelection
                        />
                    </div>
                </div>
            </div>
        </div>
     </div>
);
}

export default Vendorlist;
