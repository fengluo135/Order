import AMapService from './AMapService';
import UserPreferenceAnalyzer from './UserPreferenceAnalyzer';
import CommunityExperience from './CommunityExperience';
import LLMService from './LLMService';

const AIService = {
  /**
   * 生成完整的智能旅游攻略
   * 结合用户偏好、实时数据、社区经验和豆包AI
   * @param {object} travelData - 旅游数据
   * @returns {Promise<object>}
   */
  async generateItinerary(travelData) {
    const { departure, destination, travelMode, departureDate, peopleCount, tripDays, tripTheme, budget, specialNeeds, interests, userRequirements, userLocation } = travelData;

    // 1. 分析用户偏好
    const userProfile = UserPreferenceAnalyzer.analyzePreferences(travelData);

    // 2. 获取社区经验
    const commonIssues = CommunityExperience.getCommonIssues(travelData);

    // 3. 调用高德API获取实时数据
    let departureGeo = null;
    let destinationGeo = null;
    let routeInfo = null;
    let weather = null;
    let attractions = [];
    let restaurants = [];
    let hotels = [];
    let amapError = null;

    try {
      const geoResults = await Promise.all([
        AMapService.geocode(departure),
        AMapService.geocode(destination),
      ]);
      departureGeo = geoResults[0];
      destinationGeo = geoResults[1];
    } catch (e) {
      console.warn('地理编码失败:', e);
      amapError = '地理编码失败';
    }

    if (!departureGeo) {
      departureGeo = this.getMockGeo(departure);
    }
    if (!destinationGeo) {
      destinationGeo = this.getMockGeo(destination);
    }

    if (departureGeo && destinationGeo) {
      try {
        const origin = `${departureGeo.lng},${departureGeo.lat}`;
        const dest = `${destinationGeo.lng},${destinationGeo.lat}`;

        if (travelMode === 'driving') {
          routeInfo = await AMapService.drivingRoute(origin, dest);
        } else if (travelMode === 'public') {
          routeInfo = await AMapService.transitRoute(origin, dest);
        }
      } catch (e) {
        console.warn('路线规划失败:', e);
        routeInfo = this.getMockRoute(destination);
      }

      try {
        weather = await AMapService.weather(destinationGeo.city || destination);
      } catch (e) {
        console.warn('天气查询失败:', e);
        weather = this.getMockWeather();
      }

      try {
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
        const mockData = this.getMockPOI(destination, tripTheme);
        attractions = mockData.attractions;
        restaurants = mockData.restaurants;
        hotels = mockData.hotels;
      }
    }

    // 4. 调用豆包API生成详细攻略
    let llmGuide = null;
    let llmRoute = null;
    let llmHotels = null;
    let llmError = null;

    const mapData = { route: routeInfo, weather, attractions, restaurants, hotels };

    try {
      message.info('正在调用豆包AI生成详细攻略...');
      llmGuide = await LLMService.generateTravelGuide(travelData, mapData, userRequirements);

      if (travelMode === 'driving') {
        llmRoute = await LLMService.generateDrivingRoute(travelData, routeInfo, userRequirements);
      }

      llmHotels = await LLMService.generateHotelRecommendations(travelData, destination, userRequirements);
    } catch (e) {
      console.error('豆包API调用失败:', e);
      llmError = e.message;
      message.warning('豆包AI生成失败，将使用基础数据');
    }

    // 5. 生成每日行程
    const dailySchedules = this.generateDailySchedule(
      destination,
      destinationGeo,
      tripDays,
      tripTheme,
      attractions,
      restaurants,
      weather,
      userProfile,
      llmGuide
    );

    // 6. 生成综合建议
    const comprehensiveAdvice = this.generateComprehensiveAdvice(
      userProfile,
      weather,
      routeInfo,
      commonIssues,
      llmError
    );

    return {
      departure: {
        name: departure,
        location: departureGeo,
      },
      destination: {
        name: destination,
        location: destinationGeo,
        city: destinationGeo?.city,
      },
      route: routeInfo ? {
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        steps: routeInfo.steps || routeInfo.segments,
        llmRoute,
      } : null,
      weather: weather || this.getMockWeather(),
      dailySchedules,
      recommendations: {
        attractions: attractions.slice(0, 10),
        restaurants: restaurants.slice(0, 5),
        hotels: hotels.slice(0, 5),
        llmHotels,
      },
      userProfile,
      commonIssues,
      comprehensiveAdvice,
      llmGuide,
      llmError,
      llmEnabled: llmGuide !== null,
      userRequirements,
      userLocation,
    };
  },

  /**
   * 获取POI类型
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
  generateDailySchedule(destination, destinationGeo, tripDays, tripTheme, attractions, restaurants, weather, userProfile, llmGuide) {
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

      const llmDaySchedule = llmGuide?.schedules?.find(s => s.day === day);

      const adjustedSchedule = this.adjustScheduleForUser(
        day,
        dayAttractions,
        dayRestaurants,
        destinationName,
        userProfile,
        llmDaySchedule
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
        llmContent: llmDaySchedule?.content || '',
      });
    }

    return schedules;
  },

  /**
   * 根据用户偏好调整行程
   */
  adjustScheduleForUser(day, dayAttractions, dayRestaurants, destinationName, userProfile, llmDaySchedule) {
    if (llmDaySchedule) {
      return [
        { time: '全天', title: 'AI智能规划', description: llmDaySchedule.content, type: 'ai' },
      ];
    }

    const baseSchedule = [
      { time: '08:00', title: '早餐', description: '酒店自助早餐', type: 'meal' },
      { time: '09:00', title: '出发游览', description: dayAttractions[0]?.name || `${destinationName}著名景点${day}`, type: 'attraction', location: dayAttractions[0]?.location },
      { time: '12:00', title: '午餐', description: dayRestaurants[0]?.name || '当地特色餐厅', type: 'meal', location: dayRestaurants[0]?.location },
      { time: '14:00', title: '下午活动', description: dayAttractions[1]?.name || `${destinationName}其他景点`, type: 'attraction', location: dayAttractions[1]?.location },
      { time: '17:00', title: '自由活动', description: '购物或休息', type: 'free' },
      { time: '19:00', title: '晚餐', description: dayRestaurants[0]?.name || '品尝当地美食', type: 'meal' },
      { time: '20:00', title: '晚间活动', description: this.getEveningActivity(userProfile.travelPurpose?.primary), type: 'entertainment' },
    ];

    if (userProfile.userType?.type === 'family_with_elderly') {
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

    if (day === 1) {
      tips.push('第一天建议早点休息，适应环境');
    } else if (day === parseInt(userProfile.timePreference?.pace === '紧凑' ? 2 : 3)) {
      tips.push('行程过半，注意保存体力');
    }

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
  generateComprehensiveAdvice(userProfile, weather, routeInfo, commonIssues, llmError) {
    const advice = [];

    advice.push({
      category: '用户画像分析',
      icon: '👤',
      items: [
        `您的旅行类型：${userProfile.userType?.label || '常规旅游'}`,
        `旅行目的：${userProfile.travelPurpose?.primary || '旅游'}`,
        `行程节奏：${userProfile.timePreference?.pace || '适中'}`,
        ...(userProfile.userType?.description?.split('。').filter(Boolean) || []).map(s => s + '。'),
      ],
    });

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

    if (routeInfo) {
      const hours = Math.floor(parseInt(routeInfo.duration) / 3600);
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

    const highPriorityIssues = commonIssues.filter(i => i.severity === 'warning').slice(0, 3);
    if (highPriorityIssues.length > 0) {
      advice.push({
        category: '⚠️ 重要提醒',
        icon: '🚨',
        items: highPriorityIssues.map(i => `${i.title}：${i.solution}`),
      });
    }

    if (userProfile.personalizedTips?.length > 0) {
      advice.push({
        category: '个性化建议',
        icon: '💡',
        items: userProfile.personalizedTips.slice(0, 5),
      });
    }

    if (llmError) {
      advice.push({
        category: '🤖 AI状态',
        icon: '⚠️',
        items: [
          `豆包AI生成失败：${llmError}`,
          '将使用基础数据生成攻略',
          '可稍后重试获取更详细的AI攻略',
        ],
      });
    } else {
      advice.push({
        category: '🤖 AI状态',
        icon: '✅',
        items: [
          '豆包AI已生成详细攻略',
          '可在下方查看完整的每日行程',
        ],
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

  /**
   * 获取模拟地理编码数据
   */
  getMockGeo(address) {
    const mockLocations = {
      '北京': { lng: 116.4074, lat: 39.9042, city: '北京市', province: '北京市', district: '' },
      '上海': { lng: 121.4737, lat: 31.2304, city: '上海市', province: '上海市', district: '' },
      '广州': { lng: 113.2644, lat: 23.1291, city: '广州市', province: '广东省', district: '' },
      '深圳': { lng: 114.0596, lat: 22.5431, city: '深圳市', province: '广东省', district: '' },
      '杭州': { lng: 120.1919, lat: 30.2741, city: '杭州市', province: '浙江省', district: '' },
      '成都': { lng: 104.0668, lat: 30.5728, city: '成都市', province: '四川省', district: '' },
      '重庆': { lng: 106.5516, lat: 29.5630, city: '重庆市', province: '重庆市', district: '' },
      '武汉': { lng: 114.2871, lat: 30.5928, city: '武汉市', province: '湖北省', district: '' },
    };
    const city = address.replace(/市|省|区|县/g, '');
    return mockLocations[city] || mockLocations['北京'];
  },

  /**
   * 获取模拟路线数据
   */
  getMockRoute(destination) {
    const distances = {
      '北京': { distance: '10000', duration: '3600' },
      '上海': { distance: '120000', duration: '43200' },
      '广州': { distance: '2100000', duration: '72000' },
      '深圳': { distance: '2200000', duration: '75600' },
      '杭州': { distance: '1300000', duration: '46800' },
      '成都': { distance: '1800000', duration: '64800' },
      '重庆': { distance: '1600000', duration: '57600' },
      '武汉': { distance: '1100000', duration: '39600' },
    };
    const city = destination.replace(/市|省|区|县/g, '');
    const data = distances[city] || { distance: '500000', duration: '18000' };
    
    return {
      distance: data.distance,
      duration: data.duration,
      steps: [
        { instruction: '从起点出发，进入主路', road: '主干道', distance: '5000', time: '600' },
        { instruction: '直行约5公里后进入高速', road: '高速公路', distance: '50000', time: '3600' },
        { instruction: '沿高速直行', road: '高速公路', distance: '300000', time: '10800' },
        { instruction: '下高速，进入市区', road: '市区道路', distance: '10000', time: '1800' },
        { instruction: '到达目的地', road: '目的地周边', distance: '500', time: '60' },
      ],
    };
  },

  /**
   * 获取模拟天气数据
   */
  getMockWeather() {
    const weathers = [
      { weather: '晴', temperature: '25', wind: '东北风 2级', humidity: '60' },
      { weather: '多云', temperature: '23', wind: '东风 3级', humidity: '65' },
      { weather: '阴', temperature: '20', wind: '北风 2级', humidity: '75' },
      { weather: '小雨', temperature: '18', wind: '南风 3级', humidity: '85' },
    ];
    return weathers[Math.floor(Math.random() * weathers.length)];
  },

  /**
   * 获取模拟POI数据
   */
  getMockPOI(destination, theme) {
    const themeAttractions = {
      nature: [
        { name: `${destination}国家森林公园`, address: `${destination}市郊区`, location: '', type: '自然景观', distance: '2000' },
        { name: `${destination}湖景区`, address: `${destination}市西南郊`, location: '', type: '自然景观', distance: '5000' },
        { name: `${destination}山风景区`, address: `${destination}市西北方向`, location: '', type: '自然景观', distance: '8000' },
      ],
      culture: [
        { name: `${destination}博物馆`, address: `${destination}市中心`, location: '', type: '文化设施', distance: '1000' },
        { name: `${destination}古城遗址`, address: `${destination}市老城区`, location: '', type: '历史古迹', distance: '2000' },
        { name: `${destination}名人故居`, address: `${destination}市文化街区`, location: '', type: '历史古迹', distance: '1500' },
      ],
      food: [
        { name: `${destination}美食街`, address: `${destination}市商业中心`, location: '', type: '餐饮', distance: '800' },
        { name: `${destination}老字号餐厅`, address: `${destination}市老城区`, location: '', type: '餐饮', distance: '1200' },
        { name: `${destination}夜市`, address: `${destination}市步行街`, location: '', type: '餐饮', distance: '500' },
      ],
      shopping: [
        { name: `${destination}购物中心`, address: `${destination}市商业中心`, location: '', type: '购物', distance: '600' },
        { name: `${destination}步行街`, address: `${destination}市中心`, location: '', type: '购物', distance: '800' },
        { name: `${destination}奥特莱斯`, address: `${destination}市郊区`, location: '', type: '购物', distance: '15000' },
      ],
      adventure: [
        { name: `${destination}徒步路线`, address: `${destination}市郊外`, location: '', type: '户外', distance: '10000' },
        { name: `${destination}攀岩基地`, address: `${destination}市周边`, location: '', type: '户外', distance: '8000' },
        { name: `${destination}漂流景区`, address: `${destination}市郊区`, location: '', type: '户外', distance: '20000' },
      ],
      relax: [
        { name: `${destination}温泉度假村`, address: `${destination}市郊区`, location: '', type: '休闲', distance: '15000' },
        { name: `${destination}海滨浴场`, address: `${destination}市海边`, location: '', type: '休闲', distance: '10000' },
        { name: `${destination}SPA会所`, address: `${destination}市商业区`, location: '', type: '休闲', distance: '2000' },
      ],
    };

    const defaultAttractions = themeAttractions[theme] || themeAttractions.nature;
    
    return {
      attractions: defaultAttractions,
      restaurants: [
        { name: '特色餐厅A', address: `${destination}市美食街`, location: '', type: '餐饮', distance: '500' },
        { name: '特色餐厅B', address: `${destination}市老城区`, location: '', type: '餐饮', distance: '1000' },
        { name: '特色餐厅C', address: `${destination}市景区附近`, location: '', type: '餐饮', distance: '800' },
        { name: '特色餐厅D', address: `${destination}市商业街`, location: '', type: '餐饮', distance: '600' },
        { name: '特色餐厅E', address: `${destination}市酒店区`, location: '', type: '餐饮', distance: '400' },
      ],
      hotels: [
        { name: `${destination}大酒店`, address: `${destination}市市中心`, location: '', type: '住宿', distance: '300' },
        { name: `${destination}商务酒店`, address: `${destination}市商业区`, location: '', type: '住宿', distance: '500' },
        { name: `${destination}度假酒店`, address: `${destination}市景区附近`, location: '', type: '住宿', distance: '2000' },
        { name: `${destination}快捷酒店`, address: `${destination}市交通枢纽`, location: '', type: '住宿', distance: '800' },
        { name: `${destination}精品民宿`, address: `${destination}市老城区`, location: '', type: '住宿', distance: '1200' },
      ],
    };
  },
};

let message = {
  info: (msg) => console.log('INFO:', msg),
  warning: (msg) => console.warn('WARNING:', msg),
  error: (msg) => console.error('ERROR:', msg),
  success: (msg) => console.log('SUCCESS:', msg),
};

export function setMessageFunc(msgFunc) {
  if (msgFunc) message = msgFunc;
}

export default AIService;