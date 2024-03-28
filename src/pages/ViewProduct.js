import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  where,
  query,
} from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import "./css/ViewProduct.css";

function ViewProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productOwns, setProductOwns] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "product", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    const fetchProductOwns = async () => {
      try {
        console.log(id);
        const productOwnsCollectionRef = collection(db, "productOwn");
        const productOwnsSnapshot = await getDocs(productOwnsCollectionRef);

        //const querySnapshot = await getDocs(query(productOwnsCollectionRef, where("prodID", "==", "prodID", "==", id)));
        let list = [];
        //const productDocRef = doc(db, "product", id);
         productOwnsSnapshot.docs.forEach(async (doc) => {
          // Get the data of the document
          const data = doc.data();
          // Get the venID reference from the document data
          const venIDRef = data.venID;
          // Get the document data of the venID reference
          const venderID = venIDRef.id;
          const venIDDoc = await getDoc(venIDRef);
          // Get the data from the venID document
          const venIDData = venIDDoc.data();
            

          const productIdRef = data.prodID;
          
            if(productIdRef.id === id){
               list.push({ id: venderID, ...data ,name:venIDData.name,phone:venIDData.phone});
            }

         //  console.log("vendorID = " ,venderID);
          
          
            
          

          //list.push({ id: doc.id, ...doc.data()});

          setProductOwns(list);
        });
      } catch (error) {
        console.error("Error fetching productOwns:", error);
      }
    };

    fetchProduct();
    fetchProductOwns();
  }, [id]);
  console.log("Product Data:", product);
  console.log("productOwn", productOwns);
  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="Head-Name"> Product List - {id} </h1>

      <div className="ID-Head">ProductID {id}</div>
      <div className="view-product">
        <div className="View-product-info">
          <div className="view-product-info">
            Product
            <div className="view-Product-ID">
              <label htmlFor="view-productID">ProductID</label>
              <label className="view-productID-r">{id}</label>
            </div>
            <div className="view-Product-Name">
              <label htmlFor="view-productName">Name</label>
              <label className="view-productName-r">
                {product.productName}
              </label>
            </div>
          </div>
          <div className="view-Description-info">
            Description
            <div className="view-Material">
              <label htmlFor="material">Material</label>
              <label>{product.material}</label>
            </div>
            <div className="view-Color">
              <label htmlFor="color">Color</label>
              <label>{product.color}</label>
            </div>
            <div className="view-Size">
              <label htmlFor="size">Size</label>
              <label>{product.size}</label>
            </div>
            <div className="view-Unit">
              <label htmlFor="unit">Unit</label>
              <label>{product.unit}</label>
            </div>
          </div>
        </div>
        <div className="view-Product-Own">
          <div className="view-Product-Own-Info">Product Own</div>

          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={productOwns || {}}
              columns={[
                { field: "id", headerName: "Vendor ID", width: 200 },
                { field: "name", headerName: "Name", width: 400 },
                { field: "phone", headerName: "Phone Number", width: 300 },
                { field: "unitPrice", headerName: "Unit price", width: 100 },
                { field: "savedDate", headerName: "Saved Date", width: 200 },
              ]}
              pageSize={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProduct;
