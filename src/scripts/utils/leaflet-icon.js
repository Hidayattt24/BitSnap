import L from 'leaflet';

// Fixing the default icon issue
delete L.Icon.Default.prototype._getIconUrl;

const defaultIconConfig = {
  iconUrl: '/leaflet/marker-icon.svg',
  iconRetinaUrl: '/leaflet/marker-icon@2x.svg',
  shadowUrl: '/leaflet/marker-shadow.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  shadowAnchor: [20, 41]
};

L.Icon.Default.mergeOptions(defaultIconConfig);

export const createDefaultIcon = () => new L.Icon(defaultIconConfig);

export const createCustomIcon = (options = {}) => new L.Icon({
  ...defaultIconConfig,
  ...options
}); 