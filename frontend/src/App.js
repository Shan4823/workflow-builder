import React from 'react';
import logo from './logo.svg';
import './App.css';
import AuthButtons from './components/AuthButtons';
import Workflows from './Workflows'; // This imports your new component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <AuthButtons />
      </header>

      <main style={{ padding: '20px' }}>
        <h1>My Workflow App</h1>
        <Workflows />  {/* This renders the workflows list and form */}
      </main>
    </div>
  );
}

export default App;
