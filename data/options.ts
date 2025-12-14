export type Choice = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export const choices: Choice[] = [
  {
    id: 'espresso-aficionado',
    name: 'Single Origin Espresso',
    description: 'Bright, fruit-forward espresso pulled on a modern lever machine.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pour-over',
    name: 'Pour-over Ritual',
    description: 'V60 with a balanced medium roast for a clean, sweet cup.',
    image: 'https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sunrise-trail',
    name: 'Sunrise Trail Run',
    description: 'Light jog through a pine forest with a playlist you love.',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'strength-studio',
    name: 'Strength Studio Session',
    description: 'Guided lifts with tight form and a focus playlist.',
    image: 'https://images.unsplash.com/photo-1584467735871-1cabb5a842ef?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'city-nights',
    name: 'City Night Walk',
    description: 'Slow walk through a neon-lit neighborhood with good snacks.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'art-dive',
    name: 'Art Gallery Dive',
    description: 'Intentional gallery hopping with time to sketch and journal.',
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'chef-table',
    name: 'Chef’s Table Night',
    description: 'Book a tasting menu and savor each course slowly.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'street-bites',
    name: 'Street Food Crawl',
    description: 'Wander a market and sample signature bites at every stall.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'home-cinema',
    name: 'Home Cinema',
    description: 'Projector, blankets, and a curated double-feature.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'live-session',
    name: 'Live Session',
    description: 'Small venue show with an up-and-coming artist.',
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'deep-work',
    name: 'Deep Work Sprint',
    description: '90 minutes of focused work with a clean desk and timer.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'studio-play',
    name: 'Studio Play Session',
    description: 'Open-ended creative time with paints, synths, or clay.',
    image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=800&q=80',
  },
];
