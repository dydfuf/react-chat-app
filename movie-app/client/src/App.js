import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import LandingPage from './components/views/LandingPage/LandingPage'
import LoginPage from './components/views/LoginPage/LoginPage'
import RegisterPage from './components/views/RegisterPage/RegisterPage'
import Auth from './hoc/auth'
import NavBar from './components/views/NavBar/NavBar'
import Footer from './components/views/Footer/Footer'
import MovieDetail from './components/views/MovieDetail/MovieDetail'
import FavoritePage from './components/views/FavoritePage/FavoritePage'
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <NavBar />
      <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
        <Router>
          <div>
            <Switch>
              <Route exact path="/" component={Auth(LandingPage, null)} />
              <Route exact path="/login" component={Auth(LoginPage, false)} />
              <Route exact path="/register" component={Auth(RegisterPage, false)} />
              <Route exact path="/movie/:movieId" component={Auth(MovieDetail, null)} />
              <Route exact path="/favorite" component={Auth(FavoritePage, true)} />
            </Switch>
          </div>
          <Footer />
        </Router>
      </div>

    </Suspense>

  );
}

export default App;
