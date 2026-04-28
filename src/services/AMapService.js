const AMapAPI_KEY = 'af70d74c3327876935b62d6862aa4137';
const AMapService = {
  /**
   * 获取API基础URL
   */
  getBaseUrl() {
    return '/amap-api';
  },

  /**
   * 地理编码 - 将地址转换为经纬度
   */
  async geocode(address) {
    try {
      const url = `${this.getBaseUrl()}/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${AMapAPI_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
        const location = data.geocodes[0].location.split(',');
        return {
          lng: parseFloat(location[0]),
          lat: parseFloat(location[1]),
          province: data.geocodes[0].province,
          city: data.geocodes[0].city,
          district: data.geocodes[0].district,
        };
      }
      console.warn('地理编码失败:', data.info);
      return null;
    } catch (error) {
      console.error('地理编码错误:', error);
      return null;
    }
  },

  /**
   * 驾车路线规划
   */
  async drivingRoute(origin, destination) {
    try {
      const url = `${this.getBaseUrl()}/v3/direction/driving?origin=${origin}&destination=${destination}&key=${AMapAPI_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.route && data.route.paths) {
        const path = data.route.paths[0];
        return {
          distance: path.distance,
          duration: path.time,
          strategy: data.route.strategy,
          steps: path.steps.map(step => ({
            instruction: step.instruction,
            road: step.road,
            distance: step.distance,
            duration: step.time,
          })),
        };
      }
      console.warn('驾车路线规划失败:', data.info);
      return null;
    } catch (error) {
      console.error('驾车路线规划错误:', error);
      return null;
    }
  },

  /**
   * 公交路线规划
   */
  async transitRoute(origin, destination) {
    try {
      const url = `${this.getBaseUrl()}/v3/direction/transit/integrated?origin=${origin}&destination=${destination}&key=${AMapAPI_KEY}&strategy=0`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.route) {
        const transit = data.route.transits[0];
        return {
          distance: transit.distance,
          duration: transit.duration,
          segments: transit.segments.map(seg => ({
            instruction: seg.instruction,
            bus: seg.bus ? seg.bus.buslines[0].name : null,
            walking: seg.walking.distance,
          })),
        };
      }
      console.warn('公交路线规划失败:', data.info);
      return null;
    } catch (error) {
      console.error('公交路线规划错误:', error);
      return null;
    }
  },

  /**
   * 天气查询
   */
  async weather(city) {
    try {
      const url = `${this.getBaseUrl()}/v3/weather/weatherInfo?key=${AMapAPI_KEY}&city=${encodeURIComponent(city)}&extensions=base`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.lives && data.lives.length > 0) {
        const weather = data.lives[0];
        return {
          weather: weather.weather,
          temperature: weather.temperature,
          wind: weather.wind + ' ' + weather.windpower,
          humidity: weather.humidity,
          reportTime: weather.reporttime,
        };
      }
      console.warn('天气查询失败:', data.info);
      return null;
    } catch (error) {
      console.error('天气查询错误:', error);
      return null;
    }
  },

  /**
   * 搜索地点周边兴趣点
   */
  async searchNearby(lat, lng, type, radius = 5000) {
    try {
      const url = `${this.getBaseUrl()}/v3/place/around?key=${AMapAPI_KEY}&location=${lng},${lat}&types=${type}&radius=${radius}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.pois) {
        return data.pois.map(poi => ({
          name: poi.name,
          address: poi.address,
          location: poi.location,
          type: poi.type,
          distance: poi.distance,
        }));
      }
      console.warn('周边搜索失败:', data.info);
      return [];
    } catch (error) {
      console.error('周边搜索错误:', error);
      return [];
    }
  },
};

export default AMapService;