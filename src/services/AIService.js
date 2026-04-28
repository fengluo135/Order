import AMapService from './AMapService';

const AIService = {
  /**
   * 生成完整的旅游攻略
   * @param {object} travelData - 旅游数据
   * @returns {Promise<object>}
   */
  async generateItinerary(travelData) {
    try {
      const { departure, destination, travelMode, departureDate, peopleCount, tripDays, tripTheme, budget, specialNeeds, interests } = travelData;

      // 获取出发地和目的地的地理编码
      const [departureGeo, destinationGeo] = await Promise.all([
        AMapService.geocode(departure),
        AMapService.geocode(destination),
      ]);

      if (!departureGeo || !destinationGeo) {
        throw new Error('地址解析失败，请检查输入的地址是否正确');
      }

      // 获取路线信息
      const origin = `${departureGeo.lng},${departureGeo.lat}`;
      const dest = `${destinationGeo.lng},${destinationGeo.lat}`;

      let routeInfo = null;
      if (travelMode === 'driving') {
        routeInfo = await AMapService.drivingRoute(origin, dest);
      } else if (travelMode === 'public') {
        routeInfo = await AMapService.transitRoute(origin, dest);
      }

      // 获取目的地天气
      const weather = await AMapService.weather(destinationGeo.city || destination);

      // 搜索目的地周边景点
      const attractions = await AMapService.searchNearby(
        destinationGeo.lat,
        destinationGeo.lng,
        this.getPoiType(tripTheme),
        10000
      );

      // 搜索目的地周边餐饮
      const restaurants = await AMapService.searchNearby(
        destinationGeo.lat,
        destinationGeo.lng,
        '050000', // 餐饮服务
        5000
      );

      // 搜索目的地周边住宿
      const hotels = await AMapService.searchNearby(
        destinationGeo.lat,
        destinationGeo.lng,
        '100000', // 住宿服务
        5000
      );

      // 生成每日行程
      const dailySchedules = await this.generateDailySchedule(
        destinationGeo,
        tripDays,
        tripTheme,
        attractions,
        restaurants,
        weather,
        specialNeeds,
        interests
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
        } : null,
        weather,
        dailySchedules,
        recommendations: {
          attractions: attractions.slice(0, 10),
          restaurants: restaurants.slice(0, 5),
          hotels: hotels.slice(0, 5),
        },
        tips: this.generateTips(travelMode, weather, specialNeeds),
      };
    } catch (error) {
      console.error('生成攻略错误:', error);
      throw error;
    }
  },

  /**
   * 根据旅游主题获取POI类型
   * @param {string} tripTheme
   * @returns {string}
   */
  getPoiType(tripTheme) {
    const typeMap = {
      nature: '110000', // 风景名胜
      culture: '140000', // 科教文化
      food: '050000', // 餐饮服务
      shopping: '060000', // 购物服务
      adventure: '110000', // 风景名胜
      relax: '100000', // 住宿服务
    };
    return typeMap[tripTheme] || '110000';
  },

  /**
   * 生成每日行程
   */
  async generateDailySchedule(destinationGeo, tripDays, tripTheme, attractions, restaurants, weather, specialNeeds, interests) {
    const schedules = [];
    const days = parseInt(tripDays) || 3;

    for (let day = 1; day <= days; day++) {
      // 每天选择不同的景点组合
      const dayAttractions = attractions.slice((day - 1) * 2 % attractions.length, (day - 1) * 2 % attractions.length + 2);
      const dayRestaurants = restaurants.slice((day - 1) % restaurants.length);

      const schedule = [
        { time: '08:00', title: '早餐', description: '酒店自助早餐', type: 'meal' },
        { time: '09:00', title: '出发游览', description: dayAttractions[0]?.name || '当地知名景点', type: 'attraction', location: dayAttractions[0]?.location },
        { time: '12:00', title: '午餐', description: dayRestaurants?.name || '当地特色餐厅', type: 'meal', location: dayRestaurants?.location },
        { time: '14:00', title: '下午活动', description: dayAttractions[1]?.name || '继续探索', type: 'attraction', location: dayAttractions[1]?.location },
        { time: '17:00', title: '自由活动', description: '购物或休息', type: 'free' },
        { time: '19:00', title: '晚餐', description: '品尝当地美食', type: 'meal' },
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
        accommodation: `${destinationGeo.name || destination}第${day}天推荐住宿`,
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

    // 天气提示
    if (weather) {
      if (weather.weather.includes('雨')) {
        tips.push('今日有雨，请携带雨具');
      }
      if (parseInt(weather.temperature) > 30) {
        tips.push('今日气温较高，请注意防暑');
      } else if (parseInt(weather.temperature) < 10) {
        tips.push('今日气温较低，请注意保暖');
      }
    }

    // 出行方式提示
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

    // 特殊需求提示
    if (specialNeeds && specialNeeds.includes('kids')) {
      tips.push('带小孩出行请注意安全');
      tips.push('随身携带儿童常用药品');
    }
    if (specialNeeds && specialNeeds.includes('elderly')) {
      tips.push('老人出行请注意休息');
      tips.push('避免剧烈运动');
    }

    return tips;
  },
};

export default AIService;