export type Location = {
  name: string
  slug: string
}

export const LOCATIONS: Location[] = [
  { name: 'Amballor Kavu', slug: 'amballor-kavu' },
  { name: 'Arayankavu', slug: 'arayankavu' },
  { name: 'Erattamavu', slug: 'erattamavu' },
  { name: 'Kadapuram', slug: 'kadapuram' },
  { name: 'Keechery', slug: 'keechery' },
  { name: 'Mampuzha', slug: 'mampuzha' },
  { name: 'Maxwell', slug: 'maxwell' },
  { name: 'Millunkal', slug: 'millunkal' },
  { name: 'Parpacode', slug: 'parpacode' },
  { name: 'Punchapadam', slug: 'punchapadam' },
  { name: 'Puthuvassery', slug: 'puthuvassery' },
  { name: 'Vidangara Temple', slug: 'vidangara-temple' },
]

export function getLocationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug)
}
