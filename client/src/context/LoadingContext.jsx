'use client'; // 👈 Next.js ke liye yeh sab se upar zaroori hai

import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {/* Global Loading Overlay */}
      {loading && (
        <div style={styles.overlay}>
          <h1 style={styles.brandTitle}>SHOP.CO</h1>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ffffff', // 👈 Solid background taake peechay wala page nazar na aaye
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  brandTitle: {
    fontSize: '32px',
    fontWeight: '900',
    letterSpacing: '2px',
    color: '#000000',
    marginBottom: '20px',
    fontFamily: 'sans-serif',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #000000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#555555',
    marginTop: '15px',
    fontWeight: '600',
    fontSize: '16px',
    fontFamily: 'sans-serif',
  }
};