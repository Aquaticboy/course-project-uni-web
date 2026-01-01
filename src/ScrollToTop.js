import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Коли змінюється шлях (pathname), скролимо наверх
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Цей компонент нічого не малює
}