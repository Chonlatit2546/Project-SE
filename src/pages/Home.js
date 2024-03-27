import Navbar from "../components/Navbar";
import React, { useState } from 'react';
import { useUser } from './UserContext';
import './css/Home.css';

function Home(){
  const { username } = useUser();
  console.log("Username in Home:", username);
  const [menuActive, setMenuActive] = useState(false);

  return (
     <div className={`container ${menuActive ? 'menu-active' : ''}`}>
        <Navbar setMenuActive={setMenuActive} />
        <div className="content">
          <h1>Home page, {username}</h1>
        </div>
     </div>
  );
}

export default Home;
