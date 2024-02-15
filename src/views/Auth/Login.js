import React from 'react'
import AuthServices from '../../api/auth/AuthServices'

function Login() {
  const login = async () => {
    const obj = {
      email: "sajid.ahmed2816@gmail.com",
      password: "123456"
    }
    try {
      const result = await AuthServices.login(obj);
      console.log("result =>", result)
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <p>
        Login
      </p>
      <button onClick={login}>Login</button>
    </div>
  )
}

export default Login