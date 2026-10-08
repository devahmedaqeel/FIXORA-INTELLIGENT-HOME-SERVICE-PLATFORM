/*
 * Initial Pakistan service areas.
 * Postal codes follow Pakistan Post's 5-digit scheme. Many cities share a single code across
 * neighbourhoods (e.g. most Islamabad sectors use 44000). Admins can correct or extend any
 * entry from Admin → Areas; verify against Pakistan Post before relying on them in production.
 */

const AJK = 'Azad Jammu and Kashmir';
const PB = 'Punjab';
const SD = 'Sindh';
const KP = 'Khyber Pakhtunkhwa';
const BL = 'Balochistan';
const ICT = 'Islamabad Capital Territory';
const GB = 'Gilgit-Baltistan';

const a = (areaName, city, district, province, postalCode) => ({ areaName, city, district, province, postalCode });

export const AREAS = [
  // Azad Jammu & Kashmir
  a('New Mirpur City', 'Mirpur', 'Mirpur', AJK, '10250'),
  a('Sector F-1', 'Mirpur', 'Mirpur', AJK, '10250'),
  a('Sector F-2', 'Mirpur', 'Mirpur', AJK, '10250'),
  a('Sector F-3', 'Mirpur', 'Mirpur', AJK, '10250'),
  a('Sector D-4', 'Mirpur', 'Mirpur', AJK, '10250'),
  a('Allama Iqbal Road', 'Mirpur', 'Mirpur', AJK, '10250'),
  a('Mian Muhammad', 'Mirpur', 'Mirpur', AJK, '10250'),
  a('Muzaffarabad City', 'Muzaffarabad', 'Muzaffarabad', AJK, '13100'),
  a('Kotli City', 'Kotli', 'Kotli', AJK, '11100'),
  a('Bhimber City', 'Bhimber', 'Bhimber', AJK, '10040'),

  // Islamabad
  a('F-6', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('F-7', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('F-8', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('F-10', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('G-9', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('G-11', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('I-8', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('E-11', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('Bahria Town Islamabad', 'Islamabad', 'Islamabad', ICT, '44000'),
  a('DHA Islamabad', 'Islamabad', 'Islamabad', ICT, '44000'),

  // Punjab
  a('Saddar', 'Rawalpindi', 'Rawalpindi', PB, '46000'),
  a('Satellite Town', 'Rawalpindi', 'Rawalpindi', PB, '46300'),
  a('Westridge', 'Rawalpindi', 'Rawalpindi', PB, '46000'),
  a('Gulberg III', 'Lahore', 'Lahore', PB, '54660'),
  a('Model Town', 'Lahore', 'Lahore', PB, '54700'),
  a('Johar Town', 'Lahore', 'Lahore', PB, '54782'),
  a('DHA Phase 5', 'Lahore', 'Lahore', PB, '54792'),
  a('Iqbal Town', 'Lahore', 'Lahore', PB, '54570'),
  a('Garden Town', 'Lahore', 'Lahore', PB, '54600'),
  a('Faisalabad City', 'Faisalabad', 'Faisalabad', PB, '38000'),
  a('Peoples Colony', 'Faisalabad', 'Faisalabad', PB, '38000'),
  a('Multan Cantt', 'Multan', 'Multan', PB, '60000'),
  a('Gulgasht Colony', 'Multan', 'Multan', PB, '60000'),
  a('Sialkot City', 'Sialkot', 'Sialkot', PB, '51310'),
  a('Gujranwala City', 'Gujranwala', 'Gujranwala', PB, '52250'),
  a('Bahawalpur City', 'Bahawalpur', 'Bahawalpur', PB, '63100'),
  a('Sargodha City', 'Sargodha', 'Sargodha', PB, '40100'),
  a('Jhelum City', 'Jhelum', 'Jhelum', PB, '49600'),
  a('Gujrat City', 'Gujrat', 'Gujrat', PB, '50700'),

  // Sindh
  a('Clifton', 'Karachi', 'Karachi South', SD, '75600'),
  a('DHA Karachi', 'Karachi', 'Karachi South', SD, '75500'),
  a('Saddar', 'Karachi', 'Karachi South', SD, '74400'),
  a('PECHS', 'Karachi', 'Karachi East', SD, '75400'),
  a('Gulshan-e-Iqbal', 'Karachi', 'Karachi East', SD, '75300'),
  a('North Nazimabad', 'Karachi', 'Karachi Central', SD, '74700'),
  a('Korangi', 'Karachi', 'Korangi', SD, '74900'),
  a('Hyderabad City', 'Hyderabad', 'Hyderabad', SD, '71000'),
  a('Sukkur City', 'Sukkur', 'Sukkur', SD, '65200'),
  a('Larkana City', 'Larkana', 'Larkana', SD, '77150'),

  // Khyber Pakhtunkhwa
  a('Peshawar Saddar', 'Peshawar', 'Peshawar', KP, '25000'),
  a('Hayatabad', 'Peshawar', 'Peshawar', KP, '25100'),
  a('University Town', 'Peshawar', 'Peshawar', KP, '25000'),
  a('Abbottabad City', 'Abbottabad', 'Abbottabad', KP, '22010'),
  a('Mardan City', 'Mardan', 'Mardan', KP, '23200'),
  a('Swat (Mingora)', 'Mingora', 'Swat', KP, '19200'),

  // Balochistan
  a('Quetta Cantt', 'Quetta', 'Quetta', BL, '87300'),
  a('Satellite Town', 'Quetta', 'Quetta', BL, '87300'),
  a('Gwadar City', 'Gwadar', 'Gwadar', BL, '91200'),
  a('Turbat City', 'Turbat', 'Kech', BL, '92600'),

  // Gilgit-Baltistan
  a('Gilgit City', 'Gilgit', 'Gilgit', GB, '15100'),
  a('Skardu City', 'Skardu', 'Skardu', GB, '16100'),
];
