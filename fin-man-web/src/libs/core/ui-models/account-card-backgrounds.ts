export interface AccountCardBackground {
  id: string;
  label: string;
  src: string;
  textColor: string;
  accentColor: string;
}

export const ACCOUNT_CARD_BACKGROUNDS: AccountCardBackground[] = [
  {
    id: 'bankinter',
    label: 'Bankinter',
    src: 'assets/card-backgrounds/bankinter_card_background.png',
    textColor: '#1f2937',
    accentColor: '#f97316',
  },
  {
    id: 'bankinter-v3',
    label: 'Bankinter v3',
    src: 'assets/card-backgrounds/bankinter_card_background_v3.png',
    textColor: '#1f2937',
    accentColor: '#f97316',
  },
  {
    id: 'cgd',
    label: 'CGD',
    src: 'assets/card-backgrounds/cgd_final_v2.png',
    textColor: '#1f2937',
    accentColor: '#2563eb',
  },
  {
    id: 'cgd-azulejo',
    label: 'CGD Azulejo',
    src: 'assets/card-backgrounds/cgd_concept_azulejo.png',
    textColor: '#d4af37',
    accentColor: '#2563eb',
  },
  {
    id: 'edenred',
    label: 'Edenred',
    src: 'assets/card-backgrounds/edenred_concept_spheres.png',
    textColor: '#ffffff',
    accentColor: '#dc2626',
  },
  {
    id: 'montepio-waves',
    label: 'Montepio Waves',
    src: 'assets/card-backgrounds/montepio_concept_golden_waves.png',
    textColor: '#f3e0a8',
    accentColor: '#d4af37',
  },
  {
    id: 'montepio-ribbons',
    label: 'Montepio Ribbons',
    src: 'assets/card-backgrounds/montepio_concept_interlocking_ribbons.png',
    textColor: '#d4af37',
    accentColor: '#d4af37',
  },
];
