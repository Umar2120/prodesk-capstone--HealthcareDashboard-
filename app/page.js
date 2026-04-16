'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Heart,
  HeartPulse,
  Shield,
  Stethoscope,
  UserRound,
} from 'lucide-react';

const roleCards = [
  {
    href: '/login?role=patient',
    title: "I'm a Patient",
    description:
      'View appointments, medical history, prescriptions, and connect with your care team.',
    cta: 'Continue as Patient',
    accent: 'blue',
    Icon: UserRound,
  },
  {
    href: '/login?role=doctor',
    title: "I'm a Doctor",
    description:
      'Manage patient schedules, review records, update availability, and coordinate care.',
    cta: 'Continue as Doctor',
    accent: 'teal',
    Icon: Stethoscope,
  },
];

const trustItems = [
  { label: 'HIPAA Compliant', Icon: Shield },
  { label: 'Real-time Monitoring', Icon: Activity },
  { label: '256-bit Encryption', Icon: HeartPulse },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#16224f] text-white">
      <div className="relative mx-auto flex min-h-screen max-w-[1280px] flex-col px-5 pb-5 pt-7 sm:px-8 lg:px-10">
        <header className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3384ff] shadow-[0_10px_25px_rgba(51,132,255,0.35)]">
            <Heart className="h-5 w-5 fill-white text-white" strokeWidth={2.4} />
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-[21px] font-semibold tracking-[-0.02em] text-white">
              VitalSync
            </span>
            <span className="text-base font-medium text-[#59a8ff]">Healthcare</span>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center pb-10 pt-14">
          <div className="w-full max-w-[920px] text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#2f4f93] bg-[#20356e] px-5 py-2 text-sm font-medium text-[#8ebcf9] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Activity className="h-4 w-4" strokeWidth={2.3} />
              Intelligent Healthcare Platform
            </div>

            <h1 className="mx-auto mt-9 max-w-[640px] text-[42px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[58px]">
              Your health, connected.
            </h1>

            <p className="mx-auto mt-6 max-w-[720px] text-[17px] leading-8 text-[#93a3c9] sm:text-[18px]">
              Seamless care coordination between patients and physicians
              <br className="hidden sm:block" /> all in one place.
            </p>
          </div>

          <div className="mt-14 grid w-full max-w-[1020px] gap-5 lg:grid-cols-2">
            {roleCards.map(({ href, title, description, cta, accent, Icon }) => {
              const isBlue = accent === 'blue';

              return (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-[22px] border border-[rgba(255,255,255,0.07)] bg-[rgba(46,58,108,0.96)] px-9 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.12)]"
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-[18px] ${
                      isBlue ? 'bg-[#304f97] text-[#63a6ff]' : 'bg-[#1d5c74] text-[#22d3d3]'
                    }`}
                  >
                    <Icon className="h-8 w-8" strokeWidth={2.1} />
                  </div>

                  <h2 className="mt-8 text-[24px] font-semibold tracking-[-0.02em] text-white">
                    {title}
                  </h2>

                  <p className="mt-4 max-w-[430px] text-[16px] leading-8 text-[#9aa7c7]">
                    {description}
                  </p>

                  <span
                    className={`mt-8 inline-flex items-center gap-3 text-[16px] font-semibold ${
                      isBlue ? 'text-[#54a5ff]' : 'text-[#18d4cf]'
                    }`}
                  >
                    {cta}
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-5 border-t border-[rgba(255,255,255,0.06)] pt-4 text-sm text-[#6d7ea8]">
          {trustItems.map(({ label, Icon }, index) => (
            <div key={label} className="flex items-center gap-4">
              {index > 0 ? <span className="hidden text-[#4d5e8d] sm:block">.</span> : null}
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" strokeWidth={2.1} />
                {label}
              </span>
            </div>
          ))}
        </footer>
      </div>
    </main>
  );
}
