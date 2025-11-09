/**
 * Google Maps Executor - Refactored using BaseNodeExecutor
 * Integrates with Google Maps API for geocoding, directions, places search, etc.
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { GoogleMapForm } from './types';

/**
 * Google Maps Executor
 */
export class GoogleMapExecutor extends BaseNodeExecutor<GoogleMapForm> {
  constructor() {
    super({
      nodeType: 'googlemap',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['address', 'origin', 'destination', 'query'],
    });
  }

  /**
   * Execute Google Maps API logic
   */
  protected async executeLogic(form: GoogleMapForm, context: ExecutionContext): Promise<string> {
    if (!form.apiKey) {
      throw new Error('Google Maps API key is required');
    }

    let result: any;

    switch (form.action) {
      case 'geocode':
        if (!form.address) {
          throw new Error('Address is required for geocoding');
        }
        const processedAddress = this.processTemplate(form.address, context);
        result = await this.geocodeAddress(form.apiKey, processedAddress);
        break;

      case 'reverse_geocode':
        if (!form.latitude || !form.longitude) {
          throw new Error('Latitude and longitude are required for reverse geocoding');
        }
        result = await this.reverseGeocode(form.apiKey, parseFloat(form.latitude), parseFloat(form.longitude));
        break;

      case 'directions':
        if (!form.origin || !form.destination) {
          throw new Error('Origin and destination are required for directions');
        }
        const processedOrigin = this.processTemplate(form.origin, context);
        const processedDestination = this.processTemplate(form.destination, context);
        result = await this.getDirections(form.apiKey, processedOrigin, processedDestination, form.travelMode || 'driving');
        break;

      case 'places_search':
        if (!form.query) {
          throw new Error('Search query is required for places search');
        }
        const processedQuery = this.processTemplate(form.query, context);
        result = await this.searchPlaces(form.apiKey, processedQuery, {
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
          radius: form.radius,
          type: form.type
        });
        break;

      case 'place_details':
        if (!form.placeId) {
          throw new Error('Place ID is required for place details');
        }
        result = await this.getPlaceDetails(form.apiKey, form.placeId);
        break;

      case 'distance_matrix':
        if (!form.origin || !form.destination) {
          throw new Error('Origins and destinations are required for distance matrix');
        }
        const origins = this.processTemplate(form.origin, context);
        const destinations = this.processTemplate(form.destination, context);
        result = await this.getDistanceMatrix(form.apiKey, origins, destinations, form.travelMode || 'driving');
        break;

      default:
        throw new Error(`Unsupported Google Maps action: ${form.action}`);
    }

    return JSON.stringify(result, null, 2);
  }

  /**
   * Geocode an address to coordinates
   */
  private async geocodeAddress(apiKey: string, address: string): Promise<any> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    return response.json();
  }

  /**
   * Reverse geocode coordinates to address
   */
  private async reverseGeocode(apiKey: string, lat: number, lng: number): Promise<any> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    return response.json();
  }

  /**
   * Get directions between locations
   */
  private async getDirections(apiKey: string, origin: string, destination: string, mode: string): Promise<any> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`
    );
    return response.json();
  }

  /**
   * Search for places
   */
  private async searchPlaces(apiKey: string, query: string, options: any): Promise<any> {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    if (options.latitude && options.longitude) {
      url += `&location=${options.latitude},${options.longitude}`;
    }
    if (options.radius) {
      url += `&radius=${options.radius}`;
    }
    if (options.type) {
      url += `&type=${options.type}`;
    }

    const response = await fetch(url);
    return response.json();
  }

  /**
   * Get place details
   */
  private async getPlaceDetails(apiKey: string, placeId: string): Promise<any> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
    );
    return response.json();
  }

  /**
   * Get distance matrix
   */
  private async getDistanceMatrix(apiKey: string, origins: string, destinations: string, mode: string): Promise<any> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&key=${apiKey}`
    );
    return response.json();
  }
}

// Export singleton instance
export const googleMapExecutor = new GoogleMapExecutor();