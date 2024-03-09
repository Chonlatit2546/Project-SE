import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({...values, [name]: value}));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    try {
      const response = await axios.post('http://192.168.1.114/sedb/login.php', {
        username: inputs.username,
        password: inputs.password,
      });

      if (response.data === 'Login Successfully') {
        console.log('Login successful!');
        navigate('/Home');
      } else {
        console.log('Invalid username or password!');
        alert("Invalid username or password");
      }
    } catch (error) {
      console.error('Error:', error);
    }finally {
      setInputs({ username: '', password: '' });
    }
  };
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');

  

  // const check = () => {
  //   const user = users.find((user) => user.userName === username);

  //   if (user && user.password === password) {
  //     alert("Login successful!");
  //   } else {
  //     alert("Invalid username or password!");
  //   }
  // };

  return (
    // <div>
    //   <p>username</p>
    //   <div className="input-box">
    //     <input
    //       type="text"
    //       id="username"
    //       value={username}
    //       onChange={(e) => setUsername(e.target.value)}
    //     />
    //   </div>

    //   <p>password</p>

    //   <div className="password-box">
    //     <input
    //       type="password"
    //       id="password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //     />
    //   </div>

    //   <br />

    //   <div>
    //     <button type="submit" onClick={check}>
    //       Login
    //     </button>
    //   </div>
    // </div>



    <form onSubmit= {handleSubmit}>
      <p>username</p>
      <div className="input-box">
        <input
          type = "text"
          id = "username"
          name="username"
          value = {inputs.username || ''}
          onChange= {handleChange}
        />
      </div>

      <p>password</p>

      <div className="password-box">
        <input
          type = "password"
          id = "password"
          name="password"
          value = {inputs.password || ''}
          onChange = {handleChange}
        />
      </div>

      <br />

      <div>
        <button type="submit" >
          Login
        </button>
      </div>
    </form>
  );
}

export default Login;
