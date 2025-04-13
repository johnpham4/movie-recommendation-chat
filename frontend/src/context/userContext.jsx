// src/context/UserContext.js
import React from 'react';
import { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    people: '',
    time: '',
    favoriteMovie: '',
    mood: '',
    newClassic: '',
    islandPerson: '',
  });

  const [responseData, setResponseData] = useState(null);

  return (
    <UserContext.Provider value={{ formData, setFormData, responseData, setResponseData }}>
      {children}
    </UserContext.Provider>
  );
};
