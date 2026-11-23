export interface Medicine {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  priceFormatted: string;
  dosageCount: string;
  description: string;
  bgColor: string;
  imageEmoji: string;
}

export const MEDICINES: Medicine[] = [
  {
    id: '1',
    name: 'Women Multivitamin',
    subtitle: 'hera.',
    price: 29.0,
    priceFormatted: '$29.00',
    dosageCount: '30X',
    description:
      'Women Multivitamin supports daily nutrition, boosts energy, strengthens immunity, improves hair, skin, and nail health, and helps maintain overall wellness for women.',
    bgColor: '#D5F5F6',
    imageEmoji: '💊',
  },
  {
    id: '2',
    name: 'Women Probiotics',
    subtitle: 'hera.',
    price: 24.99,
    priceFormatted: '$24.99',
    dosageCount: '60X',
    description:
      'Women Probiotics supports gut health, improves digestion, boosts immune function, and helps maintain a healthy vaginal microbiome for overall wellness.',
    bgColor: '#FED4DD',
    imageEmoji: '🧬',
  },
  {
    id: '3',
    name: 'Calcium Core',
    subtitle: 'hera.',
    price: 19.99,
    priceFormatted: '$19.99',
    dosageCount: '90X',
    description:
      'Calcium Core provides essential calcium and vitamin D3 to support strong bones and teeth, reduce fracture risk, and promote healthy muscle function.',
    bgColor: '#D5F5F6',
    imageEmoji: '🦴',
  },
  {
    id: '4',
    name: 'Iron Boost',
    subtitle: 'hera.',
    price: 15.99,
    priceFormatted: '$15.99',
    dosageCount: '30X',
    description:
      'Iron Boost helps combat iron deficiency, supports healthy red blood cell production, reduces fatigue, and promotes oxygen transport throughout the body.',
    bgColor: '#FED4DD',
    imageEmoji: '❤️',
  },
];

export const PRESCRIPTION_DEMO = {
  patientConcern: "Patient's concern:\n   Headache",
  recommendation: 'Recommendation:\n  Yakapsule!\n  3x a day!',
  statusText:
    'Please wait a few seconds. We are analyzing your prescription...',
  progressPercent: 75,
};

export const USER_PROFILE = {
  name: 'Aryan Singh',
  location: 'U.P India',
  avatar: '👤',
};
