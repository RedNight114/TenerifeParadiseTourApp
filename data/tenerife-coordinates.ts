// Coordenadas reales de ubicaciones en Tenerife
export const TENERIFE_LOCATIONS = {
  // Ciudades principales
  SANTA_CRUZ: { lat: 28.4636, lng: -16.2518, name: "Santa Cruz de Tenerife" },
  LA_LAGUNA: { lat: 28.4881, lng: -16.3156, name: "San Cristóbal de La Laguna" },
  PUERTO_CRUZ: { lat: 28.4178, lng: -16.5494, name: "Puerto de la Cruz" },
  LOS_REALEJOS: { lat: 28.3833, lng: -16.5833, name: "Los Realejos" },
  LA_OROTAVA: { lat: 28.3833, lng: -16.5167, name: "La Orotava" },
  ADEJE: { lat: 28.1167, lng: -16.7167, name: "Adeje" },
  ARONA: { lat: 28.1000, lng: -16.6667, name: "Arona" },
  COSTA_ADEJE: { lat: 28.1000, lng: -16.7167, name: "Costa Adeje" },
  
  // Playas famosas
  PLAYA_LAS_TERESITAS: { lat: 28.5167, lng: -16.1833, name: "Playa de Las Teresitas" },
  PLAYA_JARDIN: { lat: 28.4167, lng: -16.5500, name: "Playa Jardín" },
  PLAYA_DEL_DUQUE: { lat: 28.0833, lng: -16.7167, name: "Playa del Duque" },
  PLAYA_FANABE: { lat: 28.0833, lng: -16.7000, name: "Playa de Fañabé" },
  
  // Atracciones turísticas
  TEIDE: { lat: 28.2724, lng: -16.6424, name: "Parque Nacional del Teide" },
  LORO_PARQUE: { lat: 28.4167, lng: -16.5500, name: "Loro Parque" },
  SIAM_PARK: { lat: 28.0833, lng: -16.7167, name: "Siam Park" },
  AQUAPARK: { lat: 28.0833, lng: -16.7000, name: "Aqua Park" },
  
  // Miradores
  MIRADOR_CRUZ_DEL_CARMEN: { lat: 28.5167, lng: -16.3167, name: "Mirador Cruz del Carmen" },
  MIRADOR_LOS_GIGANTES: { lat: 28.2333, lng: -16.8333, name: "Mirador Los Gigantes" },
  MIRADOR_EL_BOCINEYRO: { lat: 28.3500, lng: -16.5167, name: "Mirador El Bocineyro" },
  
  // Puertos deportivos
  PUERTO_DEPORTIVO_SANTA_CRUZ: { lat: 28.4667, lng: -16.2500, name: "Puerto Deportivo Santa Cruz" },
  PUERTO_DEPORTIVO_LOS_GIGANTES: { lat: 28.2333, lng: -16.8333, name: "Puerto Deportivo Los Gigantes" },
  PUERTO_DEPORTIVO_COLON: { lat: 28.0833, lng: -16.7167, name: "Puerto Deportivo Colón" }
}

// Coordenadas de hoteles de ejemplo
export const SAMPLE_HOTELS = [
  {
    id: "hotel-1",
    nombre: "Hotel Botánico & The Oriental Spa Garden",
    direccion: "Avenida Richard J. Yeoward, 1, Puerto de la Cruz",
    lat: 28.4167,
    lng: -16.5500,
    estrellas: 5,
    telefono: "+34 922 381 400",
    descripcion: "Hotel de lujo con spa y jardines tropicales"
  },
  {
    id: "hotel-2", 
    nombre: "Hotel Ritz Carlton Abama",
    direccion: "Carretera General, TF-47, km 9, Guía de Isora",
    lat: 28.1167,
    lng: -16.7167,
    estrellas: 5,
    telefono: "+34 922 126 000",
    descripcion: "Resort de lujo con campo de golf"
  },
  {
    id: "hotel-3",
    nombre: "Hotel Bahía del Duque",
    direccion: "Avenida Bruselas, 14, Costa Adeje",
    lat: 28.0833,
    lng: -16.7167,
    estrellas: 5,
    telefono: "+34 922 747 400",
    descripcion: "Hotel frente al mar con spa de lujo"
  },
  {
    id: "hotel-4",
    nombre: "Hotel Mencey",
    direccion: "Calle Doctor José Naveiras, 38, Santa Cruz de Tenerife",
    lat: 28.4636,
    lng: -16.2518,
    estrellas: 4,
    telefono: "+34 922 609 900",
    descripcion: "Hotel urbano en el centro de Santa Cruz"
  }
]

// Coordenadas de servicios de ejemplo
export const SAMPLE_SERVICES = [
  {
    id: "service-1",
    title: "Excursión al Teide",
    description: "Visita al Parque Nacional del Teide con teleférico",
    price: 45,
    lat: 28.2724,
    lng: -16.6424,
    category_id: "excursion",
    duration: "8 horas",
    max_participants: 20
  },
  {
    id: "service-2",
    title: "Avistamiento de Cetáceos",
    description: "Excursión en barco para ver ballenas y delfines",
    price: 35,
    lat: 28.2333,
    lng: -16.8333,
    category_id: "aventura",
    duration: "3 horas",
    max_participants: 12
  },
  {
    id: "service-3",
    title: "Tour Gastronómico",
    description: "Degustación de productos locales y vinos",
    price: 60,
    lat: 28.3833,
    lng: -16.5167,
    category_id: "gastronomia",
    duration: "4 horas",
    max_participants: 15
  },
  {
    id: "service-4",
    title: "Spa Relajante",
    description: "Tratamientos de spa y relajación",
    price: 80,
    lat: 28.0833,
    lng: -16.7167,
    category_id: "relax",
    duration: "2 horas",
    max_participants: 1
  },
  {
    id: "service-5",
    title: "Senderismo Anaga",
    description: "Ruta de senderismo por el Parque Rural de Anaga",
    price: 25,
    lat: 28.5167,
    lng: -16.3167,
    category_id: "aventura",
    duration: "6 horas",
    max_participants: 8
  }
]
