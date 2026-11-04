/**
 * 种子数据 —— 首次运行自动写入 localStorage
 * 对应任务书 003「机电设备在线招投标系统」的两张核心表单：
 *  1) 机电设备招标信息表单
 *  2) 投标信息表单
 * 另附用户表（厂家/招标单位/管理员）与留言表。
 */

export const seedUsers = [
  {
    id: 'U1001',
    role: 'admin',
    username: 'admin',
    password: '123456',
    name: '系统管理员',
    contact: '张管理',
    phone: '0571-88001234',
    email: 'admin@mesbid.cn',
    address: '杭州市滨江区江南大道 1 号',
    license: '',
    intro: '平台运营与信息维护',
    status: 'active',
    createdAt: '2025-09-01'
  },
  {
    id: 'U2001',
    role: 'supplier',
    username: 'huayuan',
    password: '123456',
    name: '杭州华远数控设备有限公司',
    contact: '李建国',
    phone: '13805718888',
    email: 'market@huayuancnc.com',
    address: '杭州市萧山区装备制造园 8 号',
    license: '91330109MA2XXXXX1A',
    intro:
      '专注数控车床、加工中心研发制造 18 年，年产能 1200 台，产品覆盖汽车零部件、模具、航空航天零部件加工领域。',
    status: 'active',
    createdAt: '2025-09-12'
  },
  {
    id: 'U2002',
    role: 'supplier',
    username: 'jinggong',
    password: '123456',
    name: '苏州精工机器人科技有限公司',
    contact: '王海涛',
    phone: '13915678899',
    email: 'sales@jinggong-robot.com',
    address: '苏州市工业园区星湖街 328 号',
    license: '91320594MA1YYYYY2B',
    intro:
      '工业机器人本体与自动化产线集成商，六轴机器人负载覆盖 6kg–500kg，提供焊接、搬运、装配整体解决方案。',
    status: 'active',
    createdAt: '2025-09-20'
  },
  {
    id: 'U2003',
    role: 'supplier',
    username: 'hengli',
    password: '123456',
    name: '宁波恒力电气股份有限公司',
    contact: '陈美玲',
    phone: '13701234567',
    email: 'info@hengli-elec.com',
    address: '宁波市北仑区小港工业区 66 号',
    license: '91330206MA2ZZZZZ3C',
    intro:
      '高低压成套开关设备、干式变压器、变频调速装置制造商，具备国家电网入网资质。',
    status: 'active',
    createdAt: '2025-10-08'
  },
  {
    id: 'U2004',
    role: 'supplier',
    username: 'juchuang',
    password: '123456',
    name: '东莞巨创精密机械有限公司',
    contact: '刘志强',
    phone: '13600998877',
    email: 'service@juchuang.com',
    address: '东莞市长安镇厦岗社区振安路 12 号',
    license: '91441900MA4WWWWW4D',
    intro: '注塑机、激光切割设备销售与技术服务，华南地区授权服务商。',
    status: 'disabled',
    createdAt: '2025-10-19'
  },
  {
    id: 'U3001',
    role: 'tenderer',
    username: 'jiangnan',
    password: '123456',
    name: '江南重工装备集团有限公司',
    contact: '赵明远',
    phone: '0512-66889900',
    email: 'zhaobiao@jiangnan-hi.com',
    address: '苏州市吴中区东吴北路 199 号',
    license: '91320506MA5AAAAA5E',
    intro: '大型成套装备制造企业，年度设备采购预算约 3.2 亿元。',
    status: 'active',
    createdAt: '2025-09-05'
  },
  {
    id: 'U3002',
    role: 'tenderer',
    username: 'chengjian',
    password: '123456',
    name: '杭州市城建机电安装有限公司',
    contact: '孙倩',
    phone: '0571-87654321',
    email: 'purchase@hzcj-inst.com',
    address: '杭州市拱墅区湖州街 500 号',
    license: '91330105MA2BBBBB6F',
    intro: '市政机电安装工程总承包二级资质，承接轨道交通、医院、场馆机电项目。',
    status: 'active',
    createdAt: '2025-10-11'
  }
]

export const seedTenders = [
  {
    id: 'T2026001',
    code: 'JD-2026-0101',
    name: '数控立式车床',
    model: 'VTL-1600 双柱立式',
    packing: '木箱整体包装，防潮防锈，符合 GB/T 13384 出口包装要求',
    quantity: 6,
    unit: '台',
    deadline: '2026-12-20',
    deposit: 120000,
    tendererId: 'U3001',
    tendererName: '江南重工装备集团有限公司',
    region: '江苏·苏州',
    category: '金属切削设备',
    description:
      '用于风电法兰、大型轴承座加工。最大回转直径 1600mm，工作台承重 12t，主轴功率 55kW，要求配备西门子 828D 数控系统及自动换刀装置。交货期不超过 120 日历天，含安装调试与操作培训。',
    createdAt: '2026-10-08'
  },
  {
    id: 'T2026002',
    code: 'JD-2026-0102',
    name: '六轴工业机器人',
    model: 'JG-2100（负载 210kg）',
    packing: '原厂木托 + 防震泡沫，每台独立包装',
    quantity: 12,
    unit: '台',
    deadline: '2026-11-28',
    deposit: 90000,
    tendererId: 'U3001',
    tendererName: '江南重工装备集团有限公司',
    region: '江苏·苏州',
    category: '智能制造装备',
    description:
      '用于结构件焊接产线。重复定位精度 ±0.05mm，臂展 2100mm，配套焊接电源、清枪剪丝装置及安全围栏，需提供离线编程软件与三年质保。',
    createdAt: '2026-10-15'
  },
  {
    id: 'T2026003',
    code: 'JD-2026-0103',
    name: '干式变压器',
    model: 'SCB13-1600/10',
    packing: '防雨木箱，附出厂试验报告与铭牌照片',
    quantity: 8,
    unit: '台',
    deadline: '2026-11-15',
    deposit: 60000,
    tendererId: 'U3002',
    tendererName: '杭州市城建机电安装有限公司',
    region: '浙江·杭州',
    category: '输配电设备',
    description:
      '用于地铁站附属变电站。额定容量 1600kVA，电压等级 10/0.4kV，绝缘等级 H 级，空载损耗不高于一级能效限值，须提供国家变压器质量监督检验中心型式试验报告。',
    createdAt: '2026-10-03'
  },
  {
    id: 'T2026004',
    code: 'JD-2026-0104',
    name: '螺杆式空气压缩机',
    model: 'LG-75/8G 变频机型',
    packing: '整机木箱，随机附润滑油及备品备件清单',
    quantity: 4,
    unit: '台',
    deadline: '2026-12-05',
    deposit: 30000,
    tendererId: 'U3002',
    tendererName: '杭州市城建机电安装有限公司',
    region: '浙江·杭州',
    category: '通用动力设备',
    description:
      '排气量 13.6m³/min，排气压力 0.8MPa，配套冷冻式干燥机与三级过滤，噪音≤75dB(A)，要求一级能效并提供 5 年主机质保。',
    createdAt: '2026-10-21'
  },
  {
    id: 'T2026005',
    code: 'JD-2026-0105',
    name: '光纤激光切割机',
    model: '3015 型 12000W',
    packing: '整机防潮包装，切割台面单独加固',
    quantity: 3,
    unit: '台',
    deadline: '2026-10-30',
    deposit: 45000,
    tendererId: 'U3001',
    tendererName: '江南重工装备集团有限公司',
    region: '江苏·苏州',
    category: '金属切削设备',
    description:
      '加工幅面 3000×1500mm，定位精度 ±0.03mm，配备自动交换工作台与除尘系统，适用于碳钢 25mm、不锈钢 16mm 切割。',
    createdAt: '2026-09-18'
  },
  {
    id: 'T2026006',
    code: 'JD-2026-0106',
    name: '高压变频调速装置',
    model: 'HIVERT-Y 6kV/800kW',
    packing: '柜体整体包装，附防倾倒标识',
    quantity: 5,
    unit: '套',
    deadline: '2026-12-28',
    deposit: 75000,
    tendererId: 'U3002',
    tendererName: '杭州市城建机电安装有限公司',
    region: '浙江·杭州',
    category: '输配电设备',
    description:
      '用于水泵机组节能改造。输入 6kV/50Hz，输出 0–6kV 连续可调，效率≥97%，具备旁路切换功能，需提供 CE 认证及现场调试服务。',
    createdAt: '2026-10-27'
  },
  {
    id: 'T2026007',
    code: 'JD-2026-0107',
    name: '伺服注塑机',
    model: 'JU-3800 锁模力 3800kN',
    packing: '整机木箱，料筒防锈处理',
    quantity: 2,
    unit: '台',
    deadline: '2026-11-08',
    deposit: 25000,
    tendererId: 'U3001',
    tendererName: '江南重工装备集团有限公司',
    region: '江苏·苏州',
    category: '成型设备',
    description:
      '用于工程塑料结构件生产。理论注射容积 1200cm³，注射压力 190MPa，配伺服节能动力系统与机械手接口。',
    createdAt: '2026-09-30'
  },
  {
    id: 'T2026008',
    code: 'JD-2026-0108',
    name: '工业除尘系统',
    model: '脉冲袋式 LCM-2400',
    packing: '分体包装，滤袋单独封装',
    quantity: 1,
    unit: '套',
    deadline: '2026-12-12',
    deposit: 18000,
    tendererId: 'U3002',
    tendererName: '杭州市城建机电安装有限公司',
    region: '浙江·杭州',
    category: '环保设备',
    description:
      '处理风量 24000m³/h，过滤面积 320m²，排放浓度≤10mg/m³，配套风机、管道及电控系统，含安装指导。',
    createdAt: '2026-10-30'
  }
]

export const seedBids = [
  {
    id: 'B2026001',
    tenderId: 'T2026002',
    tenderCode: 'JD-2026-0102',
    tenderName: '六轴工业机器人',
    bidDate: '2026-10-22',
    bidderName: '苏州精工机器人科技有限公司',
    legalPerson: '王海涛',
    phone: '13915678899',
    manufacturer: '苏州精工机器人科技有限公司',
    produceDate: '2026-09',
    shelfLife: '12 个月',
    totalAmount: 5280000,
    depositPaidDate: '2026-10-20',
    supplierId: 'U2002',
    status: 'submitted',
    createdAt: '2026-10-22'
  },
  {
    id: 'B2026002',
    tenderId: 'T2026001',
    tenderCode: 'JD-2026-0101',
    tenderName: '数控立式车床',
    bidDate: '2026-10-25',
    bidderName: '杭州华远数控设备有限公司',
    legalPerson: '李建国',
    phone: '13805718888',
    manufacturer: '杭州华远数控设备有限公司',
    produceDate: '2026-08',
    shelfLife: '24 个月',
    totalAmount: 4860000,
    depositPaidDate: '2026-10-24',
    supplierId: 'U2001',
    status: 'submitted',
    createdAt: '2026-10-25'
  },
  {
    id: 'B2026003',
    tenderId: 'T2026003',
    tenderCode: 'JD-2026-0103',
    tenderName: '干式变压器',
    bidDate: '2026-10-19',
    bidderName: '宁波恒力电气股份有限公司',
    legalPerson: '陈美玲',
    phone: '13701234567',
    manufacturer: '宁波恒力电气股份有限公司',
    produceDate: '2026-07',
    shelfLife: '36 个月',
    totalAmount: 1960000,
    depositPaidDate: '2026-10-18',
    supplierId: 'U2003',
    status: 'submitted',
    createdAt: '2026-10-19'
  },
  {
    id: 'B2026004',
    tenderId: 'T2026005',
    tenderCode: 'JD-2026-0105',
    tenderName: '光纤激光切割机',
    bidDate: '2026-09-26',
    bidderName: '东莞巨创精密机械有限公司',
    legalPerson: '刘志强',
    phone: '13600998877',
    manufacturer: '东莞巨创精密机械有限公司',
    produceDate: '2026-06',
    shelfLife: '12 个月',
    totalAmount: 2340000,
    depositPaidDate: '2026-09-25',
    supplierId: 'U2004',
    status: 'submitted',
    createdAt: '2026-09-26'
  },
  {
    id: 'B2026005',
    tenderId: 'T2026003',
    tenderCode: 'JD-2026-0103',
    tenderName: '干式变压器',
    bidDate: '2026-10-20',
    bidderName: '宁波恒力电气股份有限公司',
    legalPerson: '陈美玲',
    phone: '13701234567',
    manufacturer: '宁波恒力电气股份有限公司',
    produceDate: '2026-08',
    shelfLife: '36 个月',
    totalAmount: 1880000,
    depositPaidDate: '2026-10-19',
    supplierId: 'U2003',
    status: 'submitted',
    createdAt: '2026-10-20'
  }
]

export const seedMessages = [
  {
    id: 'M2026001',
    authorId: 'U2001',
    authorName: '杭州华远数控设备有限公司',
    role: 'supplier',
    title: '关于 JD-2026-0101 技术参数的疑问',
    content:
      '招标文件中要求配备西门子 828D 系统，请问是否接受同等档次的发那科 0i-TF 系统？两者在性能上均可满足加工精度要求。',
    createdAt: '2026-10-10 09:24',
    status: 'published',
    reply: '可以接受同等档次数控系统，但须提供系统对比说明及加工精度检测报告，最终以评标委员会认定为准。',
    replyAt: '2026-10-10 15:02'
  },
  {
    id: 'M2026002',
    authorId: 'U2002',
    authorName: '苏州精工机器人科技有限公司',
    role: 'supplier',
    title: '投标保证金缴纳方式咨询',
    content: '投标保证金是否可以采用银行保函形式？保函有效期需覆盖投标有效期后多少天？',
    createdAt: '2026-10-16 11:05',
    status: 'published',
    reply: '可采用银行保函，有效期须覆盖投标有效期后 30 日历天，保函原件请于开标前递交至招标单位。',
    replyAt: '2026-10-16 17:30'
  },
  {
    id: 'M2026003',
    authorId: 'U2003',
    authorName: '宁波恒力电气股份有限公司',
    role: 'supplier',
    title: '交货期是否可以协商',
    content: 'SCB13-1600/10 常规交货期为 60 天，本项目要求 45 天，若分批交货是否可行？',
    createdAt: '2026-10-23 14:42',
    status: 'published',
    reply: '允许分两批交货，首批不少于 4 台且须在 45 天内到场，第二批不迟于 60 天。',
    replyAt: '2026-10-24 10:15'
  },
  {
    id: 'M2026004',
    authorId: 'U2001',
    authorName: '杭州华远数控设备有限公司',
    role: 'supplier',
    title: '现场踏勘安排',
    content: '希望了解设备安装现场的场地尺寸与行车吨位，是否统一组织踏勘？',
    createdAt: '2026-10-28 08:50',
    status: 'pending',
    reply: '',
    replyAt: ''
  },
  {
    id: 'M2026005',
    authorId: 'U2002',
    authorName: '苏州精工机器人科技有限公司',
    role: 'supplier',
    title: '质保期外服务报价',
    content: '请问质保期满后的年度维保服务是否单独计价？可否在投标文件中一并报出？',
    createdAt: '2026-10-29 16:18',
    status: 'published',
    reply: '可单独列明年度维保报价，作为技术商务评审的参考项，不计入投标总价。',
    replyAt: '2026-10-30 09:05'
  },
  {
    id: 'M2026006',
    authorId: 'U2004',
    authorName: '东莞巨创精密机械有限公司',
    role: 'supplier',
    title: '咨询激光切割机除尘接口',
    content: '3015 机型是否预留中央除尘接口？接口直径规格是多少？',
    createdAt: '2026-10-31 10:33',
    status: 'pending',
    reply: '',
    replyAt: ''
  }
]
