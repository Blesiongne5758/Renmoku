import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: 'Supabase credentials not configured' }, { status: 500, headers: cors });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    if (req.method === 'GET') {
      return Response.json({
        service: 'Renmoku GPS Gateway',
        status: 'online',
        supportedProtocols: ['GT06', 'Concox', 'TK103', 'Coban', 'Sinotrack', 'Teltonika', 'Traccar', 'JSON-Webhook'],
        endpoint: '/functions/v1/gps-gateway',
        timestamp: new Date().toISOString(),
      }, { headers: cors });
    }

    const payload = await req.json();
    const {
      vehicle_id,
      imei,
      latitude,
      longitude,
      speed = 0,
      heading = 0,
      timestamp,
      panic = false,
      engine_status,
      battery,
      signal,
    } = payload;

    if (!latitude || !longitude || (!vehicle_id && !imei)) {
      return Response.json({
        error: 'Missing required parameters. Required: latitude, longitude, and vehicle_id (or imei)',
      }, { status: 400, headers: cors });
    }

    let targetVehicleId = vehicle_id;

    // Look up vehicle by IMEI if vehicle_id not supplied
    if (!targetVehicleId && imei) {
      const { data: device } = await supabase
        .from('vehicle_gps_devices')
        .select('vehicle_id')
        .eq('imei', imei)
        .maybeSingle();

      if (device?.vehicle_id) {
        targetVehicleId = device.vehicle_id;
      }
    }

    if (!targetVehicleId) {
      return Response.json({ error: 'Vehicle not found for given IMEI or ID' }, { status: 404, headers: cors });
    }

    const recordedAt = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    // 1. Ingest into vehicle_gps_locations
    const { error: locationError } = await supabase
      .from('vehicle_gps_locations')
      .upsert({
        vehicle_id: targetVehicleId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        speed: Number(speed),
        heading: Number(heading),
        recorded_at: recordedAt,
        received_at: new Date().toISOString(),
      }, { onConflict: 'vehicle_id' });

    if (locationError) {
      return Response.json({ error: locationError.message }, { status: 500, headers: cors });
    }

    // 2. Update device status if exists
    if (battery !== undefined || signal !== undefined || engine_status !== undefined) {
      const updates: Record<string, any> = {
        last_heartbeat: new Date().toISOString(),
        status: 'ONLINE',
      };
      if (battery !== undefined) updates.battery_level = Number(battery);
      if (signal !== undefined) updates.signal_strength = Number(signal);
      if (engine_status !== undefined) updates.engine_cut_status = engine_status === 'killed' || engine_status === false;

      await supabase
        .from('vehicle_gps_devices')
        .update(updates)
        .eq('vehicle_id', targetVehicleId);
    }

    // 3. Trigger panic broadcast if panic flag is raised
    if (panic) {
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('brand, model, location')
        .eq('id', targetVehicleId)
        .maybeSingle();

      const vehicleName = vehicleData ? `${vehicleData.brand} ${vehicleData.model}` : 'Kendaraan';
      const city = vehicleData?.location || 'Terdekat';

      await supabase.rpc('trigger_gps_panic_alert', {
        p_vehicle_id: targetVehicleId,
        p_vehicle_name: vehicleName,
        p_license_plate: 'Darurat SOS',
        p_latitude: Number(latitude),
        p_longitude: Number(longitude),
        p_city: city,
        p_speed: Number(speed),
        p_notes: 'Trigger otomatis via Hardware SOS GPS Tracker',
      });
    }

    return Response.json({
      success: true,
      vehicle_id: targetVehicleId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: Number(speed),
      heading: Number(heading),
      recorded_at: recordedAt,
    }, { headers: cors });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Internal server error' }, { status: 500, headers: cors });
  }
});
