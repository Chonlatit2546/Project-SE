import React, { useState } from 'react';

const users = [
  {
    userName: "aaaa",
    password: "1234",
  },
  {
    userName: "bbbb",
    password: "5678",
  },
  {
    userName: "cccc",
    password: "mmmm",
  },
];

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const check = () => {
    const user = users.find((user) => user.userName === username);

    if (user && user.password === password) {
      alert("Login successful!");
    } else {
      alert("Invalid username or password!");
    }
  };

  return (
    <div>
      <p>username</p>
      <div className="input-box">
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <p>password</p>

      <div className="password-box">
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <br />

      <div>
        <button type="submit" onClick={check}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;