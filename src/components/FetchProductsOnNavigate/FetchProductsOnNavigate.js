import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRouteMatch } from 'react-router-dom';

function FetchProductsOnNavigate({ fetchMyProducts, fetchProductById, account }) {
  const location = useLocation();
  const matchEditProduct = useRouteMatch('/editProduct/:id');

  useEffect(() => {
    const fetchIfReady = async () => {
      if ((location.pathname === '/yourListedProducts' && account) || (location.pathname === '/yourStash' && account)) {
        await fetchMyProducts();
      } else if(matchEditProduct && matchEditProduct.isExact && account) {
        await fetchProductById(matchEditProduct.params.id);
      }
    };

    fetchIfReady();
  }, [location, fetchMyProducts, account, fetchProductById]);

  return null;
}

export default FetchProductsOnNavigate;
