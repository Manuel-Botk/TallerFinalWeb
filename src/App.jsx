import { useState } from 'react';
import Navbar from './components/Navbar';
import Bestiary from './modules/Bestiary';
import LootGenerator from './modules/LootGenerator';
import DiceTray from './modules/DiceTray';

export default function App() {
  const [activeTab, setActiveTab] = useState('bestiary');

  return (
    <div className="app">
      <header className="header">
        <h1>⚔️ Asistente del DM</h1>
      </header>

      <Navbar active={activeTab} onChange={setActiveTab} />

      <main className="content">
        {activeTab === 'bestiary' && <Bestiary />}
        {activeTab === 'loot' && <LootGenerator />}
        {activeTab === 'dice' && <DiceTray />}
      </main>
    </div>
  );
}