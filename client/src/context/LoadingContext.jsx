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
          <div style={styles.spinner}></div>
          <p style={{ color: '#fff', marginTop: '10px', fontWeight: 'bold' }}>Loading...</p>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};