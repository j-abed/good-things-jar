import React, { useState, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import { useSpring, animated } from '@react-spring/web';
import './App.css';

function App() {
  // State variables
  const [goodThings, setGoodThings] = useState([]); // List of all "Good Things"
  const [newThing, setNewThing] = useState(''); // Current input for a new "Good Thing"
  const [newDate, setNewDate] = useState(''); // Date for the new "Good Thing"
  const [fallingThing, setFallingThing] = useState(''); // Text being animated
  const [showPicker, setShowPicker] = useState(false); // Toggle for emoji picker
  const [falling, setFalling] = useState(false); // Animation state for new "Good Thing"
  const [showRecap, setShowRecap] = useState(false); // Toggle for Recap view

  const jarHeight = 300; // Height of the jar for animations and layout

  // Load "Good Things" from localStorage when the app loads
  useEffect(() => {
    const storedItems = localStorage.getItem('goodThings');
    if (storedItems) {
      setGoodThings(JSON.parse(storedItems)); // Restore previous entries
    }
  }, []);

  // Save "Good Things" to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('goodThings', JSON.stringify(goodThings));
  }, [goodThings]);

  // Start animation when "Add to Jar" is clicked
  const handleAddThing = () => {
    if (!newThing.trim()) return; // Prevent empty entries
    setFallingThing(newThing); // Capture the current input for the animation
    setFalling(true); // Start animation
    setNewThing(''); // Clear input field for new entry
    setNewDate(''); // Clear date field
  };

  // Finalize the entry after the animation ends
  const finalizeEntry = () => {
    const newEntry = {
      id: Date.now(), // Unique identifier
      content: fallingThing, // Content of the entry
      date: newDate || new Date().toISOString().split('T')[0], // Use input date or today's date
    };

    // Add new entry to the top of the list
    setGoodThings((prevThings) => [newEntry, ...prevThings]);
    setFalling(false); // End animation
    setShowPicker(false); // Close emoji picker
  };

  // Group entries by month for the Recap view
  const groupByMonth = () => {
    return goodThings.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      acc[month] = acc[month] || []; // Initialize array for the month if not already present
      acc[month].push(item); // Add the current item to the month
      return acc;
    }, {});
  };

  // Calculate the jar's fill level based on the number of months with entries
  const jarFill = () => {
    const months = new Set();
    goodThings.forEach((item) => {
      const date = new Date(item.date);
      const month = `${date.getFullYear()}-${date.getMonth()}`;
      months.add(month); // Add unique months
    });
    return Math.min(1, months.size / 12); // Fill the jar proportionally to months with entries
  };

  // Export "Good Things" to a CSV file
  const exportToCSV = () => {
    const csv = goodThings.map((item) => `"${item.date}","${item.content}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a link to download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'good-things.csv';
    a.click();
    URL.revokeObjectURL(url); // Revoke URL to free memory
  };

  // Animation properties for the falling "Good Thing"
  const props = useSpring({
    from: { transform: 'translateY(-100px)', opacity: 1 },
    to: { transform: `translateY(${jarHeight - 50}px)`, opacity: 1 },
    config: { duration: 1000 },
    reset: false,
    onRest: () => {
      if (falling) finalizeEntry(); // Finalize entry after animation
    },
  });

  return (
    <div className="container">
      <h1>Good Things Jar</h1>

      {/* Input form */}
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

        <button className="button" onClick={() => setShowPicker(!showPicker)}>
          Add Emoji
        </button>
        {showPicker && (
          <Picker
            onEmojiSelect={(emoji) => setNewThing(newThing + emoji.native)}
          />
        )}

        <button className="button" onClick={handleAddThing}>
          Add to Jar
        </button>
        <button className="button" onClick={() => setShowRecap(true)}>
          View Recap
        </button>
        <button className="button" onClick={exportToCSV}>
          Export as CSV
        </button>
      </div>

      {/* Recap view */}
      {showRecap ? (
        <div className="recap">
          <button className="button" onClick={() => setShowRecap(false)}>
            Back
          </button>
          {Object.entries(groupByMonth()).map(([month, items]) => (
            <div key={month}>
              <h2>{month}</h2>
              <ul className="list">
                {items.map((item) => (
                  <li key={item.id} className="list-item">
                    {item.content}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        // Jar view
        <div className="jar">
          <img src="/jar.svg" alt="Jar" className="jar-svg" />
          <div
            className="jar-fill"
            style={{ height: `${jarFill() * 100}%`, backgroundColor: '#4CAF50' }}
          ></div>
          {falling && (
            <animated.div style={props} className="item">
              {fallingThing}
            </animated.div>
          )}
          <div className="jar-content">
            {goodThings.slice(0, 10).map((item) => (
              <div key={item.id} className="jar-item">
                {item.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
