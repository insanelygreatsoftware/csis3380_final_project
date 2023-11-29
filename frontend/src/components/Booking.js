import React from 'react';
import TopBanner from './TopBanner';
import BookingForm from './BookingForm';
import Footer from './Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Booking = ({ isAdmin, setIsAdmin, host }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#booking-form') {
      const element = document.getElementById('booking-form');
      element && element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
  <>
  <TopBanner isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
  <BookingForm isAdmin={isAdmin} host={host}/>
  <Footer />
  </>
  );
};

export default Booking;
