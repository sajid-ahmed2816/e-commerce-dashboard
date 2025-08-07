import { useState } from "react";

function useProvideAuth() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [name, setName] = useState(localStorage.getItem("name"));
  const [picture, setPicture] = useState(localStorage.getItem("picture"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // *User
  const userLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    localStorage.setItem("picture", data.image);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    setToken(data.token);
    setName(data.name);
    setPicture(data.image);
    setEmail(data.mail);
    setRole(data.role);
  };

  const userLogout = async () => {
    setToken(null);
    setName(null);
    setPicture(null);
    setEmail(null);
    setRole(null);
    localStorage.clear();
  };

  return {
    token,
    name,
    picture,
    email,
    role,
    userLogin,
    userLogout,
  };
}

export default useProvideAuth;
