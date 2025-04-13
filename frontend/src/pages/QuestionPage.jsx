// src/pages/QuestionPage.jsx
import React from 'react';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import '../css/page.css';

function QuestionPage({ onSubmit }) {
  const { formData, setFormData, setResponseData } = useContext(UserContext);
  const navigate = useNavigate();

  const [favoriteMovie, setFavoriteMovie] = useState('');
  const [newClassic, setNewClassic] = useState('');
  const [mood, setMood] = useState('');
  const [islandPerson, setIslandPerson] = useState('');

  const selectOption = (setter, value) => setter(value);

  const handleSubmit = async () => {
    const updatedForm = { ...formData, favoriteMovie, newClassic, mood, islandPerson };
    setFormData(updatedForm);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedForm)
      });
      const data = await res.json();
      console.log(data);
      setResponseData(data);
      navigate('/movie');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="card">
      <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" className="popcorn-icon" alt="Popcorn icon"/>
      <div className="question">
        <label>What's your favorite movie and why?</label>
        <textarea value={favoriteMovie} onChange={(e) => setFavoriteMovie(e.target.value)} />
      </div>
      <div className="question">
        <label>Are you in the mood for something new or a classic?</label>
        <div className="options">
          <button className="button" onClick={() => selectOption(setNewClassic, 'New')}>New</button>
          <button className="button" onClick={() => selectOption(setNewClassic, 'Classic')}>Classic</button>
        </div>
      </div>
      <div className="question">
        <label>What are you in the mood for?</label>
        <div className="options">
          <button className="button" onClick={() => selectOption(setMood, 'Fun')}>Fun</button>
          <button className="button" onClick={() => selectOption(setMood, 'Serious')}>Serious</button>
          <button className="button" onClick={() => selectOption(setMood, 'Inspiring')}>Inspiring</button>
          <button className="button" onClick={() => selectOption(setMood, 'Scary')}>Scary</button>
        </div>
      </div>
      <div className="question">
        <label>Which famous film person would you love to be stranded on an island with and why?</label>
        <textarea value={islandPerson} onChange={(e) => setIslandPerson(e.target.value)} />
      </div>
      <button className="submit-button" onClick={handleSubmit}>Get Movie</button>
    </div>
  );
}

export default QuestionPage;
