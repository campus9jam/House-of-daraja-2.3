import { supabase } from '../supabase';

export const GARMENT_OPTIONS = {
  female: [
    { value: 'dress', label: 'Dress' },
    { value: 'skirt', label: 'Skirt' },
    { value: 'skate', label: 'Skate' },
    { value: 'jumpsuit', label: 'Jumpsuit' },
    { value: 'other', label: 'Other' },
  ],
  male: [
    { value: 'trouser', label: 'Trouser' },
    { value: 'shirt', label: 'Shirt' },
    { value: 'native', label: 'Native' },
    { value: 'jumpsuit', label: 'Jumpsuit' },
    { value: 'other', label: 'Other' },
  ],
};

export function measurementFields(gender, garmentType) {
  const common = [
    { key: 'waist', label: 'Waist' },
    { key: 'shoulder', label: 'Shoulder' },
  ];
  if (gender === 'female') {
    const fields = [
      { key: 'bust_chest', label: 'Bust' },
      ...common,
      { key: 'hips', label: 'Hips' },
      { key: 'length', label: 'Outfit Length' },
      { key: 'sleeve_length', label: 'Sleeve Length' },
    ];
    if (garmentType === 'skate') fields.push({ key: 'thigh', label: 'Thigh' });
    return fields;
  }
  return [
    { key: 'bust_chest', label: 'Chest' },
    ...common,
    { key: 'inseam', label: 'Inseam' },
    { key: 'length', label: 'Trouser/Outfit Length' },
    { key: 'thigh', label: 'Thigh' },
    { key: 'ankle', label: 'Ankle' },
    { key: 'sleeve_length', label: 'Sleeve Length' },
  ];
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Please sign in before submitting an atelier commission.');
  return data.user;
}

export async function createAtelierCommission(input) {
  const user = await getCurrentUser();
  const numeric = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const measurementPayload = {
    user_id: user.id,
    label: input.measurementLabel || `${input.gender === 'female' ? 'Female' : 'Male'} ${input.garmentType} profile`,
    gender: input.gender,
    garment_type: input.garmentType,
    chest: numeric(input.bust_chest),
    waist: numeric(input.waist),
    hips: numeric(input.hips),
    shoulder: numeric(input.shoulder),
    sleeve: numeric(input.sleeve_length),
    inseam: numeric(input.inseam),
    thigh: numeric(input.thigh),
    arm_length: numeric(input.arm_length),
    outfit_length: numeric(input.length),
    ankle: numeric(input.ankle),
    neck: numeric(input.neck),
    fit_preference: input.fitPreference || 'regular',
    body_type: input.bodyType || 'regular',
    is_default: false,
  };

  const { data: measurement, error: measurementError } = await supabase
    .from('atelier_measurements')
    .insert(measurementPayload)
    .select('id')
    .single();
  if (measurementError) throw measurementError;

  const orderPayload = {
    user_id: user.id,
    measurement_profile_id: measurement.id,
    gender: input.gender,
    garment_type: input.garmentType,
    occasion: input.occasion || null,
    fabric: input.fabric || null,
    color: input.color || null,
    bust_chest: numeric(input.bust_chest),
    waist: numeric(input.waist),
    hips: numeric(input.hips),
    shoulder: numeric(input.shoulder),
    sleeve_length: numeric(input.sleeve_length),
    inseam: numeric(input.inseam),
    length: numeric(input.length),
    neck: numeric(input.neck),
    thigh: numeric(input.thigh),
    arm_length: numeric(input.arm_length),
    ankle: numeric(input.ankle),
    body_type: input.bodyType || 'regular',
    fit_preference: input.fitPreference || 'regular',
    reference_images: input.referenceImages || [],
    special_instructions: input.specialInstructions || null,
    ai_suggestions: input.aiSuggestions || {},
    status: 'submitted',
  };

  const { data: order, error: orderError } = await supabase
    .from('atelier_orders')
    .insert(orderPayload)
    .select('*')
    .single();

  if (orderError) throw orderError;
  return order;
}

export async function awardLee({ amount, eventType, referenceId, description, metadata = {} }) {
  const user = await getCurrentUser();
  const { data, error } = await supabase.rpc('award_lee', {
    p_user_id: user.id,
    p_amount: amount,
    p_event_type: eventType,
    p_reference_id: referenceId || null,
    p_description: description || null,
    p_metadata: metadata,
  });
  if (error) throw error;
  return data;
}
