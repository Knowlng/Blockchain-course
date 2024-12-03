import React, { Component } from 'react'
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavigationMenu from './NavigationMenu/NavigationMenu.js';
import LayoutManager from './LayoutManager/LayoutManager.js';
import AddProduct from './AddProduct/AddProduct.js';
import Main from './Main/Main';

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
      this.setState({ marketplace });
      this.setState({ loading: false });
    } else {
      window.alert('Marketplace contract not deployed to detected network');
    }
  }

  createProduct = (name, price) => {
    this.setState({ loading: true });

    this.state.marketplace.methods
      .createProduct(name, price)
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        console.log("Transaction Hash:", hash);
      })
      .on('receipt', (receipt) => {
        console.log("Transaction Successful:", receipt);
        this.setState({ loading: false });
      })
      .on('error', (error) => {
        console.error("Transaction Failed:", error);
        this.setState({ loading: false });
      });
  };


  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }
    this.createProduct = this.createProduct.bind(this);
  }

  render() {
    return (
      <Router>
        <div>
          <LayoutManager
            account={this.state.account}
            loading={this.state.loading}
            Navigation={NavigationMenu}
            Content={() => (
            <Switch>
              <Route exact path="/" component={Main} />
              <Route 
              path="/addProduct" 
              render={(props) => (
                <AddProduct {...props} createProduct={this.createProduct} />
              )}
          />
            </Switch>
          )}
          />
        </div>
      </Router>
    );
  }
}

export default App;
