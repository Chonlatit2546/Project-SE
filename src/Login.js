import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const users = [
  {
    userName: "admin",
    password: "admin",
  },
  {
    userName: "admin1",
    password: "admin1",
  },
  {
    userName: "admin2",
    password: "admin2",
  },
];

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
    
    const user = users.find((user) => user.userName === inputs.username);

  
    if (user && user.password === inputs.password) {
      console.log('Login successful!');
      navigate('./Home')
    } else {
      console.log('Invalid username or password!');
    }

    console.log(inputs)
  }

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