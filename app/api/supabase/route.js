import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabaseServer';

const DOCTORS_TABLE = 'doctors';
const APPOINTMENTS_TABLE = 'appointments';
const PRESCRIPTIONS_TABLE = 'prescriptions';
const ACCESS_TOKEN_COOKIE = 'vitalsync-sb-access-token';
const REFRESH_TOKEN_COOKIE = 'vitalsync-sb-refresh-token';

function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function hasAccessToken(accessToken) {
  return typeof accessToken === 'string' && accessToken.split('.').length === 3;
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getAccessToken(request, body) {
  return body.accessToken || request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || '';
}

function setSessionCookies(response, session) {
  if (!session?.access_token) {
    return response;
  }

  const maxAge = Math.max(60, Number(session.expires_in || 3600));

  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  if (session.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

async function getAuthenticatedUser(supabase, accessToken) {
  if (!hasAccessToken(accessToken)) {
    return { user: null, error: new Error('Please sign in again before managing appointments.') };
  }

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
      return { user: null, error: new Error(error?.message || 'Please sign in again before managing appointments.') };
    }

    return { user: data.user, error: null };
  } catch (err) {
    // Network or connectivity error - not an auth error
    const message = err?.message || '';
    if (/failed to fetch|network|connect|econnreset|enotfound/i.test(message)) {
      return { user: null, error: new Error('Unable to reach Supabase. Check your internet connection and Supabase URL, then try again.') };
    }
    return { user: null, error: new Error(err?.message || 'Please sign in again before managing appointments.') };
  }
}

async function getAuthenticatedContext(request, body) {
  const accessToken = getAccessToken(request, body);
  const supabase = createSupabaseServerClient(accessToken);
  const authResult = await getAuthenticatedUser(supabase, accessToken);

  if (!authResult.error) {
    return {
      supabase,
      user: authResult.user,
      session: null,
      error: null,
    };
  }

  const refreshToken = body.refreshToken || request.cookies.get(REFRESH_TOKEN_COOKIE)?.value || '';

  if (!refreshToken) {
    return {
      supabase,
      user: null,
      session: null,
      error: authResult.error,
    };
  }

  try {
    const refreshClient = createSupabaseServerClient();
    const refreshResult = await refreshClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshResult.error || !refreshResult.data?.session?.access_token) {
      return {
        supabase,
        user: null,
        session: null,
        error: new Error(refreshResult.error?.message || 'Please sign in again before managing appointments.'),
      };
    }

    const refreshedAccessToken = refreshResult.data.session.access_token;
    const refreshedSupabase = createSupabaseServerClient(refreshedAccessToken);
    const refreshedAuth = await getAuthenticatedUser(refreshedSupabase, refreshedAccessToken);

    if (refreshedAuth.error) {
      return {
        supabase: refreshedSupabase,
        user: null,
        session: refreshResult.data.session,
        error: refreshedAuth.error,
      };
    }

    return {
      supabase: refreshedSupabase,
      user: refreshedAuth.user,
      session: refreshResult.data.session,
      error: null,
    };
  } catch (err) {
    return {
      supabase,
      user: null,
      session: null,
      error: new Error(err?.message || 'Please sign in again before managing appointments.'),
    };
  }
}

function authenticatedJson(data, session = null) {
  return setSessionCookies(NextResponse.json(data), session);
}

export async function POST(request) {
  const body = await readJsonBody(request);
  const action = body.action;
  const accessToken = getAccessToken(request, body);

  try {
    if (action === 'signIn') {
      const supabase = createSupabaseServerClient();
      const result = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

      if (result.error) {
        return errorResponse(result.error.message, 400);
      }

      return setSessionCookies(NextResponse.json(result.data), result.data?.session);
    }

    if (action === 'signUp') {
      const supabase = createSupabaseServerClient();
      const result = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: {
            role: body.role || 'patient',
          },
        },
      });

      if (result.error) {
        return errorResponse(result.error.message, 400);
      }

      return setSessionCookies(NextResponse.json(result.data), result.data?.session);
    }

    if (action === 'refreshSession') {
      const supabase = createSupabaseServerClient();
      const result = await supabase.auth.refreshSession({
        refresh_token: body.refreshToken || request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
      });

      if (result.error) {
        return errorResponse(result.error.message, 401);
      }

      return setSessionCookies(NextResponse.json(result.data), result.data?.session);
    }

    const supabase = createSupabaseServerClient(accessToken);

    if (action === 'fetchRegisteredDoctors') {
      const result = await supabase.from(DOCTORS_TABLE).select('*').order('name', { ascending: true });
      if (result.error) return errorResponse(result.error.message, 400);
      return NextResponse.json({ data: result.data || [] });
    }

    if (action === 'ensureDoctorProfile') {
      const result = await supabase
        .from(DOCTORS_TABLE)
        .upsert(body.payload, { onConflict: 'user_id' })
        .select()
        .single();
      if (result.error) return errorResponse(result.error.message, 400);
      return NextResponse.json({ data: result.data });
    }

    if (action === 'fetchAppointmentsForViewer') {
      const { supabase: authedSupabase, user, session, error } = await getAuthenticatedContext(request, body);
      if (error) return errorResponse(error.message, 401);

      let query = authedSupabase
        .from(APPOINTMENTS_TABLE)
        .select('*')
        .order('date', { ascending: true })
        .order('created_at', { ascending: false });

      if (body.role === 'doctor') {
        const doctorIds = [body.doctorId, user.id].filter(Boolean);
        query = doctorIds.length > 1
          ? query.or(doctorIds.map((id) => `doctor_id.eq.${id}`).join(','))
          : query.eq('doctor_id', body.doctorId);
      } else {
        query = query.eq('patient_user_id', user.id);
      }

      const result = await query;
      if (result.error) return errorResponse(result.error.message, 400);
      return authenticatedJson({ data: result.data || [] }, session);
    }

    if (action === 'createAppointmentRecord') {
      const { supabase: authedSupabase, user, session, error } = await getAuthenticatedContext(request, body);
      if (error) return errorResponse(error.message, 401);

      const payload = {
        ...body.payload,
        patient_id: `p_${user.id}`,
        patient_user_id: user.id,
        patient_email: user.email || body.payload?.patient_email || '',
        status: 'pending',
      };

      const result = await authedSupabase
        .from(APPOINTMENTS_TABLE)
        .insert(payload)
        .select()
        .single();
      if (result.error) return errorResponse(result.error.message, 400);
      return authenticatedJson({ data: result.data }, session);
    }

    if (action === 'updateAppointmentRecordStatus') {
      const { supabase: authedSupabase, session, error } = await getAuthenticatedContext(request, body);
      if (error) return errorResponse(error.message, 401);

      const result = await authedSupabase
        .from(APPOINTMENTS_TABLE)
        .update({ status: body.status })
        .eq('id', body.appointmentId)
        .select()
        .single();
      if (result.error) return errorResponse(result.error.message, 400);
      return authenticatedJson({ data: result.data }, session);
    }

    if (action === 'updateAppointmentRecord') {
      const { supabase: authedSupabase, user, session, error } = await getAuthenticatedContext(request, body);
      if (error) return errorResponse(error.message, 401);

      const result = await authedSupabase
        .from(APPOINTMENTS_TABLE)
        .update(body.payload)
        .eq('id', body.appointmentId)
        .eq('patient_user_id', user.id)
        .select()
        .single();
      if (result.error) return errorResponse(result.error.message, 400);
      return authenticatedJson({ data: result.data }, session);
    }

    if (action === 'deleteAppointmentRecord') {
      const { supabase: authedSupabase, user, session, error } = await getAuthenticatedContext(request, body);
      if (error) return errorResponse(error.message, 401);

      const result = await authedSupabase
        .from(APPOINTMENTS_TABLE)
        .delete()
        .eq('id', body.appointmentId)
        .eq('patient_user_id', user.id);
      if (result.error) return errorResponse(result.error.message, 400);
      return authenticatedJson({ ok: true }, session);
    }

    if (action === 'fetchPrescriptionsForPatient') {
      const result = await supabase
        .from(PRESCRIPTIONS_TABLE)
        .select('*')
        .eq('patient_id', body.patientUserId)
        .order('created_at', { ascending: false });
      if (result.error) return errorResponse(result.error.message, 400);
      return NextResponse.json({ data: result.data || [] });
    }

    if (action === 'fetchPrescriptionsForDoctor') {
      const result = await supabase
        .from(PRESCRIPTIONS_TABLE)
        .select('*')
        .eq('doctor_id', body.doctorUserId)
        .order('created_at', { ascending: false });
      if (result.error) return errorResponse(result.error.message, 400);
      return NextResponse.json({ data: result.data || [] });
    }

    if (action === 'createPrescriptionRecord') {
      const result = await supabase
        .from(PRESCRIPTIONS_TABLE)
        .insert(body.payload)
        .select()
        .single();
      if (result.error) return errorResponse(result.error.message, 400);
      return NextResponse.json({ data: result.data });
    }

    return errorResponse('Unsupported Supabase action.', 400);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unexpected server error.', 500);
  }
}
