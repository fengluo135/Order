const AMapAPI_KEY = 'af70d74c3327876935b62d6862aa4137';
const AMapService = {
  /**
   * 地理编码 - 将地址转换为经纬度
   * @param {string} address - 地址
   * @returns {Promise<{lng: number, lat: number}>}
   */
  async geocode(address) {
    try {
      const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${AMapAPI_KEY}`;
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
      throw new Error(data.info || '地理编码失败');
    } catch (error) {
      console.error('地理编码错误:', error);
      return null;
    }
  },

  /**
   * 驾车路线规划
   * @param {string} origin - 起点经纬度 "lng,lat"
   * @param {string} destination - 终点经纬度 "lng,lat"
   * @returns {Promise<object>}
   */
  async drivingRoute(origin, destination) {
    try {
      const url = `https://restapi.amap.com/v3/direction/driving?origin=${origin}&destination=${destination}&key=${AMapAPI_KEY}`;
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
      throw new Error(data.info || '路线规划失败');
    } catch (error) {
      console.error('驾车路线规划错误:', error);
      return null;
    }
  },

  /**
   * 公交路线规划
   * @param {string} origin - 起点经纬度 "lng,lat"
   * @param {string} destination - 终点经纬度 "lng,lat"
   * @returns {Promise<object>}
   */
  async transitRoute(origin, destination) {
    try {
      const url = `https://restapi.amap.com/v3/direction/transit/integrated?origin=${origin}&destination=${destination}&key=${AMapAPI_KEY}&strategy=0`;
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
      throw new Error(data.info || '公交路线规划失败');
    } catch (error) {
      console.error('公交路线规划错误:', error);
      return null;
    }
  },

  /**
   * 机场距离查询
   * @param {string} origin - 起点经纬度 "lng,lat"
   * @param {string} destination - 终点经纬度 "lng,lat"
   * @returns {Promise<object>}
   */
  async distance(origin, destination) {
    try {
      const url = `https://restapi.amap.com/v3/distance?key=${AMapAPI_KEY}&origins=${origin}&destination=${destination}&type=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.results) {
        return {
          distance: data.results[0].distance,
          duration: data.results[0].duration,
        };
      }
      throw new Error(data.info || '距离查询失败');
    } catch (error) {
      console.error('距离查询错误:', error);
      return null;
    }
  },

  /**
   * 搜索地点周边兴趣点
   * @param {number} lat - 纬度
   * @param {number} lng - 经度
   * @param {string} type - 兴趣点类型 (如: 景点、餐饮、酒店)
   * @param {number} radius - 搜索半径（米）
   * @returns {Promise<Array>}
   */
  async searchNearby(lat, lng, type, radius = 5000) {
    try {
      const url = `https://restapi.amap.com/v3/place/around?key=${AMapAPI_KEY}&location=${lng},${lat}&types=${type}&radius=${radius}`;
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
      throw new Error(data.info || '周边搜索失败');
    } catch (error) {
      console.error('周边搜索错误:', error);
      return [];
    }
  },

  /**
   * 天气查询
   * @param {string} city - 城市名称
   * @returns {Promise<object>}
   */
  async weather(city) {
    try {
      const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMapAPI_KEY}&city=${encodeURIComponent(city)}&extensions=base`;
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
      throw new Error(data.info || '天气查询失败');
    } catch (error) {
      console.error('天气查询错误:', error);
      return null;
    }
  },

  /**
   * 生成地图URL
   * @param {string} departure - 出发地
   * @param {string} destination - 目的地
   * @returns {string}
   */
  getMapUrl(departure, destination) {
    return `https://restapi.amap.com/experimental/direction/drive?origin=${departure}&destination=${destination}&key=${AMapAPI_KEY}`;
  },

  /**
   * 生成静态地图URL
   * @param {Array} markers - 标记点 [{lng, lat, name}]
   * @param {number} zoom - 缩放级别
   * @returns {string}
   */
  getStaticMapUrl(markers, zoom = 10) {
    const markersStr = markers.map(m => `${m.lng},${m.lat},${encodeURIComponent(m.name || '')}`).join('|');
    return `https://restapi.amap.com/v3/staticmap?location=${markers[0].lng},${markers[0].lat}&zoom=${zoom}&size=512*512&markers=${markersStr}&key=${AMapAPI_KEY}`;
  },
};

export default AMapService;