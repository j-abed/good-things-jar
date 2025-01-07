import React, { useState, useEffect } from 'react';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import './App.css'; // Import the CSS file

function App() {
  const [goodThings, setGoodThings] = useState([]);
  const [newThing, setNewThing] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const storedItems = localStorage.getItem('goodThings');
    if (storedItems) {
      setGoodThings(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('goodThings', JSON.stringify(goodThings));
  }, [goodThings]);

  const handleAddThing = () => {
    if (!newThing.trim()) return;
    const newEntry = {
      id: Date.now(),
      content: newThing,
      date: newDate || new Date().toLocaleString(),
      photo: newPhoto,
    };
    setGoodThings([newEntry, ...goodThings]);
    setNewThing('');
    setNewPhoto(null);
    setNewDate('');
    setShowPicker(false);
  };

  return (
    <div className="container">
      <h1>Good Things Jar</h1>

      <div className="form">
        <textarea
          className="textarea"
          value={newThing}
          onChange={(e) => setNewThing(e.target.value)}
          placeholder="Write a short good thing that happened..."
        />

        <input
          type="date"
          className="input"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="input"
          onChange={(e) => setNewPhoto(URL.createObjectURL(e.target.files[0]))}
        />

        <button className="button" onClick={() => setShowPicker(!showPicker)}>
          Add Emoji
        </button>
        {showPicker && (
          <Picker
            onSelect={(emoji) => setNewThing(newThing + emoji.native)}
            className="emoji-picker"
          />
        )}

        <button className="button" onClick={handleAddThing}>
          Add Good Thing
        </button>
      </div>

      <ul className="list">
        {goodThings.map((item) => (
          <li key={item.id} className="list-item">
            <strong>{item.date}:</strong> {item.content}
            {item.photo && <img src={item.photo} alt="attachment" className="image" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
