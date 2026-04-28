/**
 * LLM服务模块
 * 支持豆包大语言模型
 * 用于生成详细的旅游攻略和建议
 */

class LLMService {
  constructor() {
    this.apiKey = 'ark-41e64cce-02a5-432f-ba81-3ab08f7c3932-b64a7';
    this.baseUrl = 'https://ark.cn-beijing.volces.com/api/v3';
    this.model = 'doubao-pro-32k';
  }

  /**
   * 生成详细旅游攻略
   */
  async generateTravelGuide(travelData, mapData, userRequirements = '') {
    const prompt = this.buildTravelGuidePrompt(travelData, mapData, userRequirements);

    try {
      const response = await this.callDoubao(prompt);
      return this.parseTravelGuideResponse(response);
    } catch (error) {
      console.error('LLM调用失败:', error);
      throw error;
    }
  }

  /**
   * 生成详细路线规划（驾车专用）
   */
  async generateDrivingRoute(travelData, routeInfo, userRequirements = '') {
    const prompt = this.buildDrivingRoutePrompt(travelData, routeInfo, userRequirements);

    try {
      const response = await this.callDoubao(prompt);
      return this.parseDrivingRouteResponse(response);
    } catch (error) {
      console.error('LLM调用失败:', error);
      throw error;
    }
  }

  /**
   * 生成酒店推荐
   */
  async generateHotelRecommendations(travelData, destination, userRequirements = '') {
    const prompt = this.buildHotelPrompt(travelData, destination, userRequirements);

    try {
      const response = await this.callDoubao(prompt);
      return this.parseHotelResponse(response);
    } catch (error) {
      console.error('LLM调用失败:', error);
      throw error;
    }
  }

  /**
   * 调用豆包API
   */
  async callDoubao(prompt) {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `你是一个专业的旅游规划师，擅长生成详细、实用的旅游攻略。请根据用户的需求，结合地图数据，生成包含以下内容的详细攻略：

1. 每日详细行程安排（精确到小时）
2. 每个景点的具体地址、开放时间、门票信息、游玩建议
3. 推荐的餐厅和美食（包括价格范围）
4. 住宿推荐（包括价格、位置、特点）
5. 交通路线（包括具体的高速公路名称、出入口、休息点）
6. 注意事项和避坑指南
7. 根据用户特殊需求提供的个性化建议

请用中文回复，格式清晰，使用表情符号增加可读性。`
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`豆包API调用失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || '豆包API返回错误');
    }

    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * 构建旅游攻略提示词
   */
  buildTravelGuidePrompt(travelData, mapData, userRequirements = '') {
    const { departure, destination, travelMode, tripDays, tripTheme, budget, specialNeeds, interests, peopleCount } = travelData;

    let prompt = `# 旅游规划请求

## 基本信息
- 出发地：${departure || '用户当前位置'}
- 目的地：${destination}
- 出行方式：${travelMode === 'driving' ? '自驾' : travelMode === 'public' ? '公共交通' : '飞机'}
- 行程天数：${tripDays}天
- 旅游主题：${this.getThemeLabel(tripTheme)}
- 预算：${this.getBudgetLabel(budget)}
- 人数：${peopleCount}人
- 特殊需求：${specialNeeds?.length ? specialNeeds.join('、') : '无'}
- 兴趣偏好：${interests?.length ? interests.join('、') : '无'}`;

    if (userRequirements) {
      prompt += `\n\n## 用户个性化需求\n${userRequirements}`;
    }

    if (mapData?.route) {
      prompt += `\n\n## 路线信息
- 路线距离：${(mapData.route.distance / 1000).toFixed(1)}公里
- 预计时间：${Math.floor(mapData.route.duration / 3600)}小时${Math.floor((mapData.route.duration % 3600) / 60)}分钟`;
    }

    if (mapData?.weather) {
      prompt += `\n\n## 目的地天气
- 天气：${mapData.weather.weather}
- 温度：${mapData.weather.temperature}°C
- 风力：${mapData.weather.wind}`;
    }

    if (mapData?.attractions?.length > 0) {
      prompt += `\n\n## 推荐景点
`;
      mapData.attractions.slice(0, 10).forEach((attr, index) => {
        prompt += `${index + 1}. ${attr.name} - ${attr.address || '地址未知'} (距离: ${attr.distance || '未知'}米)\n`;
      });
    }

    if (mapData?.restaurants?.length > 0) {
      prompt += `\n## 推荐美食
`;
      mapData.restaurants.slice(0, 5).forEach((rest, index) => {
        prompt += `${index + 1}. ${rest.name} - ${rest.address || '地址未知'}\n`;
      });
    }

    if (mapData?.hotels?.length > 0) {
      prompt += `\n## 推荐酒店
`;
      mapData.hotels.slice(0, 5).forEach((hotel, index) => {
        prompt += `${index + 1}. ${hotel.name} - ${hotel.address || '地址未知'}\n`;
      });
    }

    prompt += `

## 生成要求
请生成一份详细的${tripDays}天${destination}旅游攻略，包含：
1. 每日行程时间表（08:00-22:00）
2. 每个景点的详细信息
3. 餐厅推荐（含价格参考）
4. 住宿推荐（含价格参考）
5. 交通路线详细说明
6. 注意事项和避坑指南
7. 根据用户特殊需求的个性化建议

请用Markdown格式回复，使用emoji增加可读性。`;

    return prompt;
  }

  /**
   * 构建驾车路线提示词
   */
  buildDrivingRoutePrompt(travelData, routeInfo, userRequirements = '') {
    const { departure, destination, travelMode, peopleCount, specialNeeds } = travelData;

    let prompt = `# 自驾路线规划请求

## 基本信息
- 出发地：${departure || '用户当前位置'}
- 目的地：${destination}
- 出行方式：自驾
- 人数：${peopleCount}人
- 特殊需求：${specialNeeds?.length ? specialNeeds.join('、') : '无'}`;

    if (userRequirements) {
      prompt += `\n\n## 用户个性化需求\n${userRequirements}`;
    }

    if (routeInfo) {
      prompt += `\n\n## 高德地图路线数据
- 路线距离：${(routeInfo.distance / 1000).toFixed(1)}公里
- 预计时间：${Math.floor(routeInfo.duration / 3600)}小时${Math.floor((routeInfo.duration % 3600) / 60)}分钟`;
    }

    prompt += `

## 生成要求
请生成一份详细的自驾路线规划，包含：
1. 详细的高速公路名称和编号
2. 每个关键路口的转向说明
3. 推荐的中途休息点（每2小时休息一次）
4. 每个服务区的设施介绍（餐饮、加油、休息）
5. 可能遇到的路况问题和解决方案
6. 到达目的地后的停车建议
7. 长途驾驶的安全提示

请用Markdown格式回复，使用emoji增加可读性。`;

    return prompt;
  }

  /**
   * 构建酒店推荐提示词
   */
  buildHotelPrompt(travelData, destination, userRequirements = '') {
    const { budget, specialNeeds, peopleCount, tripDays, tripTheme } = travelData;

    let prompt = `# 酒店推荐请求

## 基本信息
- 目的地：${destination}
- 入住天数：${tripDays}天
- 人数：${peopleCount}人
- 预算：${this.getBudgetLabel(budget)}
- 旅游主题：${this.getThemeLabel(tripTheme)}
- 特殊需求：${specialNeeds?.length ? specialNeeds.join('、') : '无'}`;

    if (userRequirements) {
      prompt += `\n\n## 用户个性化需求\n${userRequirements}`;
    }

    prompt += `

## 生成要求
请推荐5-8家酒店，包含：
1. 酒店名称和星级
2. 地理位置和周边交通
3. 价格范围（每晚）
4. 特色亮点和适合人群
5. 预订建议和注意事项
6. 取消政策等实用信息

请用Markdown格式回复，使用emoji增加可读性。`;

    return prompt;
  }

  /**
   * 解析旅游攻略响应
   */
  parseTravelGuideResponse(response) {
    return {
      schedules: [],
      rawResponse: response,
    };
  }

  /**
   * 解析驾车路线响应
   */
  parseDrivingRouteResponse(response) {
    return {
      routes: [],
      restStops: [],
      rawResponse: response,
    };
  }

  /**
   * 解析酒店推荐响应
   */
  parseHotelResponse(response) {
    return {
      hotels: [],
      rawResponse: response,
    };
  }

  /**
   * 获取主题标签
   */
  getThemeLabel(theme) {
    const labels = {
      nature: '自然风光',
      culture: '历史文化',
      food: '美食之旅',
      shopping: '购物休闲',
      adventure: '探险活动',
      relax: '休闲度假',
    };
    return labels[theme] || theme;
  }

  /**
   * 获取预算标签
   */
  getBudgetLabel(budget) {
    const labels = {
      low: '经济型',
      medium: '舒适型',
      high: '豪华型',
    };
    return labels[budget] || budget;
  }
}

export default new LLMService();