import React from 'react'
import './Main.css';
import landingIcon from '../../assets/landing-icon.png';

function Main() {
  return (
    <div className="main-wrapper">
      <h1>Welcome to Blockchain Marketplace</h1>
      <p>Use The menu bar to navigate to your desired page</p>
      <div className="picture-wrapper">
        <img className="landing-picture" src={landingIcon} alt="landing" />
      </div>
    </div>
  );
}

export default Main;