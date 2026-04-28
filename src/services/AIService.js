import AMapService from './AMapService';

const AIService = {
  /**
   * 生成完整的旅游攻略
   * @param {object} travelData - 旅游数据
   * @returns {Promise<object>}
   */
  async generateItinerary(travelData) {
    const { departure, destination, travelMode, departureDate, peopleCount, tripDays, tripTheme, budget, specialNeeds, interests } = travelData;

    let departureGeo = null;
    let destinationGeo = null;
    let routeInfo = null;
    let weather = null;
    let attractions = [];
    let restaurants = [];
    let hotels = [];

    // 尝试获取地理编码
    try {
      const geoResults = await Promise.all([
        AMapService.geocode(departure),
        AMapService.geocode(destination),
      ]).catch(() => [null, null]);

      departureGeo = geoResults[0];
      destinationGeo = geoResults[1];
    } catch (e) {
      console.warn('地理编码失败，使用模拟数据:', e);
    }

    // 如果地理编码成功，获取路线信息
    if (departureGeo && destinationGeo) {
      try {
        const origin = `${departureGeo.lng},${departureGeo.lat}`;
        const dest = `${destinationGeo.lng},${destinationGeo.lat}`;

        if (travelMode === 'driving') {
          routeInfo = await AMapService.drivingRoute(origin, dest).catch(() => null);
        } else if (travelMode === 'public') {
          routeInfo = await AMapService.transitRoute(origin, dest).catch(() => null);
        }
      } catch (e) {
        console.warn('路线规划失败:', e);
      }

      // 尝试获取天气
      try {
        weather = await AMapService.weather(destinationGeo.city || destination).catch(() => null);
      } catch (e) {
        console.warn('天气查询失败:', e);
      }

      // 尝试搜索周边
      try {
        const poiType = this.getPoiType(tripTheme);
        attractions = await AMapService.searchNearby(destinationGeo.lat, destinationGeo.lng, poiType, 10000).catch(() => []);
        restaurants = await AMapService.searchNearby(destinationGeo.lat, destinationGeo.lng, '050000', 5000).catch(() => []);
        hotels = await AMapService.searchNearby(destinationGeo.lat, destinationGeo.lng, '100000', 5000).catch(() => []);
      } catch (e) {
        console.warn('POI搜索失败:', e);
      }
    }

    // 如果API调用失败，使用模拟数据
    if (!departureGeo || !destinationGeo || attractions.length === 0) {
      console.log('使用模拟数据');
      return this.generateMockItinerary(travelData);
    }

    // 生成每日行程
    const dailySchedules = this.generateDailySchedule(
      destination,
      destinationGeo,
      tripDays,
      tripTheme,
      attractions,
      restaurants,
      weather
    );

    return {
      departure: {
        name: departure,
        location: departureGeo,
      },
      destination: {
        name: destination,
        location: destinationGeo,
        city: destinationGeo.city,
      },
      route: routeInfo ? {
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        steps: routeInfo.steps || routeInfo.segments,
      } : this.getMockRouteInfo(travelMode),
      weather: weather || this.getMockWeather(),
      dailySchedules,
      recommendations: {
        attractions: attractions.slice(0, 10),
        restaurants: restaurants.slice(0, 5),
        hotels: hotels.slice(0, 5),
      },
      tips: this.generateTips(travelMode, weather, specialNeeds),
    };
  },

  /**
   * 生成模拟攻略数据（当API不可用时）
   */
  generateMockItinerary(travelData) {
    const { departure, destination, travelMode, departureDate, peopleCount, tripDays, tripTheme, budget, specialNeeds, interests } = travelData;

    const dailySchedules = this.generateDailySchedule(destination, null, tripDays, tripTheme, [], [], null);

    return {
      departure: {
        name: departure,
        location: { lng: 116.40, lat: 39.90, province: '北京市', city: '北京市' },
      },
      destination: {
        name: destination,
        location: { lng: 121.47, lat: 31.23, province: '上海市', city: '上海市' },
        city: '上海市',
      },
      route: this.getMockRouteInfo(travelMode),
      weather: this.getMockWeather(),
      dailySchedules,
      recommendations: {
        attractions: [
          { name: '东方明珠', address: '上海市浦东新区', type: '旅游景点', distance: '0' },
          { name: '外滩', address: '上海市黄浦区', type: '旅游景点', distance: '1000' },
          { name: '豫园', address: '上海市黄浦区', type: '旅游景点', distance: '2000' },
          { name: '南京路步行街', address: '上海市黄浦区', type: '购物场所', distance: '1500' },
          { name: '上海博物馆', address: '上海市黄浦区', type: '文化设施', distance: '2500' },
        ],
        restaurants: [
          { name: '南翔小笼包', address: '上海市嘉定区', type: '餐饮' },
          { name: '上海老饭店', address: '上海市黄浦区', type: '餐饮' },
          { name: '红房子西菜馆', address: '上海市卢湾区', type: '餐饮' },
        ],
        hotels: [
          { name: '上海外滩酒店', address: '上海市黄浦区', type: '住宿' },
          { name: '上海金茂君悦大酒店', address: '上海市浦东新区', type: '住宿' },
        ],
      },
      tips: this.generateTips(travelMode, null, specialNeeds),
    };
  },

  /**
   * 获取模拟路线信息
   */
  getMockRouteInfo(travelMode) {
    const routes = {
      driving: { distance: '1200000', duration: '46800' }, // 1200公里，13小时
      public: { distance: '1200000', duration: '14400' }, // 高铁约4小时
      airplane: { distance: '1200000', duration: '7200' }, // 飞行2小时
    };
    return routes[travelMode] || routes.driving;
  },

  /**
   * 获取模拟天气
   */
  getMockWeather() {
    return {
      weather: '多云',
      temperature: '22',
      wind: '东南风 3级',
      humidity: '65',
      reportTime: new Date().toLocaleString(),
    };
  },

  /**
   * 根据旅游主题获取POI类型
   */
  getPoiType(tripTheme) {
    const typeMap = {
      nature: '110000',
      culture: '140000',
      food: '050000',
      shopping: '060000',
      adventure: '110000',
      relax: '100000',
    };
    return typeMap[tripTheme] || '110000';
  },

  /**
   * 生成每日行程
   */
  generateDailySchedule(destination, destinationGeo, tripDays, tripTheme, attractions, restaurants, weather) {
    const schedules = [];
    const days = parseInt(tripDays) || 3;
    const destinationName = destination || '当地';

    for (let day = 1; day <= days; day++) {
      const dayAttractions = attractions.length > 0
        ? attractions.slice((day - 1) * 2 % attractions.length, (day - 1) * 2 % attractions.length + 2)
        : [];

      const dayRestaurants = restaurants.length > 0
        ? [restaurants[(day - 1) % restaurants.length]]
        : [];

      const schedule = [
        { time: '08:00', title: '早餐', description: '酒店自助早餐', type: 'meal' },
        { time: '09:00', title: '出发游览', description: dayAttractions[0]?.name || `${destinationName}著名景点${day}`, type: 'attraction', location: dayAttractions[0]?.location },
        { time: '12:00', title: '午餐', description: dayRestaurants[0]?.name || '当地特色餐厅', type: 'meal', location: dayRestaurants[0]?.location },
        { time: '14:00', title: '下午活动', description: dayAttractions[1]?.name || `${destinationName}其他景点`, type: 'attraction', location: dayAttractions[1]?.location },
        { time: '17:00', title: '自由活动', description: '购物或休息', type: 'free' },
        { time: '19:00', title: '晚餐', description: dayRestaurants[0]?.name || '品尝当地美食', type: 'meal' },
        { time: '20:00', title: '晚间活动', description: this.getEveningActivity(tripTheme), type: 'entertainment' },
      ];

      schedules.push({
        day,
        date: this.addDays(new Date(), day),
        schedule,
        weather: weather ? {
          temperature: weather.temperature + '°C',
          condition: weather.weather,
          wind: weather.wind,
        } : { temperature: '18-25°C', condition: '晴', wind: '微风' },
        accommodation: `${destinationName}第${day}天推荐住宿`,
      });
    }

    return schedules;
  },

  /**
   * 添加天数到日期
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * 获取晚间活动
   */
  getEveningActivity(tripTheme) {
    const activities = {
      nature: '欣赏夜景',
      culture: '观看文化演出',
      food: '夜市美食之旅',
      shopping: '逛夜市',
      adventure: '休息调整',
      relax: '温泉/SPA',
    };
    return activities[tripTheme] || '自由活动';
  },

  /**
   * 生成旅行提示
   */
  generateTips(travelMode, weather, specialNeeds) {
    const tips = [];

    if (weather) {
      if (weather.weather && weather.weather.includes('雨')) {
        tips.push('今日有雨，请携带雨具');
      }
      if (weather.temperature && parseInt(weather.temperature) > 30) {
        tips.push('今日气温较高，请注意防暑');
      } else if (weather.temperature && parseInt(weather.temperature) < 10) {
        tips.push('今日气温较低，请注意保暖');
      }
    }

    if (travelMode === 'driving') {
      tips.push('驾车出行请注意交通安全');
      tips.push('提前规划好停车地点');
    } else if (travelMode === 'public') {
      tips.push('公共交通出行请错开高峰时段');
      tips.push('随身携带身份证件');
    } else if (travelMode === 'airplane') {
      tips.push('请提前2小时到达机场');
      tips.push('随身行李请符合航空公司规定');
    }

    if (specialNeeds && specialNeeds.includes('kids')) {
      tips.push('带小孩出行请注意安全');
      tips.push('随身携带儿童常用药品');
    }
    if (specialNeeds && specialNeeds.includes('elderly')) {
      tips.push('老人出行请注意休息');
      tips.push('避免剧烈运动');
    }

    return tips.length > 0 ? tips : ['祝您旅途愉快！'];
  },
};

export default AIService;