import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { EnvironmentOutlined, SwapOutlined, SearchOutlined, InfoCircleOutlined, CarOutlined, RadiusSettingOutlined, TableOutlined } from '@ant-design/icons';

interface GoogleMapActionInfoProps {
  action: string;
  travelMode?: string;
  radius?: number;
}

const GoogleMapActionInfo: React.FC<GoogleMapActionInfoProps> = ({ action, travelMode, radius }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'geocode': return <EnvironmentOutlined />;
      case 'reverse_geocode': return <SwapOutlined />;
      case 'directions': return <CarOutlined />;
      case 'places_search': return <SearchOutlined />;
      case 'place_details': return <InfoCircleOutlined />;
      case 'distance_matrix': return <TableOutlined />;
      default: return <EnvironmentOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'geocode': return 'blue';
      case 'reverse_geocode': return 'cyan';
      case 'directions': return 'green';
      case 'places_search': return 'orange';
      case 'place_details': return 'purple';
      case 'distance_matrix': return 'magenta';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'geocode': return 'Geocode';
      case 'reverse_geocode': return 'Reverse Geocode';
      case 'directions': return 'Directions';
      case 'places_search': return 'Places Search';
      case 'place_details': return 'Place Details';
      case 'distance_matrix': return 'Distance Matrix';
      default: return act;
    }
  };

  const getTravelModeIcon = (mode?: string) => {
    switch (mode) {
      case 'driving': return '🚗';
      case 'walking': return '🚶';
      case 'bicycling': return '🚴';
      case 'transit': return '🚌';
      default: return '🚗';
    }
  };

  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          Action:
        </Typography.Text>
        <Tag color={getActionColor(action)} style={{ fontSize: '11px' }}>
          {getActionIcon(action)}
          <span style={{ marginLeft: 4 }}>{getActionLabel(action)}</span>
        </Tag>
      </Flex>
      
      {(action === 'directions' || action === 'distance_matrix') && travelMode && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Mode: {getTravelModeIcon(travelMode)} {travelMode}
        </Typography.Text>
      )}
      
      {action === 'places_search' && radius && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          <RadiusSettingOutlined style={{ marginRight: 2 }} />
          Radius: {radius}m
        </Typography.Text>
      )}
    </Flex>
  );
};

export default GoogleMapActionInfo;
