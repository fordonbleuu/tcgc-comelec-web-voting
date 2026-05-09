import React, { useState, useEffect } from 'react';
import './App.css';
import Logo from './assets/tcgc-logo.png';
import Background from './assets/tcgc-bg.png';

const STUDENT_CREDENTIALS = { id: '244444', password: 'cliff711' };
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

const INITIAL_INSTITUTES = ['Technology', 'Education', 'Arts & Sciences'];

const INITIAL_SSC_CANDIDATES = [
  { id: 'ssc-pres', name: 'Maria Santos', position: 'President', party: 'Unilink', type: 'SSC' },
  { id: 'ssc-vp', name: 'James Rivera', position: 'Vice President', party: 'Unilink', type: 'SSC' },
  { id: 'ssc-sec', name: 'Ana Reyes', position: 'Secretary', party: 'Student Voice', type: 'SSC' },
  { id: 'ssc-treas', name: 'Mark Tan', position: 'Treasurer', party: 'Unilink', type: 'SSC' },
];

const INITIAL_ISC_CANDIDATES = {
  Technology: [
    { id: 'tech-pres', name: 'Carlo Reyes', position: 'President', party: 'Tech Titans', type: 'ISC' },
    { id: 'tech-vp', name: 'Diana Cruz', position: 'Vice President', party: 'Code Masters', type: 'ISC' },
  ],
  Education: [
    { id: 'edu-pres', name: 'Sofia Lopez', position: 'President', party: 'Future Educators', type: 'ISC' },
    { id: 'edu-vp', name: 'Brian Morales', position: 'Vice President', party: 'Teach Lead', type: 'ISC' },
  ],
  'Arts & Sciences': [
    { id: 'arts-pres', name: 'Ryan dela Cruz', position: 'President', party: 'Creative Minds', type: 'ISC' },
    { id: 'arts-vp', name: 'Chloe Aquino', position: 'Vice President', party: 'Art Society', type: 'ISC' },
  ],
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');

  return (
    <div className="app">
      <div className="app-background">
        <img src={Background} alt="" className="bg-image" />
        <div className="bg-overlay"></div>
      </div>
      <header className="header">
        <img src={Logo} alt="TCGC Logo" className="header-logo" />
        <div className="header-text">
          <h1>TCGC - COMELEC</h1>
          <p>Student Voting System</p>
        </div>
      </header>

      <div className="main-content">
        {view === 'login' && (
          <LoginCard
            onStudentLogin={(student) => {
              setUser(student);
              setView('student');
            }}
            onAdminLogin={(admin) => {
              setUser(admin);
              setView('admin');
            }}
          />
        )}

        {view === 'student' && user && (
          <StudentPortal
            user={user}
            onLogout={() => {
              setUser(null);
              setView('login');
            }}
          />
        )}

        {view === 'admin' && user && (
          <AdminDashboard
            onLogout={() => {
              setUser(null);
              setView('login');
            }}
          />
        )}
      </div>
    </div>
  );
}

function LoginCard({ onStudentLogin, onAdminLogin }) {
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('student');

  const handleStudentLogin = (e) => {
    e.preventDefault();
    if (studentId === STUDENT_CREDENTIALS.id && studentPassword === STUDENT_CREDENTIALS.password) {
      onStudentLogin({ type: 'student', id: studentId });
    } else {
      setError('Invalid Student ID or Password');
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUsername === ADMIN_CREDENTIALS.username && adminPassword === ADMIN_CREDENTIALS.password) {
      onAdminLogin({ type: 'admin', username: adminUsername });
    } else {
      setError('Invalid Username or Password');
    }
  };

  return (
    <div className="login-card">
      <div className="login-tabs">
        <button
          className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => { setActiveTab('student'); setError(''); }}
        >
          Student Login
        </button>
        <button
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => { setActiveTab('admin'); setError(''); }}
        >
          Admin Login
        </button>
      </div>

      {activeTab === 'student' ? (
        <form onSubmit={handleStudentLogin} className="login-form">
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={studentPassword}
              onChange={(e) => setStudentPassword(e.target.value)}
              placeholder="Enter Password"
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="login-btn">Login as Student</button>
        </form>
      ) : (
        <form onSubmit={handleAdminLogin} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Enter Username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter Password"
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="login-btn">Login as Admin</button>
        </form>
      )}
    </div>
  );
}

function StudentPortal({ user, onLogout }) {
  const [phase, setPhase] = useState(1);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [sscSelection, setSscSelection] = useState(null);
  const [iscSelection, setIscSelection] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [candidates, setCandidates] = useState({
    SSC: [...INITIAL_SSC_CANDIDATES],
    ISC: { ...INITIAL_ISC_CANDIDATES },
  });
  const [institutes, setInstitutes] = useState([...INITIAL_INSTITUTES]);

  useEffect(() => {
    const saved = localStorage.getItem('tcgc_votes');
    if (!saved) {
      const initialVotes = {
        totalVotes: 0,
        votes: {},
      };
      localStorage.setItem('tcgc_votes', JSON.stringify(initialVotes));
    }
    const savedCandidates = localStorage.getItem('tcgc_candidates');
    if (savedCandidates) {
      const parsed = JSON.parse(savedCandidates);
      setCandidates(parsed.candidates || candidates);
      setInstitutes(parsed.institutes || institutes);
    } else {
      localStorage.setItem('tcgc_candidates', JSON.stringify({ candidates, institutes }));
    }
    const student = localStorage.getItem(`tcgc_student_${user.id}`);
    if (student) {
      const data = JSON.parse(student);
      setSelectedInstitute(data.institute);
      setSscSelection(data.ssc);
      setIscSelection(data.isc);
      setSubmitted(true);
    }
  }, []);

  const handleInstituteSelect = (institute) => {
    setSelectedInstitute(institute);
    setPhase(2);
  };

  const handleSubmit = () => {
    const voteData = {
      studentId: user.id,
      institute: selectedInstitute,
      ssc: sscSelection,
      isc: iscSelection,
      timestamp: new Date().toISOString(),
    };

    const votes = JSON.parse(localStorage.getItem('tcgc_votes') || '{"totalVotes":0,"votes":{}}');
    votes.totalVotes += 1;
    votes.votes[user.id] = voteData;
    localStorage.setItem('tcgc_votes', JSON.stringify(votes));

    localStorage.setItem(`tcgc_student_${user.id}`, JSON.stringify({
      institute: selectedInstitute,
      ssc: sscSelection,
      isc: iscSelection,
    }));

    setSubmitted(true);
  };

  const canSubmit = (sscSelection !== null) && (iscSelection !== null);

  if (submitted) {
    return (
      <div className="student-portal">
        <div className="success-container">
          <div className="success-card">
            <h2>Vote Submitted Successfully!</h2>
            <div className="vote-receipt">
              <h3>Voting Receipt</h3>
              <div className="receipt-row">
                <span className="receipt-label">Student ID:</span>
                <span className="receipt-value">{user.id}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Institute:</span>
                <span className="receipt-value">{selectedInstitute}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">SSC Vote:</span>
                <span className="receipt-value">{sscSelection?.name || 'No selection'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">ISC Vote:</span>
                <span className="receipt-value">{iscSelection?.name || 'No selection'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Date:</span>
                <span className="receipt-value">{new Date().toLocaleString()}</span>
              </div>
            </div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-portal">
      <div className="student-content">
        {phase === 1 && (
          <div className="phase-1">
            <h2>Select Your Institute</h2>
            <p className="instruction">Choose the institute you belong to</p>
            <div className="institute-buttons">
              {institutes.map((institute) => (
                <button
                  key={institute}
                  className="institute-btn"
                  onClick={() => handleInstituteSelect(institute)}
                >
                  {institute}
                </button>
              ))}
            </div>
            <div className="phase-footer">
              <button onClick={onLogout} className="logout-btn-secondary">Logout</button>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="phase-2">
            <div className="selected-institute">
              <span>Selected Institute: </span>
              <strong>{selectedInstitute}</strong>
            </div>

            <section className="council-section">
              <h3>Supreme Student Council (SSC)</h3>
              <p className="section-note">Vote for one candidate</p>
              <div className="candidates-grid">
                {candidates.SSC.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`candidate-card ${sscSelection?.id === candidate.id ? 'selected' : ''}`}
                    onClick={() => setSscSelection(candidate)}
                  >
                    <div className="candidate-avatar">{candidate.name.charAt(0)}</div>
                    <h4>{candidate.name}</h4>
                    <p className="position">{candidate.position}</p>
                    <p className="party">{candidate.party}</p>
                  </div>
                ))}
              </div>
              <button
                className={`abstain-btn ${sscSelection?.id === 'abstain' ? 'selected' : ''}`}
                onClick={() => setSscSelection({ id: 'abstain', name: 'I prefer not to vote', position: '', party: '' })}
              >
                I prefer not to vote
              </button>
            </section>

            <section className="council-section">
              <h3>Institute Student Council (ISC) - {selectedInstitute}</h3>
              <p className="section-note">Vote for one candidate</p>
              <div className="candidates-grid">
                {(candidates.ISC[selectedInstitute] || []).map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`candidate-card ${iscSelection?.id === candidate.id ? 'selected' : ''}`}
                    onClick={() => setIscSelection(candidate)}
                  >
                    <div className="candidate-avatar">{candidate.name.charAt(0)}</div>
                    <h4>{candidate.name}</h4>
                    <p className="position">{candidate.position}</p>
                    <p className="party">{candidate.party}</p>
                  </div>
                ))}
              </div>
              <button
                className={`abstain-btn ${iscSelection?.id === 'abstain' ? 'selected' : ''}`}
                onClick={() => setIscSelection({ id: 'abstain', name: 'I prefer not to vote', position: '', party: '' })}
              >
                I prefer not to vote
              </button>
            </section>

            <div className="submit-section">
              <button onClick={onLogout} className="logout-btn-secondary">Logout</button>
              <button
                className="submit-btn"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Submit Vote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [institutes, setInstitutes] = useState([...INITIAL_INSTITUTES]);
  const [candidates, setCandidates] = useState({
    SSC: [...INITIAL_SSC_CANDIDATES],
    ISC: { ...INITIAL_ISC_CANDIDATES },
  });
  const [votes, setVotes] = useState({ totalVotes: 0, votes: {} });
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    position: '',
    councilType: 'SSC',
    institute: 'Technology',
  });
  const [newInstitute, setNewInstitute] = useState('');
  const [activeSection, setActiveSection] = useState('analytics');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const savedCandidates = localStorage.getItem('tcgc_candidates');
    if (savedCandidates) {
      const parsed = JSON.parse(savedCandidates);
      setCandidates(parsed.candidates || candidates);
      setInstitutes(parsed.institutes || institutes);
    }
    const savedVotes = localStorage.getItem('tcgc_votes');
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.position) return;

    const id = `${newCandidate.councilType.toLowerCase()}-${Date.now()}`;
    const candidate = {
      id,
      name: newCandidate.name,
      position: newCandidate.position,
      party: newCandidate.party || 'Independent',
      type: newCandidate.councilType,
      institute: newCandidate.institute,
    };

    const updatedCandidates = { ...candidates };
    if (newCandidate.councilType === 'SSC') {
      updatedCandidates.SSC = [...updatedCandidates.SSC, candidate];
    } else {
      if (!updatedCandidates.ISC[newCandidate.institute]) {
        updatedCandidates.ISC[newCandidate.institute] = [];
      }
      updatedCandidates.ISC[newCandidate.institute] = [
        ...updatedCandidates.ISC[newCandidate.institute],
        candidate,
      ];
    }

    setCandidates(updatedCandidates);
    localStorage.setItem('tcgc_candidates', JSON.stringify({
      candidates: updatedCandidates,
      institutes,
    }));
    setNewCandidate({
      name: '',
      position: '',
      councilType: 'SSC',
      institute: 'Technology',
      party: '',
    });
  };

  const handleRemoveCandidate = (candidateId, councilType, institute) => {
    const updatedCandidates = { ...candidates };
    if (councilType === 'SSC') {
      updatedCandidates.SSC = updatedCandidates.SSC.filter((c) => c.id !== candidateId);
    } else {
      updatedCandidates.ISC[institute] = updatedCandidates.ISC[institute].filter(
        (c) => c.id !== candidateId
      );
    }
    setCandidates(updatedCandidates);
    localStorage.setItem('tcgc_candidates', JSON.stringify({
      candidates: updatedCandidates,
      institutes,
    }));
  };

  const handleAddInstitute = (e) => {
    e.preventDefault();
    if (!newInstitute || institutes.includes(newInstitute)) return;
    const updated = [...institutes, newInstitute];
    setInstitutes(updated);
    setCandidates((prev) => ({ ...prev, ISC: { ...prev.ISC, [newInstitute]: [] } }));
    localStorage.setItem('tcgc_candidates', JSON.stringify({
      candidates: { ...candidates, ISC: { ...candidates.ISC, [newInstitute]: [] } },
      institutes: updated,
    }));
    setNewInstitute('');
  };

  const handleRemoveInstitute = (institute) => {
    if (!window.confirm(`Are you sure you want to remove "${institute}"? All ISC candidates for this institute will also be removed.`)) return;
    const updated = institutes.filter((i) => i !== institute);
    const updatedCandidates = { ...candidates };
    delete updatedCandidates.ISC[institute];
    setInstitutes(updated);
    setCandidates(updatedCandidates);
    localStorage.setItem('tcgc_candidates', JSON.stringify({
      candidates: updatedCandidates,
      institutes: updated,
    }));
  };

  const handleResetVotes = () => {
    if (window.confirm('Are you sure you want to reset all votes?')) {
      localStorage.removeItem('tcgc_votes');
      localStorage.removeItem('tcgc_student_244444');
      setVotes({ totalVotes: 0, votes: {} });
    }
  };

  const getVoteCounts = () => {
    const counts = {};
    Object.values(votes.votes || {}).forEach((vote) => {
      if (vote.ssc) {
        counts[vote.ssc.id] = (counts[vote.ssc.id] || 0) + 1;
      }
      if (vote.isc) {
        counts[vote.isc.id] = (counts[vote.isc.id] || 0) + 1;
      }
    });
    return counts;
  };

  const voteCounts = getVoteCounts();

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeSection === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveSection('analytics')}
        >
          Analytics
        </button>
        <button
          className={`admin-tab ${activeSection === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveSection('candidates')}
        >
          Candidates
        </button>
        <button
          className={`admin-tab ${activeSection === 'institutes' ? 'active' : ''}`}
          onClick={() => setActiveSection('institutes')}
        >
          Institutes
        </button>
      </div>

      <div className="admin-content">
        {activeSection === 'analytics' && (
          <div className="analytics-section">
            <div className="stat-card">
              <h3>Total Votes Cast</h3>
              <p className="stat-number">{votes.totalVotes}</p>
            </div>

            <div className="results-section">
              <h3>SSC Results</h3>
              {candidates.SSC.map((c) => (
                <div key={c.id} className="result-item">
                  <span className="result-name">{c.name}</span>
                  <span className="result-position">({c.position})</span>
                  <div className="result-bar-container">
                    <div
                      className="result-bar"
                      style={{
                        width: `${votes.totalVotes > 0 ? (voteCounts[c.id] || 0) / votes.totalVotes * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="result-count">{voteCounts[c.id] || 0}</span>
                </div>
              ))}
            </div>

            {institutes.map((inst) => (
              <div key={inst} className="results-section">
                <h3>ISC - {inst}</h3>
                {(candidates.ISC[inst] || []).map((c) => (
                  <div key={c.id} className="result-item">
                    <span className="result-name">{c.name}</span>
                    <span className="result-position">({c.position})</span>
                    <div className="result-bar-container">
                      <div
                        className="result-bar"
                        style={{
                          width: `${votes.totalVotes > 0 ? (voteCounts[c.id] || 0) / votes.totalVotes * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="result-count">{voteCounts[c.id] || 0}</span>
                  </div>
                ))}
              </div>
            ))}

            <button className="reset-btn" onClick={handleResetVotes}>
              Reset All Votes
            </button>
          </div>
        )}

        {activeSection === 'candidates' && (
          <div className="candidates-section">
            <form onSubmit={handleAddCandidate} className="add-form">
              <h3>Add New Candidate</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Name"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={newCandidate.position}
                  onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Party (optional)"
                  value={newCandidate.party || ''}
                  onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                />
              </div>
              <div className="form-row">
                <select
                  value={newCandidate.councilType}
                  onChange={(e) => setNewCandidate({ ...newCandidate, councilType: e.target.value })}
                >
                  <option value="SSC">SSC</option>
                  <option value="ISC">ISC</option>
                </select>
                {newCandidate.councilType === 'ISC' && (
                  <select
                    value={newCandidate.institute}
                    onChange={(e) => setNewCandidate({ ...newCandidate, institute: e.target.value })}
                  >
                    {institutes.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                )}
                <button type="submit" className="add-btn">Add Candidate</button>
              </div>
            </form>

            <div className="candidate-lists">
              <h3>SSC Candidates</h3>
              <div className="candidate-list">
                {candidates.SSC.map((c) => (
                  <div key={c.id} className="candidate-item">
                    <div className="candidate-info">
                      <strong>{c.name}</strong> - {c.position} ({c.party})
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveCandidate(c.id, 'SSC')}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {institutes.map((inst) => (
                <div key={inst}>
                  <h3>ISC - {inst}</h3>
                  <div className="candidate-list">
                    {(candidates.ISC[inst] || []).map((c) => (
                      <div key={c.id} className="candidate-item">
                        <div className="candidate-info">
                          <strong>{c.name}</strong> - {c.position} ({c.party})
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveCandidate(c.id, 'ISC', inst)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'institutes' && (
          <div className="institutes-section">
            <form onSubmit={handleAddInstitute} className="add-form">
              <h3>Add New Institute</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Institute Name"
                  value={newInstitute}
                  onChange={(e) => setNewInstitute(e.target.value)}
                />
                <button type="submit" className="add-btn">Add Institute</button>
              </div>
            </form>
            <div className="institute-list">
              <h3>Current Institutes</h3>
              {institutes.map((inst) => (
                <div key={inst} className="institute-item">
                  <span>{inst}</span>
                  <div className="institute-actions">
                    <span className="candidate-count">
                      {candidates.ISC[inst]?.length || 0} candidates
                    </span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveInstitute(inst)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;