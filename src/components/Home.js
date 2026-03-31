import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Home = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-hero-title">
          Welcome to <span className="brand-accent">KRMN</span> & Associates
        </h1>
        <p className="home-hero-sub">
          Your trusted partner for accounting, tax compliance, and business advisory.
        </p>
        {!currentUser && (
          <Link to="/login" className="btn-hero">
            Sign In to Get Started
          </Link>
        )}
      </div>

      {currentUser && (
        <div className="home-cards">
          <Link to="/taskList" className="home-card">
            <div className="home-card-icon">&#128203;</div>
            <h3>Tasks</h3>
            <p>View, filter, and manage your work log</p>
          </Link>
          <Link to="/addTask" className="home-card">
            <div className="home-card-icon">&#10133;</div>
            <h3>New Task</h3>
            <p>Log a new task with time tracking</p>
          </Link>
          <Link to="/profile" className="home-card">
            <div className="home-card-icon">&#128100;</div>
            <h3>Profile</h3>
            <p>Manage your account and change password</p>
          </Link>
        </div>
      )}

      <div className="home-quote">
        <blockquote>
          "Failures are the stepping stones for <strong>success</strong>."
        </blockquote>
        <p className="home-quote-attr">— Thought for the Day</p>
      </div>
    </div>
  );
};

export default Home;
