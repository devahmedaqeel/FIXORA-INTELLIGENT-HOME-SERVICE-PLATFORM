/* Initial service categories. `icon` maps to an icon key in client/src/constants/categoryIcons.js. */
export const CATEGORIES = [
  { name: 'Plumbing', icon: 'droplet', description: 'Leaks, taps, pipes, geysers, water tanks and bathroom fittings.' },
  { name: 'Electrical', icon: 'zap', description: 'Wiring, switches, DB boxes, UPS/inverter installation and fault finding.' },
  { name: 'Cleaning', icon: 'sparkles', description: 'Home deep cleaning, sofa and carpet shampooing, kitchen and bathroom cleaning.' },
  { name: 'Barber', icon: 'scissors', description: 'Haircuts, shaves and grooming at home.' },
  { name: 'Appliance Repair', icon: 'washer', description: 'Washing machines, fridges, microwaves, ovens and other home appliances.' },
  { name: 'AC Repair', icon: 'snowflake', description: 'AC installation, gas refilling, servicing and inverter AC repair.' },
  { name: 'Carpentry', icon: 'hammer', description: 'Furniture repair, door and lock fitting, cabinets and woodwork.' },
  { name: 'Painting', icon: 'paintbrush', description: 'Interior and exterior painting, distemper, polish and wall finishes.' },
  { name: 'Tutoring', icon: 'book', description: 'Home tutors for school, O/A Levels, Quran and test preparation.' },
  { name: 'Pest Control', icon: 'bug', description: 'Termite, cockroach, bed bug, mosquito and rodent treatments.' },
  { name: 'Home Maintenance', icon: 'home', description: 'General handyman jobs, fixtures, minor masonry and seasonal upkeep.' },
  { name: 'Computer/Laptop Repair', icon: 'laptop', description: 'Laptop and PC repair, upgrades, Windows installation and virus removal.' },
].map((category, index) => ({ ...category, sortOrder: index + 1, active: true }));
