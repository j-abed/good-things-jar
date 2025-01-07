import React, { useState, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import { useSpring, animated } from '@react-spring/web';
import './App.css';

function App() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // State variables
  const [goodThings, setGoodThings] = useState([]); // List of all "Good Things"
  const [newThing, setNewThing] = useState(''); // Current input for a new "Good Thing"
  const [newDate, setNewDate] = useState(today); // Initialize with today's date
  const [fallingThing, setFallingThing] = useState(''); // Text being animated
  const [showPicker, setShowPicker] = useState(false); // Toggle for emoji picker
  const [falling, setFalling] = useState(false); // Animation state for new "Good Thing"
  const [showRecap, setShowRecap] = useState(false); // Toggle for Recap view
  const [pendingEntry, setPendingEntry] = useState(null); // Pending entry data

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
    if (!newThing.trim()) return;
    
    // Store the entry data for later
    setPendingEntry({
      id: Date.now(),
      content: newThing,
      date: newDate || today, // Use today's date as fallback
    });
    
    setFallingThing(newThing); // Capture the current input for the animation
    setFalling(true); // Start animation
    setNewThing(''); // Clear input field for new entry
    setNewDate(today); // Reset to today's date instead of empty string
  };

  // Finalize the entry after the animation ends
  const finalizeEntry = () => {
    if (pendingEntry) {
      setGoodThings(prevThings => [pendingEntry, ...prevThings]); // Add to beginning of list
      setPendingEntry(null);
      
      // Force localStorage update
      const updatedThings = [pendingEntry, ...goodThings];
      localStorage.setItem('goodThings', JSON.stringify(updatedThings));
    }
    setFalling(false);
    setShowPicker(false);
    setFallingThing('');
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

  // Calculate the jar's fill level based on number of items
  const jarFill = () => {
    const maxItems = 50; // Maximum items for a full jar
    return Math.min(1, goodThings.length / maxItems);
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
    reset: true, // Reset animation for each new item
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
          <div className="jar-contents">
            <div
              className="jar-fill"
              style={{ height: `${jarFill() * 100}%` }}
            />
            {falling && (
              <animated.div style={props} className="item">
                {fallingThing}
              </animated.div>
            )}
            <div className="jar-items">
              {[...goodThings].reverse().map((item) => (
                <div key={item.id} className="jar-item">
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
