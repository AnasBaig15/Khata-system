import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from 'react-redux';
import Dashboard from './components/dashboard'
// import CreditDebitForm from './components/enter.jsx';
import Signup from './components/signUp';
import Login from './components/login';
import store from './Redux/store'
const App = () => {
return(
  <Provider store={store}>
       <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Signup/>} />
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </Router>
    </Provider>
) 
};

export default App;