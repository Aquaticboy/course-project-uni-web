// import './App.css';
import Home from './Pages/Home'
import { BrowserRouter as Router, Route, Switch }  from 'react-router-dom';
import Create from './Pages/Create';
import NotFound from './Pages/NotFound';
import MoviePage from './Pages/MoviePage';
import ActorPage from './Pages/ActorPage';

// Mantine UI
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import { createTheme, MantineProvider, Container  } from '@mantine/core';
import { HeaderSearch } from './MantineCompon/HeaderNavBar/HeaderSearch';
import MovieDetailPage from './Pages/MoviePage';

function App() {

  return (
    <MantineProvider>


    <Router>
      <div className="App">
        {/* <Navbar /> */}
        <HeaderSearch />



        <Container size="lg" mt="md">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/create">
              <Create />
            </Route>
            <Route path="/moviePage/:id">
              <MoviePage />
            </Route>
            <Route path="/actor/:id">
                <ActorPage />
              </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </Container>


      </div>
    </Router>




    </MantineProvider>
  );
}

export default App;
