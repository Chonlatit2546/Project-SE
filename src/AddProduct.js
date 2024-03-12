import React from "react";
import Navbar from "./components/Navbar";
import "./AddProduct.css";
import { IoIosAddCircle } from "react-icons/io";
import { useState } from "react";

function AddProduct() {
  const [AddProductOwn, setAddProductOwn] = useState(false);

  return (
    <div>
      <Navbar />
      <h1 className="Head-Topic"> Add product</h1>

      <div className="">
        <form>
          <div className="Product">
            <div className="Product-info">
              Product
              <div className="Product-ID">
                <label htmlFor="productID">ProductID</label>
                <input type="text" id="productID" />
              </div>
              <div className="Product-Name">
                <label htmlFor="productName">Name</label>
                <input type="text" id="productName" />
              </div>
            </div>
            <div className="Description">
              Description
              <div className="Material">
                <label htmlFor="material">Material</label>
                <input type="text" id="material" />
              </div>
              <div className="Color">
                <label htmlFor="color">Color</label>
                <input type="text" id="color" />
              </div>
              <div className="Size">
                <label htmlFor="size">Size</label>
                <input type="text" id="size" />
              </div>
              <div className="Unit">
                <label htmlFor="unit">Unit</label>
                <input type="text" id="unit" />
              </div>
            </div>
          </div>
          <div className="Product-Own">
            <div className="Product-Own-Info">
              Product Own
              <div className="VendorID">
                <label htmlFor="vendorID">VendorID</label>
                <input type="text" id="vendorID"></input>
              </div>
              <div className="SavedDate">
                <label htmlFor="saveDate">Saved Date</label>
                <input type="date" id="saveDate"></input>
              </div>
              <div className="UnitPrice">
                <label htmlFor="unitPrice">Unit Price</label>
                <input type="text" id="unitPrice"></input>
              </div>
              <div className="AddmoreProductOwn">
                <IoIosAddCircle onClick={() => setAddProductOwn(true)} />
                <label className="add">Add more Product Own</label>
                {AddProductOwn && (
                  <div className="addVendor">
                    <div className="addVendorID">
                      <label htmlFor="vendorID">VendorID</label>
                      <input type="text" id="vendorID"></input>
                    </div>
                    <div className="AddSaveDate">
                      <label htmlFor="addSaveDate">Saved Date</label>
                      <input type="date" id="saveDate"></input>
                    </div>
                    <div className="AddUnitPrice">
                      <label htmlFor="addUnitPrice">Unit Price</label>
                      <input type="text" id="unitPrice"></input>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <footer className="Footer">
        <hr></hr>
        <div className="footer-manage">
          <div>
            <label>ProductID {}</label>
          </div>

          <div className="Submit-Button">
            <div className="Cancle">
              <button>Cancle</button>
            </div>
            <div className="Add-Product-Button">
              <button type="Submit">Add Product</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AddProduct;
