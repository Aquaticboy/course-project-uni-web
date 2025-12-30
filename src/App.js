// import './App.css';
import Home from "./Pages/Home";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NotFound from "./Pages/NotFound";
import MoviePage from "./Pages/MoviePage";
import ActorPage from "./Pages/ActorPage";
import MovieSearch from "./Pages/MovieSearch";
import BookPageOL from "./Pages/BookPageOL";
import BookSearch from "./Pages/BookSearch";
import Footer from "./MantineCompon/Footer/Footer";

// Mantine UI
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import { createTheme, MantineProvider, Container } from "@mantine/core";
import { HeaderSearch } from "./MantineCompon/HeaderNavBar/HeaderSearch";
import BookPage from "./Pages/BookPage";

const theme = createTheme({
  primaryColor: 'orange', 
  fontFamily: 'Verdana, sans-serif',
  headings: { fontFamily: 'Georgia, serif' },
  defaultRadius: 'md', 
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Router>
        <div className="App">
          {/* 1. Header залишається на всю ширину (без Container) */}
          <HeaderSearch />

          <Switch>
            {/* 2. HOME PAGE - Рендериться БЕЗ контейнера (на всю ширину) */}
            <Route exact path="/">
              <Home />
            </Route>

            {/* 3. ВСІ ІНШІ СТОРІНКИ - Обгорнуті в Container */}
            <Route>
              <Container size="lg" mt="md">
                <Switch>
                  <Route path="/MovieSearch">
                    <MovieSearch />
                  </Route>
                  
                  {/* Виправив шлях: було /moviePage/:id, а в Home ми посилаємось на /movieInfoByID/:id */}
                  {/* Якщо у тебе в Home.js посилання /movieInfoByID, то тут теж має бути так. */}
                  {/* Я залишаю як було в твоєму старому App.js, але зверни на це увагу */}
                  <Route path="/movieInfoByID/:id"> 
                    <MoviePage />
                  </Route>
                  {/* Старий варіант про всяк випадок: */}
                  <Route path="/moviePage/:id">
                    <MoviePage />
                  </Route>

                  <Route path="/actor/:id">
                    <ActorPage />
                  </Route>
                  
                  <Route path="/BookSearch">
                    <BookSearch />
                  </Route>
                  
                  <Route path="/bookInfo/:id">
                    <BookPage />
                  </Route>

                  <Route path="/bookInfoOL/:id">
                    <BookPageOL />
                  </Route>

                  <Route path="*">
                    <NotFound />
                  </Route>
                </Switch>
              </Container>
            </Route>
          </Switch>

          {/* 4. Footer залишається на всю ширину (без Container) */}
          <Footer />
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;