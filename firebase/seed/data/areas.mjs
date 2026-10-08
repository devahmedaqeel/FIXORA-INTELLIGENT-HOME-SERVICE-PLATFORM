/*
 * UK service areas/postcodes.
 * Real outward-code prefixes per city (not invented), so postcode search and
 * city/area filters reflect genuine UK geography. Field names are unchanged from the
 * original schema (areaName/city/district/province/postalCode) to minimise code churn —
 * `province` holds the UK constituent country, `district` holds the county/region.
 */

const ENGLAND = 'England';
const SCOTLAND = 'Scotland';
const WALES = 'Wales';
const NI = 'Northern Ireland';

const a = (areaName, city, district, province, postalCode) => ({ areaName, city, district, province, postalCode });

export const AREAS = [
  // London (Greater London, England)
  a('Westminster', 'London', 'Greater London', ENGLAND, 'SW1A 1AA'),
  a('Camden', 'London', 'Greater London', ENGLAND, 'NW1 6XE'),
  a('Islington', 'London', 'Greater London', ENGLAND, 'N1 1AA'),
  a('Shoreditch', 'London', 'Greater London', ENGLAND, 'E1 6AN'),
  a('Kensington', 'London', 'Greater London', ENGLAND, 'W8 7RG'),
  a('Canary Wharf', 'London', 'Greater London', ENGLAND, 'E14 5AB'),

  // Birmingham (West Midlands, England)
  a('City Centre', 'Birmingham', 'West Midlands', ENGLAND, 'B1 1AA'),
  a('Edgbaston', 'Birmingham', 'West Midlands', ENGLAND, 'B15 2TT'),
  a('Digbeth', 'Birmingham', 'West Midlands', ENGLAND, 'B5 6DY'),

  // Manchester (Greater Manchester, England)
  a('City Centre', 'Manchester', 'Greater Manchester', ENGLAND, 'M1 1AE'),
  a('Northern Quarter', 'Manchester', 'Greater Manchester', ENGLAND, 'M4 1AG'),
  a('Didsbury', 'Manchester', 'Greater Manchester', ENGLAND, 'M20 2YR'),

  // Liverpool (Merseyside, England)
  a('City Centre', 'Liverpool', 'Merseyside', ENGLAND, 'L1 1JD'),
  a('Aigburth', 'Liverpool', 'Merseyside', ENGLAND, 'L17 7BP'),

  // Leeds (West Yorkshire, England)
  a('City Centre', 'Leeds', 'West Yorkshire', ENGLAND, 'LS1 1UR'),
  a('Headingley', 'Leeds', 'West Yorkshire', ENGLAND, 'LS6 3BJ'),

  // Sheffield (South Yorkshire, England)
  a('City Centre', 'Sheffield', 'South Yorkshire', ENGLAND, 'S1 2HH'),
  a('Ecclesall', 'Sheffield', 'South Yorkshire', ENGLAND, 'S11 8PT'),

  // Bristol (England)
  a('City Centre', 'Bristol', 'Bristol', ENGLAND, 'BS1 4DJ'),
  a('Clifton', 'Bristol', 'Bristol', ENGLAND, 'BS8 4HR'),

  // Newcastle upon Tyne (Tyne and Wear, England)
  a('City Centre', 'Newcastle upon Tyne', 'Tyne and Wear', ENGLAND, 'NE1 4ST'),
  a('Jesmond', 'Newcastle upon Tyne', 'Tyne and Wear', ENGLAND, 'NE2 1AB'),

  // Other English cities/towns (one area each)
  a('City Centre', 'Nottingham', 'Nottinghamshire', ENGLAND, 'NG1 5FS'),
  a('City Centre', 'Leicester', 'Leicestershire', ENGLAND, 'LE1 6RE'),
  a('City Centre', 'Southampton', 'Hampshire', ENGLAND, 'SO14 0AA'),
  a('Brighton', 'Brighton and Hove', 'East Sussex', ENGLAND, 'BN1 1AA'),
  a('City Centre', 'Oxford', 'Oxfordshire', ENGLAND, 'OX1 2JD'),
  a('City Centre', 'Cambridge', 'Cambridgeshire', ENGLAND, 'CB1 2AS'),
  a('City Centre', 'York', 'North Yorkshire', ENGLAND, 'YO1 7HH'),

  // Edinburgh (City of Edinburgh, Scotland)
  a('Old Town', 'Edinburgh', 'City of Edinburgh', SCOTLAND, 'EH1 1YZ'),
  a('Leith', 'Edinburgh', 'City of Edinburgh', SCOTLAND, 'EH6 7EA'),

  // Glasgow (Glasgow City, Scotland)
  a('City Centre', 'Glasgow', 'Glasgow City', SCOTLAND, 'G1 1AA'),
  a('West End', 'Glasgow', 'Glasgow City', SCOTLAND, 'G12 8QQ'),

  // Other Scottish cities (one area each)
  a('City Centre', 'Aberdeen', 'Aberdeenshire', SCOTLAND, 'AB10 1AQ'),
  a('City Centre', 'Dundee', 'Dundee City', SCOTLAND, 'DD1 3BH'),

  // Cardiff (South Glamorgan, Wales)
  a('City Centre', 'Cardiff', 'South Glamorgan', WALES, 'CF10 1EP'),
  a('Canton', 'Cardiff', 'South Glamorgan', WALES, 'CF5 1JA'),

  // Other Welsh towns (one area each)
  a('City Centre', 'Swansea', 'West Glamorgan', WALES, 'SA1 1DB'),
  a('City Centre', 'Newport', 'Gwent', WALES, 'NP20 1GA'),

  // Belfast (County Antrim, Northern Ireland)
  a('City Centre', 'Belfast', 'County Antrim', NI, 'BT1 1AA'),
  a('Stranmillis', 'Belfast', 'County Antrim', NI, 'BT9 5AB'),

  // Other Northern Ireland towns (one area each)
  a('City Centre', 'Derry', 'County Londonderry', NI, 'BT48 6AB'),
  a('City Centre', 'Lisburn', 'County Antrim', NI, 'BT28 1AB'),
];
