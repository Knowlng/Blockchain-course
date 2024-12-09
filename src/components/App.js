import React, { Component } from 'react'
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import NavigationMenu from './NavigationMenu/NavigationMenu.js';
import LayoutManager from './LayoutManager/LayoutManager.js';
import AddProduct from './AddProduct/AddProduct.js';
import BrowseProducts from './BrowseProducts/BrowseProducts.js';
import Main from './Main/Main';
import YourListedProducts from './YourListedProducts/YourListedProducts.js';
import FetchProductsOnNavigate from './FetchProductsOnNavigate/FetchProductsOnNavigate.js';
import EditProduct from './EditProduct/EditProduct.js';
import YourStash from './YourStash/YourStash.js';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: false,
      myProducts: [],
      currentProduct: {}
    }
    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
    this.fetchMyProducts = this.fetchMyProducts.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
    this.removeProduct = this.removeProduct.bind(this);
  }

  initializeMarketplace = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else {
      const ganacheUrl = "http://127.0.0.1:7545";
      window.web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));
    }
  };


  async componentDidMount() {
    await this.initializeMarketplace();
    await this.loadBlockchainData();
    await this.initalizeConnectedAccount();


    // Metamask logout & account switching
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          this.setState({ 
            account: '', 
          });
        } else {
          this.initalizeConnectedAccount();
          this.setState({ account: accounts[0] });
          this.fetchMyProducts();
        }
      });
    }
  }

  initalizeConnectedAccount = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        this.setCurrentAccount(accounts);
      }
    } else if (window.web3) {
      const accounts = await window.web3.eth.getAccounts();
      if (accounts.length > 0) {
        this.setCurrentAccount(accounts);
      }
    }
  };

  
  async loadBlockchainData() {
    const web3 = window.web3;

    if (!web3) {
      alert("Web3 not initialized. Please check your provider.");
      return;
    }

    try {
      const networkId = await web3.eth.net.getId();
      const networkData = Marketplace.networks[networkId];
      if (networkData) {
        const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address);
        const productCount = await marketplace.methods.productCount().call();

        const products = [];
        for (let i = 1; i <= productCount; i++) {
          const product = await marketplace.methods.products(i).call();
          products.push(product);
        }

        this.setState({ marketplace, productCount, loading: false, products});
      } else {
        alert("Marketplace contract not deployed to detected network.");
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  }

  setCurrentAccount(accounts) {
    if (accounts.length > 0) {
      this.setState({ account: accounts[0] });
    } else {
      throw new Error("No accounts found.");
    }
  }


  loginMetamask = async () => {
    this.setState({ loading: true });

    if (window.ethereum) {
      try {
        window.web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.setCurrentAccount(accounts);
      } catch (error) {
        alert("Please allow MetaMask to connect.");
      }
    } else if (window.web3) {
      try {
        window.web3 = new Web3(window.web3.currentProvider);
        const accounts = await window.web3.eth.getAccounts();
        this.setCurrentAccount(accounts);
      } catch (error) {
        alert("Please allow MetaMask to connect.");
      }
    } else {
      alert("Non-Ethereum browser detected. Please install MetaMask.");
    }
    this.setState({ loading: false });
  };

  purchaseProduct(id, price) {
    this.setState({ loading: true });

    try {
      this.state.marketplace.methods
        .purchaseProduct(id)
        .send({ from: this.state.account, value: price })
        .on('receipt', (receipt) => {
          this.loadBlockchainData();
          this.setState({ loading: false });
        })
        .on('error', (error) => {
          alert("Transaction Failed");
          this.setState({ loading: false });
        })
    } catch(error) {
      alert("Transaction Failed. Please check your balance.");
      this.setState({ loading : false });
    }
  }


  createProduct = async (name, price, listed) => {
    this.setState({ loading: true });

    try {
      this.state.marketplace.methods
        .createProduct(name, price, listed)
        .send({ from: this.state.account })
        .on('receipt', (receipt) => {
          this.loadBlockchainData();
          this.setState({ loading: false });
        })
        .on('error', (error) => {
          alert("Transaction Failed");
          this.setState({ loading: false });
        })
    } catch (error) {
      alert("Transaction Failed. Please check your balance.");
      this.setState({ loading: false });
    }
  };

  fetchMyProducts = async () => {
    this.setState({ loading: true });
    let myProducts = [];

    try {
      const productIds = await this.state.marketplace.methods.getMyProducts().call({ from: this.state.account });

      for (let i = 0; i < productIds.length; i++) {
        const product = await this.state.marketplace.methods.products(productIds[i]).call();
        myProducts.push(product);
      }

      this.setState({ loading: false, myProducts });
    } catch (error) {
      alert("Error fetching your products.");
      this.setState({ loading: false, myProducts });
    }
  };

  fetchProductById = async (productId) => {
    this.setState({ loading: true });

    try {
      const product = await this.state.marketplace.methods.products(productId).call();
      
      if (product && product.id !== '0') {
        this.setState({ loading: false, currentProduct: product });
      } else {
        alert("Product does not exist.");
        this.setState({ loading: false });
      }
    } catch (error) {
      alert("Error fetching the product.");
      this.setState({ loading: false });
    }
  };

  updateProduct = async (productId, name, listed, price) => {
    this.setState({ loading: true });
    return new Promise((resolve, reject) => {
        this.state.marketplace.methods
            .updateProduct(productId, name, listed, price)
            .send({ from: this.state.account })
            .on('receipt', (receipt) => {
                this.setState({ loading: false });
                this.loadBlockchainData();
                resolve(receipt); 
            })
            .on('error', (error) => {
                this.setState({ loading: false });
                console.error("Transaction failed:", error);
                reject(error);
            });
    });
  };

  removeProduct = async (productId) => {
    this.setState({ loading: true });
    this.state.marketplace.methods
      .removeProduct(productId)
      .send({ from: this.state.account })
      .on('receipt', (receipt) => {
        this.fetchMyProducts();
        this.loadBlockchainData();
        this.setState({ loading: false });
      })
      .on('error', (error) => {
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <Router>
        <div>
          <FetchProductsOnNavigate fetchMyProducts={this.fetchMyProducts} fetchProductById={this.fetchProductById} account={this.state.account}/>
          <LayoutManager
            account={this.state.account}
            loading={this.state.loading}
            Navigation={(props) => <NavigationMenu {...props} loginMetamask={this.loginMetamask} account={this.state.account}/>}
            Content={() => (
              <Switch>
                <Route exact path="/" component={Main} />
                <Route 
                  path="/addProduct"
                  render={(props) =>
                  this.state.account ? (
                    <AddProduct createProduct={this.createProduct} />
                  ) : (
                    <Redirect to="/" />
                  )}
                />
                <Route 
                  path="/browseProducts" 
                  render={(props) => (
                    <BrowseProducts {...props} products={this.state.products} purchaseProduct={this.purchaseProduct} account={this.state.account} 
                    fetchProductById={this.fetchProductById} currentProduct={this.state.currentProduct}/>
                  )}
                />
                <Route
                  path="/yourListedProducts"
                  render={(props) =>
                    this.state.account ? (
                      <YourListedProducts
                        {...props} 
                        myProducts={this.state.myProducts}
                        removeProduct={this.removeProduct}
                      />
                    ) : (
                      <Redirect to="/" />
                    )
                  }
                />
                <Route 
                  path="/editProduct/:id"
                  render={(props) =>
                    this.state.account ? (
                      <EditProduct {...props} currentProduct={this.state.currentProduct} updateProduct={this.updateProduct} />
                    ) : (
                      <Redirect to="/" />
                    )
                  }
                />
                <Route
                  path="/yourStash"
                  render={(props) =>
                    this.state.account ? (
                      <YourStash
                        {...props} 
                        myProducts={this.state.myProducts}
                      />
                    ) : (
                      <Redirect to="/" />
                    )
                  }
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
