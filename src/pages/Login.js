import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { db } from '../firebase';
import Navbar from "../components/Navbar";
import { getDoc, doc } from 'firebase/firestore';
import './css/Login.css';

function Login() {
  const navigate = useNavigate();
  const { setUsername } = useUser();
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputs.username || !inputs.password) {
      console.log('Please enter username or password');
      alert('Please enter username or password');
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
        console.log('User:', username);
        setUsername(inputs.username);
        navigate(`/Home`);
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
    <div className="Form-Login">
      <Navbar />
      <form onSubmit={handleSubmit} className="login-box">
        <div className="input-box">
          <p>username</p>
          <input
            type="text"
            id="username"
            name="username"
            value={inputs.username || ''}
            onChange={handleChange}
          />
        </div>

        <div className="password-box">
          <p>password</p>
          <input
            type="password"
            id="password"
            name="password"
            value={inputs.password || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <button type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
