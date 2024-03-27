import Navbar from "../components/Navbar";
import React from 'react';
import { Link, useParams  } from 'react-router-dom';
import { useUser } from './UserContext';

function Home(){
   const { username } = useUser();
   console.log("Username in Home:", username);
   return (
      <div>
         <Navbar />
         <h1>Home page, {username}</h1>
 
       <br />
       <Link to={`/quotation`}>
        <button>Quotation</button>
      </Link>
      <br />
      <Link to={`/product`}>
        <button>Product</button>
      </Link>
       </div>
   );
}

export default Home;
