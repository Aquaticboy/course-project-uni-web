// import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from "react-router-dom"; // 1. Додали useLocation

// Pages
import Home from "./Pages/Home";
import NotFound from "./Pages/NotFound";
import MoviePage from "./Pages/MoviePage";
import ActorPage from "./Pages/ActorPage";
import MovieSearch from "./Pages/MovieSearch";
import BookPageOL from "./Pages/BookPageOL";
import BookSearch from "./Pages/BookSearch";
import BookPage from "./Pages/BookPage";
import AuthPage from './Pages/AuthPage';
import { AuthProvider } from './Context/AuthContext';
import ProfilePage from './Pages/ProfilePage';
import SettingsPage from './Pages/SettingsPage';
import UserProfilePage from './Pages/UserProfilePage';
import FriendsPage from './Pages/FriendsPage';
import AdminPage from './Pages/AdminPage';

// Components
import Footer from "./MantineCompon/Footer/Footer";
import { HeaderSearch } from "./MantineCompon/HeaderNavBar/HeaderSearch";

// Mantine UI
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import { createTheme, MantineProvider, Container } from "@mantine/core";

import ScrollToTop from './ScrollToTop';

const theme = createTheme({
  primaryColor: 'orange', 
  fontFamily: 'Verdana, sans-serif',
  headings: { fontFamily: 'Georgia, serif' },
  defaultRadius: 'md', 
});

// Створюємо внутрішній компонент, щоб мати доступ до useLocation
function AppContent() {
  const location = useLocation();
  
  // Перевіряємо, чи ми на сторінці авторизації
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="App">
      {!isAuthPage && <HeaderSearch />}

      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route path="/auth">
           <AuthPage />
        </Route>

        <Route>
          <Container size="lg" mt="md">
            <Switch>
              <Route path="/MovieSearch">
                <MovieSearch />
              </Route>
              
              <Route path="/movieInfoByID/:id"> 
                <MoviePage />
              </Route>

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

              <Route path="/profile">
                <ProfilePage />
              </Route>

              <Route path="/settings">
                <SettingsPage />
              </Route>

              <Route path="/user/:id">
                <UserProfilePage />
              </Route>

              <Route path="/friends">
                <FriendsPage />
              </Route>

              <Route path="/admin">
                <AdminPage />
              </Route>

              {/* Сторінка 404 має бути в кінці списку Switch всередині контейнера */}
              <Route path="*">
                <NotFound />
              </Route>
            </Switch>
          </Container>
        </Route>
      </Switch>

      {/* 5. Футер показуємо, ТІЛЬКИ якщо це НЕ сторінка авторизації */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;