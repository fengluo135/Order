/**
 * 用户偏好分析模块
 * 分析用户输入，理解用户真实需求
 */
const UserPreferenceAnalyzer = {
  /**
   * 分析用户偏好
   * @param {object} travelData - 用户输入的旅行数据
   * @returns {object} 分析后的用户画像
   */
  analyzePreferences(travelData) {
    const {
      departure,
      destination,
      travelMode,
      tripDays,
      tripTheme,
      budget,
      specialNeeds,
      interests,
      peopleCount
    } = travelData;

    // 分析用户类型
    const userType = this.analyzeUserType(tripTheme, budget, peopleCount, specialNeeds);

    // 分析旅行目的
    const travelPurpose = this.analyzeTravelPurpose(tripTheme, interests);

    // 分析时间偏好
    const timePreference = this.analyzeTimePreference(tripDays, travelMode);

    // 生成个性化建议
    const personalizedTips = this.generatePersonalizedTips(
      userType,
      travelPurpose,
      travelMode,
      specialNeeds,
      destination
    );

    // 分析注意事项
    const cautions = this.analyzeCautions(
      travelMode,
      destination,
      specialNeeds,
      tripTheme,
      peopleCount
    );

    return {
      userType,
      travelPurpose,
      timePreference,
      personalizedTips,
      cautions,
      travelStyle: this.analyzeTravelStyle(interests, budget),
      riskLevel: this.analyzeRiskLevel(travelMode, tripTheme, specialNeeds),
    };
  },

  /**
   * 分析用户类型
   */
  analyzeUserType(tripTheme, budget, peopleCount, specialNeeds) {
    // 根据特殊需求判断
    if (specialNeeds?.includes('kids')) {
      return {
        type: 'family_with_kids',
        label: '亲子家庭游',
        description: '您需要照顾小孩，建议选择轻松愉快的行程，注意安全设施',
      };
    }
    if (specialNeeds?.includes('elderly')) {
      return {
        type: 'family_with_elderly',
        label: '家庭银发游',
        description: '有老人同行，建议选择体力消耗较小的行程，安排充足休息时间',
      };
    }

    // 根据人数判断
    if (peopleCount > 5) {
      return {
        type: 'group_tour',
        label: '团体游',
        description: '多人出行，建议提前预约，注意集合时间和交通安排',
      };
    }

    // 根据主题和预算判断
    if (budget === 'high' && ['relax', 'shopping'].includes(tripTheme)) {
      return {
        type: 'luxury',
        label: '品质休闲游',
        description: '追求品质体验，建议选择高端酒店和特色餐厅',
      };
    }

    if (tripTheme === 'adventure') {
      return {
        type: 'adventure',
        label: '探险体验游',
        description: '喜欢刺激和挑战，建议做好安全准备，量力而行',
      };
    }

    if (tripTheme === 'culture') {
      return {
        type: 'cultural',
        label: '文化探索游',
        description: '注重文化体验，建议提前了解目的地历史文化背景',
      };
    }

    return {
      type: 'normal',
      label: '常规旅游',
      description: '普通旅游方式，享受旅途乐趣',
    };
  },

  /**
   * 分析旅行目的
   */
  analyzeTravelPurpose(tripTheme, interests) {
    const purposeMap = {
      nature: ['放松身心', '亲近自然', '逃离城市喧嚣'],
      culture: ['了解历史', '体验文化', '增长见识'],
      food: ['品尝美食', '探索当地特色', '美食之旅'],
      shopping: ['购物休闲', '体验当地商业', '买买买'],
      adventure: ['挑战自我', '追求刺激', '探险体验'],
      relax: ['休闲度假', '身心放松', '慢生活'],
    };

    return {
      primary: purposeMap[tripTheme]?.[0] || '旅游',
      secondary: purposeMap[tripTheme]?.[1] || '体验',
      keywords: purposeMap[tripTheme] || ['旅游'],
    };
  },

  /**
   * 分析时间偏好
   */
  analyzeTimePreference(tripDays, travelMode) {
    const days = parseInt(tripDays) || 3;

    if (days <= 2) {
      return {
        pace: '紧凑',
        description: '时间较紧，建议合理规划，每天多安排几个景点',
        suggestion: '早起出发，合理利用时间',
      };
    }

    if (days >= 7) {
      return {
        pace: '悠闲',
        description: '时间充裕，可以深度体验，建议放慢节奏',
        suggestion: '不必赶行程，享受每一个地方',
      };
    }

    return {
      pace: '适中',
      description: '时间刚好，可以比较全面地体验',
      suggestion: '合理安排，既不累也不赶',
    };
  },

  /**
   * 分析旅行风格
   */
  analyzeTravelStyle(interests, budget) {
    const styles = [];

    if (interests?.includes('photography')) {
      styles.push({ name: '摄影爱好者', icon: '📷', tip: '早起拍日出，晚上拍夜景，注意光线' });
    }
    if (interests?.includes('food')) {
      styles.push({ name: '美食探索者', icon: '🍜', tip: '尝试当地特色美食，注意饮食卫生' });
    }
    if (interests?.includes('museum')) {
      styles.push({ name: '文化爱好者', icon: '🏛️', tip: '提前了解馆藏信息，合理安排时间' });
    }
    if (interests?.includes('hiking')) {
      styles.push({ name: '户外运动者', icon: '🥾', tip: '准备好装备，注意安全' });
    }

    if (budget === 'high') {
      styles.push({ name: '品质追求者', icon: '✨', tip: '选择高端体验，注重舒适度' });
    } else if (budget === 'low') {
      styles.push({ name: '省钱达人', icon: '💰', tip: '提前规划，寻找优惠' });
    }

    return styles.length > 0 ? styles : [{ name: '普通游客', icon: '🎒', tip: '开心就好' }];
  },

  /**
   * 分析风险等级
   */
  analyzeRiskLevel(travelMode, tripTheme, specialNeeds) {
    let level = 'low';
    let factors = [];

    if (travelMode === 'airplane') {
      level = 'medium';
      factors.push('航空出行需提前准备');
    }

    if (tripTheme === 'adventure') {
      level = 'high';
      factors.push('探险活动存在一定风险');
    }

    if (specialNeeds?.includes('kids') || specialNeeds?.includes('elderly')) {
      level = 'medium';
      factors.push('需要特别注意安全');
    }

    return { level, factors };
  },

  /**
   * 生成个性化建议
   */
  generatePersonalizedTips(userType, travelPurpose, travelMode, specialNeeds, destination) {
    const tips = [];

    // 用户类型建议
    tips.push(...this.getUserTypeTips(userType.type));

    // 出行方式建议
    tips.push(...this.getTravelModeTips(travelMode));

    // 特殊需求建议
    if (specialNeeds?.includes('kids')) {
      tips.push('记得带小孩常用药品和消毒湿巾');
      tips.push('选择有儿童设施的酒店和餐厅');
    }
    if (specialNeeds?.includes('elderly')) {
      tips.push('避免安排过于紧凑的行程');
      tips.push('随身携带老人常用药品');
    }

    // 目的地特定建议
    tips.push(...this.getDestinationTips(destination));

    return tips;
  },

  /**
   * 获取用户类型建议
   */
  getUserTypeTips(userType) {
    const tipsMap = {
      family_with_kids: [
        '选择适合儿童的活动项目',
        '注意儿童安全和防护',
        '带好儿童常用药品',
      ],
      family_with_elderly: [
        '行程安排要宽松，避免过度疲劳',
        '选择有电梯或低楼层住宿',
        '带好老人常用药品和保健品',
      ],
      group_tour: [
        '提前确定集合时间和地点',
        '保持手机畅通便于联系',
        '建议购买旅游意外险',
      ],
      adventure: [
        '做好安全防护措施',
        '提前了解活动风险',
        '购买专业户外保险',
      ],
      cultural: [
        '提前了解历史文化背景',
        '可以请导游或使用导览APP',
        '尊重当地文化和习俗',
      ],
    };
    return tipsMap[userType] || [];
  },

  /**
   * 获取出行方式建议
   */
  getTravelModeTips(travelMode) {
    const tipsMap = {
      driving: [
        '提前检查车况和油量',
        '准备好导航设备或手机导航',
        '注意休息，避免疲劳驾驶',
      ],
      public: [
        '提前购票，避免高峰期',
        '带好身份证件',
        '注意保管好随身物品',
      ],
      airplane: [
        '提前2小时到达机场',
        '了解行李托运规定',
        '提前选好座位',
      ],
    };
    return tipsMap[travelMode] || [];
  },

  /**
   * 获取目的地特定建议
   */
  getDestinationTips(destination) {
    // 这里可以根据目的地返回特定建议
    const tips = ['提前了解当地天气情况'];
    return tips;
  },

  /**
   * 分析注意事项
   */
  analyzeCautions(travelMode, destination, specialNeeds, tripTheme, peopleCount) {
    const cautions = [];

    // 季节性注意事项
    cautions.push({
      category: '季节',
      icon: '🌡️',
      items: [
        '提前查看天气预报',
        '准备适合的衣物',
        '注意防晒或保暖',
      ],
    });

    // 安全注意事项
    cautions.push({
      category: '安全',
      icon: '⚠️',
      items: [
        '注意人身和财产安全',
        '随身携带贵重物品',
        '保持通讯畅通',
      ],
    });

    // 交通注意事项
    cautions.push({
      category: '交通',
      icon: '🚗',
      items: this.getTrafficCautions(travelMode),
    });

    // 健康注意事项
    if (specialNeeds?.length > 0) {
      cautions.push({
        category: '健康',
        icon: '💊',
        items: this.getHealthCautions(specialNeeds),
      });
    }

    // 目的地特定注意事项
    cautions.push({
      category: '目的地',
      icon: '📍',
      items: this.getDestinationCautions(destination),
    });

    return cautions;
  },

  /**
   * 获取交通注意事项
   */
  getTrafficCautions(travelMode) {
    const map = {
      driving: [
        '提前规划路线',
        '注意交通规则',
        '避免疲劳驾驶',
      ],
      public: [
        '错开高峰时段',
        '注意运营时间',
        '提前购票',
      ],
      airplane: [
        '提前到达机场',
        '了解登机流程',
        '注意行李规定',
      ],
    };
    return map[travelMode] || [];
  },

  /**
   * 获取健康注意事项
   */
  getHealthCautions(specialNeeds) {
    const items = [];
    if (specialNeeds?.includes('kids')) {
      items.push('带好儿童药品');
    }
    if (specialNeeds?.includes('elderly')) {
      items.push('注意休息，避免过度劳累');
    }
    if (specialNeeds?.includes('vegetarian')) {
      items.push('提前告知餐厅素食需求');
    }
    return items.length > 0 ? items : ['注意身体状况'];
  },

  /**
   * 获取目的地注意事项
   */
  getDestinationCautions(destination) {
    // 通用建议
    return [
      '尊重当地风俗习惯',
      '保护环境，不乱扔垃圾',
      '尝试与当地人交流',
    ];
  },
};

export default UserPreferenceAnalyzer;