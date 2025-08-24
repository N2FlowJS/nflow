import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface GoogleMapForm extends BaseForm {
  name: string;
  description?: string;
  action: 'geocode' | 'reverse_geocode' | 'directions' | 'places_search' | 'place_details' | 'distance_matrix';
  apiKey: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  origin?: string;
  destination?: string;
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  query?: string;
  placeId?: string;
  radius?: number;
  type?: string;
}

export type GoogleMapNodeData = BaseNodeData<GoogleMapForm> & { type: 'googlemap' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    GoogleMapNodeData: GoogleMapNodeData;
  }
}
