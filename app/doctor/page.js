import { redirect } from 'next/navigation';

export default function DoctorPage() {
  redirect('/doctor/dashboard');
}

const patientQueue = [
  { name: 'Jordan Lee', reason: 'Follow-up review', time: '09:15 AM' },
  { name: 'Ava Singh', reason: 'Lab result discussion', time: '09:45 AM' },
  { name: 'Ethan Kim', reason: 'Medication update', time: '10:30 AM' }
];

const todaySchedule = [
  { label: 'New patient consult', slot: '08:30 AM' },
  { label: 'Chart review session', slot: '10:00 AM' },
  { label: 'Team care huddle', slot: '01:30 PM' }
];

export default function DoctorDashboard() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctors[0].id);
  const [liveUpdate, setLiveUpdate] = useState('Monitoring patient queues and appointment flow.');
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, text: 'Patient queue updated with new intake.', time: '08:55 AM' },
    { id: 2, text: 'New lab results ready for review.', time: '08:42 AM' }
  ]);

  const activeDoctor = useMemo(
    () => doctors.find((doc) => doc.id === Number(selectedDoctor)),
    [selectedDoctor, doctors]
  );

  useEffect(() => {
    const statuses = ['Online', 'Away', 'Busy'];
    const interval = setInterval(() => {
      setDoctors((current) => {
        const index = Math.floor(Math.random() * current.length);
        const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const updated = current.map((doctor, idx) =>
          idx === index ? { ...doctor, status: nextStatus } : doctor
        );
        const changed = updated[index];

        setLiveUpdate(`Live update: ${changed.name} switched to ${changed.status.toLowerCase()}.`);
        setActivityFeed((feed) => [
          { id: Date.now(), text: `${changed.name} changed availability.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ...feed
        ].slice(0, 4));

        return updated;
      });
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const toggleStatus = () => {
    const nextOrder = ['Online', 'Away', 'Busy'];
    setDoctors((current) =>
      current.map((doctor) => {
        if (doctor.id !== activeDoctor.id) return doctor;
        const nextIndex = (nextOrder.indexOf(doctor.status) + 1) % nextOrder.length;
        return { ...doctor, status: nextOrder[nextIndex] };
      })
    );
  };

  return (
    <main className="page-shell dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="hero-badge">Doctor Dashboard</span>
          <h1>Manage your clinic flow.</h1>
          <p>See patient intake, availability status, and live care team updates in one place.</p>
        </div>
        <Link href="/" className="button-ghost">Return Home</Link>
      </header>

      <section className="role-grid">
        <article className="stat-card">
          <p>Today's patients</p>
          <strong>{patientQueue.length}</strong>
        </article>
        <article className="stat-card">
          <p>Online specialists</p>
          <strong>{doctors.filter((doc) => doc.status === 'Online').length}</strong>
        </article>
        <article className="stat-card">
          <p>Next procedure</p>
          <strong>{todaySchedule[0].slot}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <section className="panel panel--availability">
          <div className="panel-header">
            <span>Provider Availability</span>
            <h2>Live clinic status</h2>
          </div>
          <div className="availability-list">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="availability-card" style={{ background: doctor.color }}>
                <div>
                  <h4>{doctor.name}</h4>
                  <p>{doctor.specialty}</p>
                </div>
                <span className={`status-pill status-pill--${doctor.status.toLowerCase()}`}>{doctor.status}</span>
              </div>
            ))}
          </div>
          <div className="toggle-row">
            <label>
              Active doctor
              <select value={selectedDoctor} onChange={(event) => setSelectedDoctor(event.target.value)}>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
            </label>
            <button type="button" className="button-outline" onClick={toggleStatus}>
              Toggle status for {activeDoctor.name}
            </button>
          </div>
        </section>

        <section className="panel panel--queue">
          <div className="panel-header">
            <span>Patient Queue</span>
            <h2>Next cases</h2>
          </div>
          <div className="queue-list">
            {patientQueue.map((patient, idx) => (
              <div key={idx} className="queue-card">
                <div>
                  <h3>{patient.name}</h3>
                  <p>{patient.reason}</p>
                </div>
                <span>{patient.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel--schedule">
          <div className="panel-header">
            <span>Today's Schedule</span>
            <h2>Workload overview</h2>
          </div>
          <div className="schedule-list">
            {todaySchedule.map((item, index) => (
              <div key={index} className="schedule-card">
                <p>{item.label}</p>
                <strong>{item.slot}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel--live">
          <div className="panel-header">
            <span>Live Activity</span>
            <h2>Care team feed</h2>
          </div>
          <div className="live-summary">
            <p>{liveUpdate}</p>
          </div>
          <div className="activity-feed">
            {activityFeed.map((item) => (
              <div key={item.id} className="activity-item">
                <p>{item.text}</p>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
