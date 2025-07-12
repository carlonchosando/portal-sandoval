import React, { useState } from 'react';

function Collapsible({ title, children, startOpen = false }) {
  const [isOpen, setIsOpen] = useState(startOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible-container">
      <button onClick={toggleOpen} className="collapsible-header">
        {title}
        <span className={`collapsible-icon ${isOpen ? 'open' : ''}`}>&#9660;</span>
      </button>
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default Collapsible;