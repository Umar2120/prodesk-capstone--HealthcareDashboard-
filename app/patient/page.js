'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const MENU_ITEMS = [
  { icon: '📊', label: 'Dashboard', id: 'dashboard' },
  { icon: '📅', label: 'Appointments', id: 'appointments' },
  { icon: '�', label: 'Book Appointment', id: 'book-appointment' },
  { icon: '�📋', label: 'Medical History', id: 'medical-history' },
  { icon: '💊', label: 'Prescriptions', id: 'prescriptions' },
  { icon: '🔍', label: 'Find Doctors', id: 'find-doctors' }
];

function PatientContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const profileParam = searchParams.get('profile');
      console.log('Profile param:', profileParam);
      if (profileParam) {
        const decoded = JSON.parse(decodeURIComponent(profileParam));
        console.log('Decoded profile:', decoded);
        setProfile(decoded);
      }
    } catch (error) {
      console.error('Failed to decode profile:', error);
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!profile) {
    return (
      <main className="page-shell">
        <p>Please select a profile first.</p>
        <Link href="/select-profile">Select Profile</Link>
      </main>
    );
  }

  return (
    <div className="patient-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-avatar">{profile.avatar}</span>
          <div className="sidebar-user">
            <h4>{profile.name}</h4>
            <p>{profile.age}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="sign-out-btn">Sign Out</button>
      </aside>

      <main className="patient-main">
        <header className="patient-header">
          <div className="header-search">
            <input type="text" placeholder="Search records, doctors..." />
          </div>
          <div className="header-right">
            <button className="notification-btn">🔔</button>
            <div className="profile-pill">
              <span>{profile.avatar}</span>
              <span>{profile.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <div className="patient-content">
          {activeSection === 'dashboard' && (
            <DashboardSection profile={profile} />
          )}
          {activeSection === 'appointments' && (
            <AppointmentsSection profile={profile} />
          )}
          {activeSection === 'book-appointment' && (
            <BookAppointmentSection profile={profile} />
          )}
          {activeSection === 'medical-history' && (
            <MedicalHistorySection profile={profile} />
          )}
          {activeSection === 'prescriptions' && (
            <PrescriptionsSection profile={profile} />
          )}
        </div>

        <footer className="footer-bar">
          <p>HIPAA Compliant · Real-time Monitoring · 256-bit Encryption</p>
        </footer>
      </main>
    </div>
  );
}

export default function PatientDashboard() {
  return <PatientContent />;
}

function DashboardSection({ profile }) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-greeting">
        <h1>Good morning, {profile.name.split(' ')[0]} 👋</h1>
        <p>Wednesday, April 8, 2026 · Here's your health overview</p>
      </div>

      <div className="alert-banner">
        <span className="alert-icon">⚠️</span>
        <div>
          <h4>Active Conditions Reminder</h4>
          <p>Managing: {profile.conditions}. Stay consistent with your prescribed medications.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-icon">📅</span>
          <p>Upcoming Appointments</p>
          <strong>{profile.appointments.filter(a => a.status === 'Scheduled').length}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-icon">💊</span>
          <p>Active Prescriptions</p>
          <strong>{profile.prescriptions.filter(p => p.status === 'Active').length}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-icon">⚕️</span>
          <p>Active Conditions</p>
          <strong>{profile.conditions.split(', ').length}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-icon">📊</span>
          <p>Last Visit</p>
          <strong>Mar 28</strong>
        </div>
      </div>

      <div className="vitals-section">
        <h3>Current Vitals</h3>
        <div className="vitals-grid">
          <div className="vital-card">
            <span className="vital-icon">❤️</span>
            <strong>{profile.vitals.heartRate.value}</strong>
            <p>{profile.vitals.heartRate.unit}</p>
            <span className="vital-label">Heart Rate</span>
          </div>
          <div className="vital-card">
            <span className="vital-icon">📈</span>
            <strong>{profile.vitals.bloodPressure.value}</strong>
            <p>{profile.vitals.bloodPressure.unit}</p>
            <span className="vital-label">Blood Pressure</span>
          </div>
          <div className="vital-card">
            <span className="vital-icon">💨</span>
            <strong>{profile.vitals.o2Saturation.value}</strong>
            <p>{profile.vitals.o2Saturation.unit}</p>
            <span className="vital-label">O₂ Saturation</span>
          </div>
          <div className="vital-card">
            <span className="vital-icon">🌡️</span>
            <strong>{profile.vitals.temperature.value}</strong>
            <p>{profile.vitals.temperature.unit}</p>
            <span className="vital-label">Temperature</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppointmentsSection({ profile }) {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Scheduled', 'Completed', 'Cancelled'];
  const filtered = profile.appointments.filter(
    (a) => tab === 'All' || a.status === tab
  );

  return (
    <section className="appointments-section">
      <div className="section-header">
        <h2>Appointments</h2>
        <p>Manage and schedule your visits</p>
      </div>

      <div className="tabs-container">
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="appointments-list">
        {filtered.map((apt) => (
          <div key={apt.id} className="appointment-item">
            <div className="appointment-info">
              <h3>{apt.doctor}</h3>
              <p>{apt.specialty}</p>
              <div className="appointment-meta">
                <span>📅 {apt.date.split('-').reverse().join('/')} · {apt.time}</span>
                <span>📍 {apt.location}</span>
              </div>
              <p className="appointment-reason">📋 {apt.reason}</p>
            </div>
            <div className="appointment-status">
              <span className={`status-badge status-${apt.status.toLowerCase()}`}>
                {apt.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MedicalHistorySection({ profile }) {
  const eventTypes = ['All Events', 'Clinical Visit', 'Lab Results', 'Procedure'];
  const [eventType, setEventType] = useState('All Events');
  const filtered = profile.medicalHistory.filter(
    (h) => eventType === 'All Events' || h.type === eventType
  );

  return (
    <section className="medical-history-section">
      <div className="section-header">
        <h2>Medical History</h2>
        <p>Complete chronological health record for {profile.name}</p>
      </div>

      <div className="profile-info-bar">
        <div className="info-item">
          <span>Full Name</span>
          <strong>{profile.name}</strong>
        </div>
        <div className="info-item">
          <span>Blood Type</span>
          <strong>{profile.bloodType}</strong>
        </div>
        <div className="info-item">
          <span>Allergies</span>
          <strong>{profile.allergies}</strong>
        </div>
        <div className="info-item">
          <span>Conditions</span>
          <strong>{profile.conditions}</strong>
        </div>
      </div>

      <div className="tabs-container">
        {eventTypes.map((t) => (
          <button
            key={t}
            className={`tab ${eventType === t ? 'active' : ''}`}
            onClick={() => setEventType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="history-timeline">
        {filtered.map((item, idx) => (
          <div key={idx} className="history-item">
            <div className="history-date">{item.date}</div>
            <div className="history-marker" />
            <div className="history-content">
              <h4>{item.title}</h4>
              <p className="history-type">{item.type}</p>
              <p className="history-doctor">Dr. {item.doctor.split(' ').slice(1).join(' ')}</p>
              <p className="history-note">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrescriptionsSection({ profile }) {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Active', 'Expired', 'Filled'];
  const filtered = profile.prescriptions.filter(
    (p) => tab === 'All' || p.status === tab
  );

  return (
    <section className="prescriptions-section">
      <div className="section-header">
        <h2>Prescriptions</h2>
        <p>Your medication history and current prescriptions</p>
      </div>

      <div className="rx-stats">
        <div className="rx-stat-card">
          <span>💊</span>
          <p>Active Prescriptions</p>
          <strong>{profile.prescriptions.filter((p) => p.status === 'Active').length}</strong>
        </div>
        <div className="rx-stat-card">
          <span>📋</span>
          <p>Total Medications</p>
          <strong>{profile.prescriptions.length}</strong>
        </div>
      </div>

      <div className="tabs-container">
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="prescriptions-list">
        {filtered.map((rx) => (
          <div key={rx.id} className="prescription-item">
            <div className="rx-header">
              <h3>{rx.name}</h3>
              <span className={`rx-status rx-${rx.status.toLowerCase()}`}>
                {rx.status}
              </span>
            </div>
            <p className="rx-dose">💊 {rx.dose}</p>
            <p className="rx-prescriber">👨‍⚕️ {rx.prescriber}</p>
            <p className="rx-date">📅 Started: {rx.dateStarted}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BookAppointmentSection({ profile }) {
  const { doctors } = require('../../../lib/mockData');
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consultation');
  const [notes, setNotes] = useState('');
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const appointmentTypes = ['Consultation', 'Follow-up', 'Check-up', 'Lab Work'];

  const handleBooking = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      setBookedSuccess(true);
      setTimeout(() => {
        setStep(1);
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
        setBookedSuccess(false);
      }, 3000);
    }
  };

  if (bookedSuccess) {
    return (
      <section className="book-appointment-section">
        <div className="booking-success">
          <div className="success-icon">✅</div>
          <h2>Appointment Booked!</h2>
          <p>Your appointment has been scheduled and is pending doctor approval.</p>
          <p className="success-message">You'll be notified once Dr. {selectedDoctor?.name.split(' ')[1]} confirms.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="book-appointment-section">
      <div className="section-header">
        <h2>Book an Appointment</h2>
        <p>Schedule a consultation with a healthcare professional</p>
      </div>

      {/* Progress Indicator */}
      <div className="progress-steps">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`step ${s <= step ? 'active' : ''} ${s < step ? 'completed' : ''}`}>
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="step-content">
          <h3>Select a Doctor</h3>
          <div className="doctor-grid">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setStep(2);
                }}
              >
                <img src={doctor.photo} alt={doctor.name} />
                <h4>{doctor.name}</h4>
                <p>{doctor.specialty}</p>
                <div className="doctor-rating">⭐ {doctor.rating}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedDoctor && (
        <div className="step-content">
          <button
            className="back-button"
            onClick={() => setStep(1)}
          >
            ← Back
          </button>
          <h3>{selectedDoctor.name}</h3>

          <div className="form-group">
            <label>Appointment Type</label>
            <div className="type-selector">
              {appointmentTypes.map((type) => (
                <button
                  key={type}
                  className={`type-btn ${appointmentType === type ? 'active' : ''}`}
                  onClick={() => setAppointmentType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>Time</label>
              <div className="time-selector">
                {selectedDoctor.slots.map((slot) => (
                  <button
                    key={slot}
                    className={`time-btn ${selectedTime === slot ? 'active' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your symptoms..."
            />
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              className="btn-primary"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
            >
              Review
            </button>
          </div>
        </div>
      )}

      {step === 3 && selectedDoctor && selectedDate && selectedTime && (
        <div className="step-content">
          <button
            className="back-button"
            onClick={() => setStep(2)}
          >
            ← Back
          </button>
          <h3>Review Your Appointment</h3>

          <div className="review-box">
            <div className="review-item">
              <span className="label">Doctor</span>
              <span className="value">{selectedDoctor.name}</span>
            </div>
            <div className="review-item">
              <span className="label">Specialty</span>
              <span className="value">{selectedDoctor.specialty}</span>
            </div>
            <div className="review-item">
              <span className="label">Date</span>
              <span className="value">{new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="review-item">
              <span className="label">Time</span>
              <span className="value">{selectedTime}</span>
            </div>
            <div className="review-item">
              <span className="label">Type</span>
              <span className="value">{appointmentType}</span>
            </div>
            <div className="review-item status-pending">
              <span className="label">Status</span>
              <span className="value">⏳ Pending Approval</span>
            </div>
            {notes && (
              <div className="review-item">
                <span className="label">Notes</span>
                <span className="value">{notes}</span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn-success" onClick={handleBooking}>
              ✓ Confirm Booking
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
