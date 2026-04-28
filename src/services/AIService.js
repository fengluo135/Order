import AMapService from './AMapService';
import UserPreferenceAnalyzer from './UserPreferenceAnalyzer';
import CommunityExperience from './CommunityExperience';

const AIService = {
  /**
   * 生成完整的智能旅游攻略
   * 结合用户偏好、实时数据、社区经验
   * @param {object} travelData - 旅游数据
   * @returns {Promise<object>}
   */
  async generateItinerary(travelData) {
    const { departure, destination, travelMode, departureDate, peopleCount, tripDays, tripTheme, budget, specialNeeds, interests } = travelData;

    // 1. 分析用户偏好
    const userProfile = UserPreferenceAnalyzer.analyzePreferences(travelData);

    // 2. 获取社区经验（常见问题和前人经验）
    const commonIssues = CommunityExperience.getCommonIssues(travelData);

    // 3. 调用高德API获取实时数据
    let departureGeo = null;
    let destinationGeo = null;
    let routeInfo = null;
    let weather = null;
    let attractions = [];
    let restaurants = [];
    let hotels = [];

    try {
      // 地理编码
      const geoResults = await Promise.all([
        AMapService.geocode(departure),
        AMapService.geocode(destination),
      ]);
      departureGeo = geoResults[0];
      destinationGeo = geoResults[1];
    } catch (e) {
      console.warn('地理编码失败:', e);
    }

    // 如果地理编码成功，继续获取其他数据
    if (departureGeo && destinationGeo) {
      try {
        const origin = `${departureGeo.lng},${departureGeo.lat}`;
        const dest = `${destinationGeo.lng},${destinationGeo.lat}`;

        // 路线规划
        if (travelMode === 'driving') {
          routeInfo = await AMapService.drivingRoute(origin, dest);
        } else if (travelMode === 'public') {
          routeInfo = await AMapService.transitRoute(origin, dest);
        }
      } catch (e) {
        console.warn('路线规划失败:', e);
      }

      try {
        // 天气查询
        weather = await AMapService.weather(destinationGeo.city || destination);
      } catch (e) {
        console.warn('天气查询失败:', e);
      }

      try {
        // POI搜索
        const poiType = this.getPoiType(tripTheme);
        const [attr, rest, hotel] = await Promise.all([
          AMapService.searchNearby(destinationGeo.lat, destinationGeo.lng, poiType, 10000),
          AMapService.searchNearby(destinationGeo.lat, destinationGeo.lng, '050000', 5000),
          AMapService.searchNearby(destinationGeo.lat, destinationGeo.lng, '100000', 5000),
        ]);
        attractions = attr;
        restaurants = rest;
        hotels = hotel;
      } catch (e) {
        console.warn('POI搜索失败:', e);
      }
    }

    // 4. 如果API调用失败或数据不足，使用模拟数据
    const hasRealData = departureGeo && destinationGeo && attractions.length > 0;

    if (!hasRealData) {
      console.log('使用模拟数据生成攻略');
      return this.generateMockItinerary(travelData, userProfile, commonIssues);
    }

    // 5. 生成智能每日行程
    const dailySchedules = this.generateDailySchedule(
      destination,
      destinationGeo,
      tripDays,
      tripTheme,
      attractions,
      restaurants,
      weather,
      userProfile
    );

    // 6. 生成综合建议
    const comprehensiveAdvice = this.generateComprehensiveAdvice(
      userProfile,
      weather,
      routeInfo,
      commonIssues
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
      userProfile,
      commonIssues,
      comprehensiveAdvice,
    };
  },

  /**
   * 生成模拟攻略（当API不可用时）
   */
  generateMockItinerary(travelData, userProfile, commonIssues) {
    const { departure, destination, travelMode, tripDays, tripTheme } = travelData;

    const dailySchedules = this.generateDailySchedule(
      destination,
      { lng: 121.47, lat: 31.23 },
      tripDays,
      tripTheme,
      [],
      [],
      null,
      userProfile
    );

    const comprehensiveAdvice = this.generateComprehensiveAdvice(
      userProfile,
      null,
      null,
      commonIssues
    );

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
        attractions: this.getMockAttractions(destination),
        restaurants: this.getMockRestaurants(destination),
        hotels: this.getMockHotels(destination),
      },
      userProfile,
      commonIssues,
      comprehensiveAdvice,
    };
  },

  /**
   * 获取模拟景点数据
   */
  getMockAttractions(destination) {
    return [
      { name: '东方明珠', address: '上海市浦东新区', type: '旅游景点', distance: '0' },
      { name: '外滩', address: '上海市黄浦区', type: '旅游景点', distance: '1000' },
      { name: '豫园', address: '上海市黄浦区', type: '旅游景点', distance: '2000' },
      { name: '南京路步行街', address: '上海市黄浦区', type: '购物场所', distance: '1500' },
      { name: '上海博物馆', address: '上海市黄浦区', type: '文化设施', distance: '2500' },
    ];
  },

  /**
   * 获取模拟餐厅数据
   */
  getMockRestaurants(destination) {
    return [
      { name: '南翔小笼包', address: '上海市嘉定区', type: '餐饮' },
      { name: '上海老饭店', address: '上海市黄浦区', type: '餐饮' },
      { name: '红房子西菜馆', address: '上海市卢湾区', type: '餐饮' },
    ];
  },

  /**
   * 获取模拟酒店数据
   */
  getMockHotels(destination) {
    return [
      { name: '上海外滩酒店', address: '上海市黄浦区', type: '住宿' },
      { name: '上海金茂君悦大酒店', address: '上海市浦东新区', type: '住宿' },
    ];
  },

  /**
   * 获取模拟路线信息
   */
  getMockRouteInfo(travelMode) {
    const routes = {
      driving: { distance: '1200000', duration: '46800' },
      public: { distance: '1200000', duration: '14400' },
      airplane: { distance: '1200000', duration: '7200' },
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
  generateDailySchedule(destination, destinationGeo, tripDays, tripTheme, attractions, restaurants, weather, userProfile) {
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

      // 根据用户偏好调整行程
      const adjustedSchedule = this.adjustScheduleForUser(
        day,
        dayAttractions,
        dayRestaurants,
        destinationName,
        userProfile
      );

      schedules.push({
        day,
        date: this.addDays(new Date(), day),
        schedule: adjustedSchedule,
        weather: weather ? {
          temperature: weather.temperature + '°C',
          condition: weather.weather,
          wind: weather.wind,
        } : { temperature: '18-25°C', condition: '晴', wind: '微风' },
        accommodation: `${destinationName}第${day}天推荐住宿`,
        dailyTip: this.getDailyTip(day, userProfile, weather),
      });
    }

    return schedules;
  },

  /**
   * 根据用户偏好调整行程
   */
  adjustScheduleForUser(day, dayAttractions, dayRestaurants, destinationName, userProfile) {
    const baseSchedule = [
      { time: '08:00', title: '早餐', description: '酒店自助早餐', type: 'meal' },
      { time: '09:00', title: '出发游览', description: dayAttractions[0]?.name || `${destinationName}著名景点${day}`, type: 'attraction', location: dayAttractions[0]?.location },
      { time: '12:00', title: '午餐', description: dayRestaurants[0]?.name || '当地特色餐厅', type: 'meal', location: dayRestaurants[0]?.location },
      { time: '14:00', title: '下午活动', description: dayAttractions[1]?.name || `${destinationName}其他景点`, type: 'attraction', location: dayAttractions[1]?.location },
      { time: '17:00', title: '自由活动', description: '购物或休息', type: 'free' },
      { time: '19:00', title: '晚餐', description: dayRestaurants[0]?.name || '品尝当地美食', type: 'meal' },
      { time: '20:00', title: '晚间活动', description: this.getEveningActivity(userProfile.travelPurpose.primary), type: 'entertainment' },
    ];

    // 根据用户类型调整行程
    if (userProfile.userType.type === 'family_with_elderly') {
      // 如果有老人，增加休息时间
      return baseSchedule.map(item => {
        if (item.type === 'attraction') {
          return { ...item, duration: '较长' };
        }
        return item;
      });
    }

    return baseSchedule;
  },

  /**
   * 获取每日提示
   */
  getDailyTip(day, userProfile, weather) {
    const tips = [];

    // 根据天数提供建议
    if (day === 1) {
      tips.push('第一天建议早点休息，适应环境');
    } else if (day === parseInt(userProfile.timePreference?.pace === '紧凑' ? 2 : 3)) {
      tips.push('行程过半，注意保存体力');
    }

    // 根据天气提供建议
    if (weather?.weather?.includes('雨')) {
      tips.push('今日有雨，记得带伞');
    }
    if (weather?.temperature && parseInt(weather.temperature) > 30) {
      tips.push('天气炎热，注意防暑');
    }

    return tips;
  },

  /**
   * 获取晚间活动
   */
  getEveningActivity(travelPurpose) {
    const purposeActivities = {
      '放松身心': '欣赏夜景，放松心情',
      '了解历史': '观看文化演出或夜游',
      '品尝美食': '夜市美食探索',
      '购物休闲': '逛夜市或商场',
      '挑战自我': '夜间娱乐活动',
      '休闲度假': '酒店休闲或SPA',
    };
    return purposeActivities[travelPurpose] || '自由活动';
  },

  /**
   * 生成综合建议
   */
  generateComprehensiveAdvice(userProfile, weather, routeInfo, commonIssues) {
    const advice = [];

    // 1. 根据用户类型提供建议
    advice.push({
      category: '用户画像分析',
      icon: '👤',
      items: [
        `您的旅行类型：${userProfile.userType.label}`,
        `旅行目的：${userProfile.travelPurpose.primary}`,
        `行程节奏：${userProfile.timePreference?.pace || '适中'}`,
        ...userProfile.userType.description.split('。').filter(Boolean).map(s => s + '。'),
      ],
    });

    // 2. 根据天气提供建议
    if (weather) {
      advice.push({
        category: '天气提醒',
        icon: '🌤️',
        items: [
          `当前天气：${weather.weather}，温度${weather.temperature}°C`,
          `风力：${weather.wind}`,
          parseInt(weather.temperature) > 30 ? '⚠️ 天气炎热，注意防暑降温' : null,
          parseInt(weather.temperature) < 10 ? '⚠️ 天气较凉，注意保暖' : null,
          weather.weather?.includes('雨') ? '🌧️ 记得带伞防雨' : null,
        ].filter(Boolean),
      });
    }

    // 3. 根据路线提供建议
    if (routeInfo) {
      const hours = Math.floor(routeInfo.duration / 3600);
      advice.push({
        category: '路程提醒',
        icon: '🚗',
        items: [
          `预计路程时间：约${hours}小时`,
          `提前规划好出发时间`,
          hours > 4 ? '⚠️ 长途驾驶注意休息' : null,
        ].filter(Boolean),
      });
    }

    // 4. 高优先级问题提醒
    const highPriorityIssues = commonIssues.filter(i => i.severity === 'warning').slice(0, 3);
    if (highPriorityIssues.length > 0) {
      advice.push({
        category: '⚠️ 重要提醒',
        icon: '🚨',
        items: highPriorityIssues.map(i => `${i.title}：${i.solution}`),
      });
    }

    // 5. 个性化建议
    if (userProfile.personalizedTips?.length > 0) {
      advice.push({
        category: '个性化建议',
        icon: '💡',
        items: userProfile.personalizedTips.slice(0, 5),
      });
    }

    return advice;
  },

  /**
   * 添加天数到日期
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
};

export default AIService;