import React, { useState, useEffect } from 'react';

function App() {
  const [goodThings, setGoodThings] = useState([]);
  const [newThing, setNewThing] = useState('');

  // Load existing "good things" from local storage on first render
  useEffect(() => {
    const storedItems = localStorage.getItem('goodThings');
    if (storedItems) {
      setGoodThings(JSON.parse(storedItems));
    }
  }, []);

  // Whenever goodThings changes, save to local storage
  useEffect(() => {
    localStorage.setItem('goodThings', JSON.stringify(goodThings));
  }, [goodThings]);

  const handleAddThing = () => {
    if (!newThing.trim()) return;
    const newEntry = {
      id: Date.now(),    // unique ID based on timestamp
      content: newThing,
      date: new Date().toLocaleString()
    };
    setGoodThings([newEntry, ...goodThings]);
    setNewThing(''); // clear the input
  };

  return (
    <div style={styles.container}>
      <h1>Good Things Jar</h1>

      <div style={styles.inputContainer}>
        <textarea
          style={styles.textArea}
          value={newThing}
          onChange={(e) => setNewThing(e.target.value)}
          placeholder="Write a short good thing that happened this week..."
        />
        <button style={styles.button} onClick={handleAddThing}>
          Add
        </button>
      </div>

      <ul style={styles.list}>
        {goodThings.map((item) => (
          <li key={item.id} style={styles.listItem}>
            <strong>{item.date}:</strong> {item.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Inline styles for quick prototyping
const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: 'sans-serif',
  },
  inputContainer: {
    marginBottom: '20px',
  },
  textArea: {
    width: '100%',
    height: '60px',
    marginBottom: '10px',
    fontSize: '16px',
    padding: '8px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  listItem: {
    background: '#f9f9f9',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '5px',
  },
};

export default App;
