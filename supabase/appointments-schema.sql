create extension if not exists pgcrypto;

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  name text not null,
  specialty text default 'General Medicine',
  photo text,
  available boolean not null default true,
  rating numeric(2,1) not null default 4.8,
  experience integer not null default 5,
  hospital text default 'VitalSync Medical Center',
  department text default 'General Medicine',
  next_available text default 'Today, 2:00 PM',
  slots text[] not null default array['9:00 AM','10:30 AM','2:00 PM','3:30 PM','4:30 PM'],
  bio text default 'Care-focused physician available for consultations and follow-up visits.',
  patients integer not null default 0,
  phone text,
  dob text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null,
  patient_user_id uuid not null,
  patient_name text not null,
  patient_email text not null,
  patient_photo text,
  doctor_id text not null,
  doctor_name text not null,
  doctor_specialty text,
  doctor_photo text,
  date date not null,
  time text not null,
  type text not null,
  notes text default '',
  status text not null default 'pending' check (status in ('pending', 'scheduled', 'completed', 'cancelled')),
  location text,
  created_at timestamptz not null default now()
);

alter table public.doctors enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "authenticated users can read doctors" on public.doctors;
drop policy if exists "doctors can upsert own profile" on public.doctors;
drop policy if exists "doctors can update own profile" on public.doctors;
drop policy if exists "authenticated users can read appointments" on public.appointments;
drop policy if exists "patients can create own appointments" on public.appointments;
drop policy if exists "authenticated users can update appointments" on public.appointments;
drop policy if exists "patients can delete own appointments" on public.appointments;

create policy "authenticated users can read doctors"
on public.doctors
for select
to authenticated
using (true);

create policy "doctors can upsert own profile"
on public.doctors
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "doctors can update own profile"
on public.doctors
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "authenticated users can read appointments"
on public.appointments
for select
to authenticated
using (true);

create policy "patients can create own appointments"
on public.appointments
for insert
to authenticated
with check (auth.uid() = patient_user_id);

create policy "authenticated users can update appointments"
on public.appointments
for update
to authenticated
using (true)
with check (true);

create policy "patients can delete own appointments"
on public.appointments
for delete
to authenticated
using (auth.uid() = patient_user_id);

-- Prescriptions table
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null,
  patient_id uuid not null,
  patient_name text not null,
  patient_email text not null,
  doctor_id uuid not null,
  doctor_name text not null,
  medicine_name text not null,
  dosage text not null,
  frequency text not null,
  instructions text default '',
  duration text,
  refills integer default 0,
  status text not null default 'active' check (status in ('active', 'expired', 'filled')),
  pharmacy text,
  expiry_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.prescriptions enable row level security;

drop policy if exists "patients can read own prescriptions" on public.prescriptions;
drop policy if exists "doctors can create prescriptions" on public.prescriptions;
drop policy if exists "doctors can update prescriptions" on public.prescriptions;

create policy "patients can read own prescriptions"
on public.prescriptions
for select
to authenticated
using (auth.uid() = patient_id);

create policy "doctors can create prescriptions"
on public.prescriptions
for insert
to authenticated
with check (auth.uid() = doctor_id);

create policy "doctors can update prescriptions"
on public.prescriptions
for update
to authenticated
using (auth.uid() = doctor_id)
with check (auth.uid() = doctor_id);
