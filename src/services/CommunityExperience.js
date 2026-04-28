/**
 * 社区经验模块
 * 收集常见问题和前人经验，提前告知用户避免问题
 */
const CommunityExperience = {
  /**
   * 获取常见问题和经验
   * @param {object} travelData - 旅行数据
   * @returns {Array} 常见问题和经验列表
   */
  getCommonIssues(travelData) {
    const {
      destination,
      travelMode,
      tripTheme,
      budget,
      specialNeeds,
      peopleCount
    } = travelData;

    const issues = [];

    // 获取目的地常见问题
    if (destination) {
      issues.push(...this.getDestinationIssues(destination));
    }

    // 获取交通常见问题
    issues.push(...this.getTrafficIssues(travelMode, destination));

    // 获取主题相关常见问题
    issues.push(...this.getThemeIssues(tripTheme, destination));

    // 获取预算相关常见问题
    issues.push(...this.getBudgetIssues(budget, destination));

    // 获取特殊需求相关问题
    if (specialNeeds?.length > 0) {
      issues.push(...this.getSpecialNeedsIssues(specialNeeds, destination));
    }

    // 获取人数相关常见问题
    issues.push(...this.getGroupIssues(peopleCount, travelMode));

    return issues;
  },

  /**
   * 获取目的地常见问题
   */
  getDestinationIssues(destination) {
    // 这里可以根据目的地返回特定问题
    // 实际应用中可以从数据库或API获取
    const destinationIssues = {
      '北京': [
        {
          category: '景点',
          severity: 'warning',
          title: '故宫门票需提前预约',
          description: '故宫博物院实行实名制预约门票，建议提前7天在官方平台预约，避免现场排队。',
          solution: '提前在故宫博物院官网或微信小程序预约，带好身份证原件。',
        },
        {
          category: '交通',
          severity: 'info',
          title: '早高峰交通拥堵',
          description: '北京工作日早高峰（7:00-9:00）交通拥堵严重。',
          solution: '建议选择地铁出行，或避开早高峰时段出门。',
        },
        {
          category: '美食',
          severity: 'tip',
          title: '北京特色美食推荐',
          description: '北京烤鸭建议选择老字号如全聚德、便宜坊。',
          solution: '提前预约，避免等位太久。',
        },
      ],
      '上海': [
        {
          category: '景点',
          severity: 'warning',
          title: '东方明珠观光需排队',
          description: '节假日和周末东方明珠游客较多，排队时间较长。',
          solution: '建议平日游玩，或提前在网上购票。',
        },
        {
          category: '交通',
          severity: 'info',
          title: '外滩夜景最佳观赏时间',
          description: '外滩灯光秀19:00开始，建议18:30前到达。',
          solution: '可以在外滩观景台欣赏夜景，注意人身安全。',
        },
        {
          category: '购物',
          severity: 'tip',
          title: '南京路步行街购物提示',
          description: '南京路商铺众多，价格参差不齐。',
          solution: '货比三家，注意保留购物凭证。',
        },
      ],
      '杭州': [
        {
          category: '景点',
          severity: 'warning',
          title: '西湖周边停车困难',
          description: '周末和节假日西湖周边停车位紧张。',
          solution: '建议公共交通出行，或停在较远的停车场。',
        },
        {
          category: '餐饮',
          severity: 'tip',
          title: '龙井茶购买提示',
          description: '龙井茶市场鱼龙混杂，价格差异大。',
          solution: '建议在正规店铺购买，注意查看产地标识。',
        },
      ],
      '成都': [
        {
          category: '美食',
          severity: 'warning',
          title: '火锅店排队时间长',
          description: '成都火锅店很受欢迎，高峰时段需排队1-2小时。',
          solution: '提前预约或错开饭点，推荐大龙燚、小龙坎等。',
        },
        {
          category: '景点',
          severity: 'info',
          title: '熊猫基地建议早上去',
          description: '大熊猫上午比较活跃，下午大多在睡觉。',
          solution: '建议8:00-10:00之间到达。',
        },
      ],
    };

    // 模糊匹配目的地
    const destLower = destination?.toLowerCase() || '';
    for (const [city, issues] of Object.entries(destinationIssues)) {
      if (destLower.includes(city.toLowerCase()) || city.toLowerCase().includes(destLower)) {
        return issues;
      }
    }

    // 默认返回通用问题
    return [
      {
        category: '准备',
        severity: 'info',
        title: '提前了解目的地天气',
        description: '出发前查看天气预报，准备合适的衣物。',
        solution: '关注当地天气预报，及时调整行程。',
      },
      {
        category: '安全',
        severity: 'warning',
        title: '随身携带重要证件',
        description: '身份证、护照等重要证件务必随身携带。',
        solution: '准备证件复印件或电子版，以备不时之需。',
      },
    ];
  },

  /**
   * 获取交通常见问题
   */
  getTrafficIssues(travelMode, destination) {
    const issues = {
      driving: [
        {
          category: '交通',
          severity: 'warning',
          title: '长途驾驶注意休息',
          description: '连续驾驶超过4小时容易疲劳，存在安全隐患。',
          solution: '每2-3小时到服务区休息15-20分钟。',
        },
        {
          category: '交通',
          severity: 'warning',
          title: '提前了解路况',
          description: '节假日或施工期间可能出现拥堵。',
          solution: '出发前查看导航和交通广播，了解实时路况。',
        },
        {
          category: '停车',
          severity: 'info',
          title: '景区停车注意事项',
          description: '热门景点停车位紧张，停车费用较高。',
          solution: '早到或选择周边停车场，避免耽误时间。',
        },
      ],
      public: [
        {
          category: '交通',
          severity: 'warning',
          title: '节假日票务紧张',
          description: '节假日期间火车票、机票较为紧张。',
          solution: '提前15-30天预订往返票。',
        },
        {
          category: '交通',
          severity: 'info',
          title: '安检流程需注意',
          description: '高铁、飞机安检较为严格。',
          solution: '提前2小时到达车站/机场，预留充足安检时间。',
        },
      ],
      airplane: [
        {
          category: '交通',
          severity: 'warning',
          title: '航班延误处理',
          description: '节假日和雷雨季节航班延误概率较高。',
          solution: '购买航班延误险，保留好延误证明。',
        },
        {
          category: '行李',
          severity: 'info',
          title: '行李额度需注意',
          description: '不同航空公司行李托运额度不同。',
          solution: '提前了解航司规定，超重提前购买额度。',
        },
      ],
    };

    return issues[travelMode] || [];
  },

  /**
   * 获取主题相关常见问题
   */
  getThemeIssues(tripTheme, destination) {
    const themeIssues = {
      nature: [
        {
          category: '安全',
          severity: 'warning',
          title: '自然景区注意安全',
          description: '自然景区可能存在地质灾害风险。',
          solution: '关注景区安全提示，不要进入危险区域。',
        },
        {
          category: '准备',
          severity: 'tip',
          title: '穿着防护装备',
          description: '户外活动建议穿着防护装备。',
          solution: '穿防滑鞋，带好防晒和驱蚊用品。',
        },
      ],
      culture: [
        {
          category: '礼仪',
          severity: 'warning',
          title: '尊重当地文化',
          description: '部分景点有宗教信仰，需要注意礼仪。',
          solution: '提前了解当地习俗，遵守景区规定。',
        },
        {
          category: '准备',
          severity: 'tip',
          title: '建议请导游讲解',
          description: '文化景点有导游讲解会更有收获。',
          solution: '可以请导游或使用语音导览设备。',
        },
      ],
      food: [
        {
          category: '饮食',
          severity: 'warning',
          title: '注意饮食卫生',
          description: '品尝当地美食时注意卫生。',
          solution: '选择正规餐厅，肠胃不好者备好药品。',
        },
        {
          category: '餐饮',
          severity: 'tip',
          title: '避开网红店高峰期',
          description: '网红餐厅可能需要排队很久。',
          solution: '提前预约或错开饭点。',
        },
      ],
      shopping: [
        {
          category: '购物',
          severity: 'warning',
          title: '警惕强制消费',
          description: '部分旅游景区存在购物陷阱。',
          solution: '理性消费，保留购物凭证。',
        },
        {
          category: '购物',
          severity: 'tip',
          title: '了解退换货政策',
          description: '购买贵重物品前了解退换政策。',
          solution: '尽量选择正规商场购买。',
        },
      ],
      adventure: [
        {
          category: '安全',
          severity: 'warning',
          title: '量力而行',
          description: '探险活动存在风险，不要勉强。',
          solution: '根据自身情况选择合适的项目。',
        },
        {
          category: '保险',
          severity: 'warning',
          title: '购买专业保险',
          description: '探险活动建议购买专业户外保险。',
          solution: '了解保险条款，确保包含相应项目。',
        },
      ],
      relax: [
        {
          category: '预约',
          severity: 'info',
          title: '提前预约',
          description: '温泉、酒店等需要提前预约。',
          solution: '提前电话或网上预约，确保有位。',
        },
      ],
    };

    return themeIssues[tripTheme] || [];
  },

  /**
   * 获取预算相关常见问题
   */
  getBudgetIssues(budget, destination) {
    if (budget === 'low') {
      return [
        {
          category: '省钱',
          severity: 'tip',
          title: '寻找优惠',
          description: '可以关注旅游平台优惠活动。',
          solution: '提前比较价格，使用优惠券。',
        },
        {
          category: '餐饮',
          severity: 'tip',
          title: '当地美食不一定贵',
          description: '当地人常去的餐厅价格实惠且正宗。',
          solution: '避免景区内餐厅，向当地人打听。',
        },
      ];
    }

    if (budget === 'high') {
      return [
        {
          category: '品质',
          severity: 'tip',
          title: '选择品质服务',
          description: '高端游建议选择品牌酒店和餐厅。',
          solution: '享受品质服务，体验当地特色。',
        },
      ];
    }

    return [];
  },

  /**
   * 获取特殊需求相关问题
   */
  getSpecialNeedsIssues(specialNeeds, destination) {
    const issues = [];

    if (specialNeeds?.includes('kids')) {
      issues.push(
        {
          category: '亲子',
          severity: 'warning',
          title: '儿童安全第一',
          description: '人多场所牵好孩子，避免走失。',
          solution: '使用防走失手环，确保孩子在视线内。',
        },
        {
          category: '亲子',
          severity: 'tip',
          title: '带好儿童用品',
          description: '常用药品、尿布等要备足。',
          solution: '提前列好清单，避免遗漏。',
        }
      );
    }

    if (specialNeeds?.includes('elderly')) {
      issues.push(
        {
          category: '老人',
          severity: 'warning',
          title: '避免过度疲劳',
          description: '行程安排要宽松，留足休息时间。',
          solution: '每天不超过3个景点，注意身体状况。',
        },
        {
          category: '老人',
          severity: 'tip',
          title: '携带必需品',
          description: '常用药品要带足。',
          solution: '处方药最好多带一些以防万一。',
        }
      );
    }

    if (specialNeeds?.includes('vegetarian')) {
      issues.push({
        category: '饮食',
        severity: 'info',
        title: '素食者注意事项',
        description: '部分地区素食选择较少。',
        solution: '提前查好餐厅，用翻译软件沟通需求。',
      });
    }

    return issues;
  },

  /**
   * 获取人数相关常见问题
   */
  getGroupIssues(peopleCount, travelMode) {
    if (peopleCount > 3) {
      return [
        {
          category: '团体',
          severity: 'warning',
          title: '提前确认集合时间地点',
          description: '多人出行容易走散。',
          solution: '约定集合时间和地点，保持通讯畅通。',
        },
        {
          category: '团体',
          severity: 'info',
          title: '提前预约',
          description: '多人用餐、住宿需提前预约。',
          solution: '提前联系餐厅和酒店，避免等待。',
        },
      ];
    }

    return [];
  },
};

export default CommunityExperience;