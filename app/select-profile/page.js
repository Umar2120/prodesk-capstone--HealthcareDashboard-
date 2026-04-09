'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { patientProfiles, doctorProfiles } from '@/lib/profiles';

export default function ProfileSelect() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleProfileSelect = (profile) => {
    const encoded = encodeURIComponent(JSON.stringify(profile));
    if (profile.role === 'Patient') {
      router.push(`/patient?profile=${encoded}`);
    } else {
      router.push(`/doctor?profile=${encoded}`);
    }
  };

  if (!selectedRole) {
    return (
      <main className="page-shell profile-select-page">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">V</span>
            <div>
              <p>VitalSync</p>
              <span>Healthcare</span>
            </div>
          </div>
        </header>

        <section className="profile-hero">
          <div className="profile-copy">
            <h1>Select Your Profile</h1>
            <p>Choose a role and profile to experience VitalSync.</p>
          </div>

          <div className="role-buttons-container">
            <button
              className="role-button role-button--patient"
              onClick={() => setSelectedRole('Patient')}
            >
              <span className="role-button-icon">👤</span>
              <span className="role-button-text">Patient</span>
            </button>
            <button
              className="role-button role-button--doctor"
              onClick={() => setSelectedRole('Doctor')}
            >
              <span className="role-button-icon">👨‍⚕️</span>
              <span className="role-button-text">Doctor</span>
            </button>
          </div>
        </section>

        <footer className="footer-bar">
          <p>HIPAA Compliant · Real-time Monitoring · 256-bit Encryption</p>
        </footer>
      </main>
    );
  }

  const profiles = selectedRole === 'Patient' ? patientProfiles : doctorProfiles;

  return (
    <main className="page-shell profile-select-page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">V</span>
          <div>
            <p>VitalSync</p>
            <span>Healthcare</span>
          </div>
        </div>
      </header>

      <section className="profile-grid-section">
        <div className="profile-header">
          <h2>Select a {selectedRole} Profile</h2>
          <button
            className="back-button"
            onClick={() => setSelectedRole(null)}
          >
            ← Back
          </button>
        </div>

        <div className="profile-cards-grid">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="profile-card"
              onClick={() => handleProfileSelect(profile)}
            >
              <div className="profile-card-header">
                <div className="profile-avatar">{profile.avatar}</div>
                <button className="select-profile-btn">
                  Select Profile →
                </button>
              </div>
              <h3>{profile.name}</h3>
              <p className="profile-detail">{profile.specialty || `${profile.age} • ${profile.status}`}</p>
              {profile.role === 'Patient' ? (
                <>
                  <p className="profile-meta">Allergies: {profile.allergies}</p>
                  <p className="profile-meta">Conditions: {profile.conditions}</p>
                </>
              ) : (
                <>
                  <p className="profile-meta">License: {profile.licenseNumber}</p>
                  <p className="profile-meta">Experience: {profile.yearsExperience}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-bar">
        <p>HIPAA Compliant · Real-time Monitoring · 256-bit Encryption</p>
      </footer>
    </main>
  );
}
