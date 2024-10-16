import React, { Component } from 'react'
import Web3 from 'web3';
import './App.css';
import Marketplace from '../abis/Marketplace.json';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.currentProvider);
    } else {
      console.log('Non-Ethereum browser detected');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if(networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
      console.log(marketplace);
    } else {
      window.alert('Marketplace contract not deployed to detected network');
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }
  }

  render() {
    return (
      <p>{this.state.account}</p>
    );
  }
}

export default App;
