import React from 'react';
import TopBanner from './TopBanner';
import Features from './Features';
import Calendar from './Calendar';
import Footer from './Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Home({ isAdmin, setIsAdmin, host }) {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#calendar') {
      const element = document.getElementById('calendar');
      element && element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
    <TopBanner isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
    <Features />
    <Calendar host={host} isAdmin={isAdmin}/>
    <Footer />
    </>
  )
}

export default Home;

