import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc } from 'firebase/firestore';
import "./css/Login.css";

function Login() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputs.username || !inputs.password) {
      console.log("Please enter username or password");
      alert("Please enter username or password");
      return;
    }

   const { username, password } = inputs;
  try {
    const userDocRef = doc(db, 'account', username);
    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      console.log('User not found');
      alert('Invalid username or password');
      return;
    }

    const userData = userDocSnapshot.data();

    if (userData.password === password) {
      console.log('Login successful!');
      navigate('/Home');
    } else {
      console.log('Invalid password');
      alert('Invalid username or password');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setInputs({ username: '', password: '' });
  }
};


  return (
    <form onSubmit={handleSubmit} className="Form-Login">
      <div className="div-parent">
        <h1>Login</h1>
        <div className="input-box">
          username
          <input
            type="text"
            id="username"
            name="username"
            value={inputs.username || ""}
            onChange={handleChange}
          />
        </div>

        <div className="password-box">
          password
          <input
            type="password"
            id="password"
            name="password"
            value={inputs.password || ""}
            onChange={handleChange}
          />
        </div>

        <br />

        <div>
          <button type="submit" className="Login-Button">Login</button>
        </div>
      </div>
    </form>
  );
}

export default Login;