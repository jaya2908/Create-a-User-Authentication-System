import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const { user, logout } = useContext(AuthContext); // Access user info and logout function
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(res.data);
      } catch (err) {
        logout(); // Logout if the token is invalid or expired
        navigate("/login");
      }
    };

    if (user) {
      fetchUserDetails();
    } else {
      navigate("/login");
    }
  }, [user, logout, navigate]);

  if (!userDetails) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {userDetails.username}!</p>
      <p>Email: {userDetails.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
