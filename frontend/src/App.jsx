import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TopologyGrid from './components/TopologyGrid';
import IncidentConsole from './components/IncidentConsole';
import IncidentReplayView from './components/IncidentReplayView';
import MemoryExplorerView from './components/MemoryExplorerView';
import RunbooksView from './components/RunbooksView';
import MemoryComparisonView from './components/MemoryComparisonView';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const [statusInfo, setStatusInfo] = useState(null);
  const [topology, setTopology] = useState([]);
  const [replays, setReplays] = useState([]);
  const [runbooks, setRunbooks] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTriggering, setIsTriggering] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [memoryData, setMemoryData] = useState(null);

  const fetchData = async () => {
    try {
      const [resStatus, resTopo, resReplays, resRunbooks, resMem] = await Promise.all([
        fetch(`${API_BASE}/status`).then(r => r.json()),
        fetch(`${API_BASE}/topology`).then(r => r.json()),
        fetch(`${API_BASE}/replays`).then(r => r.json()),
        fetch(`${API_BASE}/runbooks`).then(r => r.json()),
        fetch(`${API_BASE}/memory`).then(r => r.json())
      ]);

      if (resStatus.success) setStatusInfo(resStatus);
      if (resTopo.success) {
        setTopology(resTopo.topology);
        setActiveIncident(resTopo.activeIncident);
      }
      if (resReplays.success) setReplays(resReplays.replays);
      if (resRunbooks.success) setRunbooks(resRunbooks.runbooks);
      if (resMem.success) setMemoryData(resMem);
    } catch (err) {
      console.error('Failed to fetch API status:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerReplay = async (scenarioId) => {
    setIsTriggering(true);
    try {
      const res = await fetch(`${API_BASE}/incidents/trigger-replay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId })
      }).then(r => r.json());

      if (res.success) {
        setActiveIncident(res.incident);
        setActiveTab('incidents');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to trigger replay scenario:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleExecuteRemediation = async (runbookId) => {
    setIsExecuting(true);
    try {
      const res = await fetch(`${API_BASE}/remediation/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runbookId })
      }).then(r => r.json());

      if (res.success) {
        fetchData();
        return res;
      }
    } catch (err) {
      console.error('Failed to execute remediation:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSearchRecall = async (query) => {
    try {
      const res = await fetch(`${API_BASE}/memory/recall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      }).then(r => r.json());
      return res.recallData;
    } catch (err) {
      console.error('Failed to search memory:', err);
      return null;
    }
  };

  return (
    <div className="app-container">
      
      {/* Header & Navigation */}
      <Header 
        statusInfo={statusInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <TopologyGrid topology={topology} />
            <IncidentReplayView 
              replays={replays}
              onSelectReplay={handleTriggerReplay}
              isTriggering={isTriggering}
            />
          </div>
        )}

        {/* INCIDENTS CONSOLE TAB */}
        {activeTab === 'incidents' && (
          <IncidentConsole 
            incident={activeIncident}
            onExecuteRemediation={handleExecuteRemediation}
            isExecuting={isExecuting}
          />
        )}

        {/* INCIDENT REPLAY TAB */}
        {activeTab === 'replay' && (
          <IncidentReplayView 
            replays={replays}
            onSelectReplay={handleTriggerReplay}
            isTriggering={isTriggering}
          />
        )}

        {/* MEMORY EXPLORER TAB */}
        {activeTab === 'memory' && (
          <MemoryExplorerView 
            memoryData={memoryData}
            onSearchRecall={handleSearchRecall}
          />
        )}

        {/* RUNBOOKS TAB */}
        {activeTab === 'runbooks' && (
          <RunbooksView runbooks={runbooks} />
        )}

        {/* STATELESS VS RESILIFY COMPARISON TAB */}
        {activeTab === 'compare' && (
          <MemoryComparisonView 
            incident={activeIncident}
            onResolveIncident={() => handleExecuteRemediation()}
            isResolving={isExecuting}
          />
        )}
      </main>

    </div>
  );
}
