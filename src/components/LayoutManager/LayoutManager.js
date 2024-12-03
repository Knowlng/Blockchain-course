import React from 'react';
import "./LayoutManager.css";
import SpinnerElement from '../Spinner/SpinnerElement';


function LayoutManager({account, loading, Navigation, Content, marketplace}) {
  return (
    <div className="content-wrapper">
        <div className="header">
            <Navigation account={account}/>
        </div>
        <main>
            {loading ?  <SpinnerElement/> :  <Content/>}
        </main>
    </div>
  );
}

export default LayoutManager;
