import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TopologyGrid from './components/TopologyGrid';
import ScenarioControlBar from './components/ScenarioControlBar';
import MemoryComparisonView from './components/MemoryComparisonView';
import IncidentConsole from './components/IncidentConsole';
import IncidentReplayView from './components/IncidentReplayView';
import MemoryExplorerView from './components/MemoryExplorerView';
import RunbooksView from './components/RunbooksView';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

  // Preset fallback scenarios
  const presetScenarios = [
    {
      id: 'SCENARIO-1',
      service: 'payment-gateway',
      title: 'Flash Sale Spike: Connection Pool Exhaustion & 504 Timeouts',
      symptoms:
        '504 Gateway Timeout on POST /api/v1/charge, active HikariCP pool at 100% capacity (20/20 connections), error rate spiking to 48%.',
    },
    {
      id: 'SCENARIO-2',
      service: 'auth-service',
      title: 'Auth Service RSS Memory Leak (OOMKilled Loop)',
      symptoms:
        'auth-service pod restart loop (exit code 137), RSS memory growing linearly by 85MB/min under high auth token verification volume.',
    },
    {
      id: 'SCENARIO-3',
      service: 'redis-cluster',
      title: 'Hot Key Expiration Thundering Herd on Catalog Query',
      symptoms:
        'Database CPU spiked to 99%, microservice latency degraded from 12ms to 4800ms following scheduled catalog key expiration.',
    },
  ];

  // --------------------------------------------------
  // FETCH ALL DASHBOARD DATA
  // --------------------------------------------------
  const fetchData = async () => {
    try {
      const [
        resStatus,
        resTopo,
        resReplays,
        resRunbooks,
        resMem,
      ] = await Promise.all([
        fetch(`${API_BASE}/status`)
          .then((r) => r.json())
          .catch(() => null),

        fetch(`${API_BASE}/topology`)
          .then((r) => r.json())
          .catch(() => null),

        fetch(`${API_BASE}/replays`)
          .then((r) => r.json())
          .catch(() => null),

        fetch(`${API_BASE}/runbooks`)
          .then((r) => r.json())
          .catch(() => null),

        fetch(`${API_BASE}/memory`)
          .then((r) => r.json())
          .catch(() => null),
      ]);

      if (resStatus && resStatus.success) {
        setStatusInfo(resStatus);
      }

      if (resTopo && resTopo.success) {
        setTopology(resTopo.topology);

        /*
         * IMPORTANT:
         * Do not replace an existing incident with null.
         *
         * After successful remediation, the backend archives the
         * incident and activeIncident becomes null on the backend.
         * We want the frontend IncidentConsole to keep showing
         * the resolved incident.
         */
        if (resTopo.activeIncident) {
          setActiveIncident(resTopo.activeIncident);
        }
      }

      if (resReplays && resReplays.success) {
        setReplays(resReplays.replays);
      }

      if (resRunbooks && resRunbooks.success) {
        setRunbooks(resRunbooks.runbooks);
      }

      if (resMem && resMem.success) {
        setMemoryData(resMem);
      }
    } catch (err) {
      console.error('Failed to fetch API status:', err);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD + POLLING
  // --------------------------------------------------
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // TRIGGER INCIDENT
  // --------------------------------------------------
  const handleTriggerScenario = async (scenarioId) => {
    setIsTriggering(true);

    try {
      const res = await fetch(`${API_BASE}/incidents/trigger-replay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenarioId }),
      }).then((r) => r.json());

      if (res && res.success) {
        // Immediately show the newly triggered incident
        setActiveIncident(res.incident);

        // Refresh topology/status without clearing the incident
        fetchData();
      }
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  // --------------------------------------------------
  // EXECUTE REMEDIATION
  // --------------------------------------------------
  const handleExecuteRemediation = async (runbookId) => {
    setIsExecuting(true);

    try {
      const res = await fetch(`${API_BASE}/remediation/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ runbookId }),
      }).then((r) => r.json());

      if (res && res.success) {
        /*
         * IMPORTANT:
         * Do NOT call fetchData() here.
         *
         * The backend archives the incident after successful
         * remediation. The IncidentConsole needs to keep the
         * current incident visible so it can show:
         *
         * "Incident Successfully Resolved!"
         *
         * The IncidentConsole itself receives the response and
         * changes its local state to the resolved state.
         */

        return res;
      }

      return res;
    } catch (err) {
      console.error('Failed to execute remediation:', err);
      return null;
    } finally {
      setIsExecuting(false);
    }
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------
  const handleReset = async () => {
    try {
      await fetch(`${API_BASE}/topology/reset`, {
        method: 'POST',
      });

      // Reset is the one place where we intentionally clear
      // the frontend incident.
      setActiveIncident(null);

      await fetchData();
    } catch (err) {
      console.error('Failed to reset topology:', err);
    }
  };

  // --------------------------------------------------
  // HINDSIGHT MEMORY RECALL
  // --------------------------------------------------
  const handleSearchRecall = async (query) => {
    try {
      const res = await fetch(`${API_BASE}/memory/recall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }).then((r) => r.json());

      return res.recallData;
    } catch (err) {
      console.error('Failed to search memory:', err);
      return null;
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
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

            {/* Live Microservices Topology Grid */}
            <TopologyGrid topology={topology} />

            {/* Interactive Scenario Control Bar */}
            <ScenarioControlBar
              scenarios={presetScenarios}
              activeIncident={activeIncident}
              onTrigger={handleTriggerScenario}
              onReset={handleReset}
              isTriggering={isTriggering}
            />

            {/* Stateless vs Resilify AI + Hindsight */}
            <MemoryComparisonView
              incident={activeIncident}
              onResolveIncident={() =>
                handleExecuteRemediation()
              }
              isResolving={isExecuting}
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
            replays={
              replays.length > 0
                ? replays
                : presetScenarios
            }
            onSelectReplay={handleTriggerScenario}
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
            onResolveIncident={() =>
              handleExecuteRemediation()
            }
            isResolving={isExecuting}
          />
        )}

      </main>
    </div>
  );
}