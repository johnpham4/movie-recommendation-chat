import React from 'react';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import '../css/style.css';

export default function IndexPage() {
  const { formData, setFormData } = useContext(UserContext);
  const [people, setPeople] = useState('');
  const [time, setTime] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    setFormData({ ...formData, people, time });
    navigate('/questions');
  };

  return (
    <div className="container">
      <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" className="popcorn-icon" alt="Popcorn icon"/>
      <h1 className="title">PopChoice</h1>

      <input type="text" className="input-box" placeholder="How many people?" value={people} onChange={(e) => setPeople(e.target.value)} />
      <input type="text" className="input-box" placeholder="How much time do you have?" value={time} onChange={(e) => setTime(e.target.value)} />
      <button className="start-button" onClick={handleStart}>Start</button>
    </div>
  );
}
