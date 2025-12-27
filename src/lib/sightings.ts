import { supabase } from '@/integrations/supabase/client';

export interface SightingData {
  species: string;
  confidence_score: number;
  behavior: string;
  latitude: number;
  longitude: number;
  address?: string;
  image_url?: string;
  analysis_result: any;
  proximity_warning: boolean;
  notes?: string;
}

export async function uploadSightingImage(
  imageBase64: string,
  userId: string
): Promise<string | null> {
  try {
    // Convert base64 to blob
    const base64Data = imageBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Create unique filename
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('bee-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bee-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadSightingImage:', error);
    return null;
  }
}

export async function saveSighting(sighting: SightingData, userId?: string) {
  try {
    const { data, error } = await supabase
      .from('bee_sightings')
      .insert({
        user_id: userId || null,
        species: sighting.species as any,
        confidence_score: sighting.confidence_score,
        behavior: sighting.behavior as any,
        latitude: sighting.latitude,
        longitude: sighting.longitude,
        address: sighting.address,
        image_url: sighting.image_url,
        analysis_result: sighting.analysis_result,
        proximity_warning: sighting.proximity_warning,
        notes: sighting.notes,
        status: 'reported' as any,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving sighting:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveSighting:', error);
    return null;
  }
}

export async function getSightings() {
  try {
    const { data, error } = await supabase
      .from('bee_sightings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sightings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSightings:', error);
    return [];
  }
}

export async function createRelocationRequest(
  sightingId: string,
  requesterId: string,
  contactPhone?: string,
  contactEmail?: string,
  notes?: string,
  urgency: string = 'normal'
) {
  try {
    const { data, error } = await supabase
      .from('relocation_requests')
      .insert({
        sighting_id: sightingId,
        requester_id: requesterId,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        additional_notes: notes,
        urgency,
        status: 'pending',
        request_type: 'relocate',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating relocation request:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createRelocationRequest:', error);
    return null;
  }
}

export async function getRelocationRequests(userId: string) {
  try {
    const { data, error } = await supabase
      .from('relocation_requests')
      .select(`
        *,
        bee_sightings (*)
      `)
      .or(`requester_id.eq.${userId},guardian_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching relocation requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRelocationRequests:', error);
    return [];
  }
}

export async function getNearbyGuardians(lat: number, lng: number) {
  try {
    const { data, error } = await supabase
      .from('urban_guardians')
      .select('*')
      .eq('is_available', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching guardians:', error);
      return [];
    }

    // Filter by distance (simple approximation)
    return (data || []).filter(guardian => {
      if (!guardian.latitude || !guardian.longitude) return true;
      const distance = getDistance(lat, lng, Number(guardian.latitude), Number(guardian.longitude));
      return distance <= (guardian.radius_km || 25);
    });
  } catch (error) {
    console.error('Error in getNearbyGuardians:', error);
    return [];
  }
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
