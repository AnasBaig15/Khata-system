import './App.css'
import { Provider } from 'react-redux';
import Dashboard from './components/dashboard'
// import CreditDebitForm from './components/enter.jsx';
// import Signup from './components/signUp';
// import Login from './components/login';
import store from './Redux/store'
const App = () => {
return(
  <Provider store={store}>
      <Dashboard />
    </Provider>
) 
};

export default App;