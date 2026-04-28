/**
 * LLM服务模块
 * 支持豆包大语言模型
 * 用于生成详细的旅游攻略和建议
 */

class LLMService {
  constructor() {
    this.apiKey = 'ark-41e64cce-02a5-432f-ba81-3ab08f7c3932-b64a7';
    this.baseUrl = 'https://ark.bytedance.net/api/text';
    this.model = 'doubao';
    this.enabled = true;
    this.apiVersion = 'v1';
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
    const url = '/doubao-api/v1/chat/completions';
    console.log('豆包API调用:', url);
    console.log('API Key:', this.apiKey ? '已配置' : '未配置');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'doubao',
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

      console.log('豆包API响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('豆包API错误响应:', errorText);
        throw new Error(`豆包API调用失败: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('豆包API响应数据:', data);

      if (data.error) {
        throw new Error(data.error.message || '豆包API返回错误');
      }

      const result = data.choices?.[0]?.message?.content || '';
      console.log('豆包API返回内容长度:', result.length);
      return result;
    } catch (error) {
      console.error('豆包API调用异常:', error);
      throw error;
    }
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
   * 获取模拟AI回复
   */
  getMockTravelGuide(travelData) {
    const { destination, tripDays, travelMode, peopleCount } = travelData;
    const modeLabel = travelMode === 'driving' ? '自驾' : travelMode === 'public' ? '公共交通' : '飞机';
    
    return `# ${destination}${tripDays}天旅游攻略

## 📅 行程概览

您将开启一段精彩的${destination}之旅，共${tripDays}天${tripDays - 1}晚，${modeLabel}出行，${peopleCount}人同行。

## 🗓️ 每日行程

### 第1天：抵达与城市探索
- **上午**：抵达${destination}，入住酒店稍作休息
- **中午**：品尝当地特色美食
- **下午**：游览市中心著名景点
- **晚上**：逛夜市，体验当地夜生活

### 第2天：深度游览
- **上午**：前往主要景区游玩
- **中午**：景区内用餐
- **下午**：继续游览，拍照留念
- **晚上**：观看当地表演或演出

${tripDays > 2 ? `### 第3天：文化体验
- **上午**：参观博物馆或历史古迹
- **中午**：特色餐厅用餐
- **下午**：自由活动或购物
- **晚上**：准备返程

${tripDays > 3 ? `### 第4-${tripDays}天：自由探索
- 可根据兴趣选择周边景点游览
- 或安排休闲购物时间` : ''}` : ''}

## 🍽️ 美食推荐
- **必吃美食**：${destination}特色小吃、当地名菜
- **推荐餐厅**：当地老字号、特色餐厅
- **美食街**：${destination}美食街区

## 🏨 住宿建议
- **推荐区域**：市中心或景区附近
- **预算参考**：根据您的预算选择合适酒店
- **预订建议**：提前预订，旺季更需提早

## 🚗 交通指南
- **市内交通**：地铁、公交、出租车
- **景区交通**：步行或景区观光车
- ${travelMode === 'driving' ? '**自驾提示**：提前规划停车地点，注意限行政策' : ''}

## ⚠️ 注意事项
- 提前查询天气情况，备好合适衣物
- 景区门票建议提前网上预订
- 保管好个人财物，注意安全
- 尊重当地风俗习惯

## 💡 旅行小贴士
- 建议下载${destination}本地地图APP
- 准备移动电源，保持手机畅通
- 可购买当地交通卡方便出行

祝您旅途愉快！🎉`;
  }

  getMockDrivingRoute(travelData) {
    const { departure, destination } = travelData;
    return `# ${departure} → ${destination} 自驾路线规划

## 🗺️ 路线概览
- **总里程**：约800公里
- **预计时间**：约10小时
- **主要高速**：G1京哈高速、G2京沪高速

## 📍 详细路线

### 第一段：${departure}市区出发
- 从起点出发，进入${departure}绕城高速
- 途经：${departure}收费站
- 里程：约50公里，预计1小时

### 第二段：高速公路行驶
- 转入G1京哈高速，一路向南
- 推荐服务区：XX服务区（餐饮、加油、休息）
- 里程：约400公里，预计4.5小时
- ⚠️ 注意：此段路程较长，建议每2小时休息一次

### 第三段：途经城市
- 经过XX市，可选择在此午餐
- 继续沿高速行驶
- 里程：约200公里，预计2.5小时

### 第四段：抵达${destination}
- 转入${destination}绕城高速
- 下高速后进入市区
- 里程：约150公里，预计2小时
- 🅿️ 推荐停车场：${destination}市中心停车场

## ⛽ 服务区推荐
1. **XX服务区** - 设施齐全，餐饮选择多
2. **YY服务区** - 环境较好，适合休息
3. **ZZ服务区** - 靠近终点，可最后补给

## ⚠️ 安全提示
- 遵守限速规定，注意行车安全
- 长途驾驶建议轮流开车
- 提前检查车辆状况
- 备好应急物品

## 📱 导航建议
- 使用高德地图或百度地图导航
- 提前下载离线地图以防信号不佳
- 设置途经点提醒服务区位置

祝您一路平安！🚗💨`;
  }

  getMockHotelRecommendations(travelData) {
    const { destination, budget } = travelData;
    const budgetLabel = budget === 'low' ? '经济型' : budget === 'medium' ? '舒适型' : '豪华型';
    
    return `# ${destination}酒店推荐

根据您的${budgetLabel}预算，为您推荐以下酒店：

## 🏨 推荐酒店

### 1. ${destination}大酒店
- **星级**：★★★★★
- **位置**：市中心繁华地段，交通便利
- **价格**：¥800-1200/晚
- **特色**：设施豪华，服务周到，配有健身房和游泳池
- **适合**：追求高品质住宿体验的游客

### 2. ${destination}商务酒店
- **星级**：★★★★
- **位置**：商业区附近，出行方便
- **价格**：¥400-600/晚
- **特色**：性价比高，商务设施齐全
- **适合**：商务出行或中等预算游客

### 3. ${destination}精品民宿
- **类型**：特色民宿
- **位置**：老城区，充满当地风情
- **价格**：¥300-500/晚
- **特色**：温馨舒适，体验当地生活
- **适合**：喜欢特色住宿的游客

### 4. ${destination}快捷酒店
- **类型**：连锁快捷酒店
- **位置**：交通枢纽附近
- **价格**：¥200-300/晚
- **特色**：干净整洁，经济实惠
- **适合**：经济型预算游客

## 💡 预订建议
- 旺季建议提前1-2周预订
- 关注各大预订平台优惠活动
- 查看住客评价选择合适酒店
- 确认取消政策和退改规则

## 📍 位置选择
- **市中心**：交通便利，购物方便
- **景区附近**：游玩便利，环境优美
- **交通枢纽**：适合赶车赶飞机的游客

祝您入住愉快！🏠`;
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