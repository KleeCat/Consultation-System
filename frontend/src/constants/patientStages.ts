export type PatientStageConfig = {
  order: number
  eyebrow: string
  title: string
  description: string
  primaryActionLabel: string
  secondaryActionLabel?: string
}

export const patientStages = {
  welcome: {
    order: 0,
    eyebrow: '开始问诊',
    title: '欢迎使用智能中医问诊系统',
    description: '先了解流程，再开始本次智能问诊。',
    primaryActionLabel: '开始问诊',
  },
  profile: {
    order: 1,
    eyebrow: '第一步：建立档案',
    title: '填写基础信息',
    description: '先完成本次问诊的基本资料登记。',
    primaryActionLabel: '下一步',
  },
  questionnaire: {
    order: 2,
    eyebrow: '第二步：体质问答',
    title: '完成基础问卷',
    description: '根据最近两周的真实感受完成作答。',
    primaryActionLabel: '提交问卷',
  },
  captureGuide: {
    order: 3,
    eyebrow: '第三步：采集准备',
    title: '阅读舌象采集要求',
    description: '先确认光线、姿势和拍摄方式。',
    primaryActionLabel: '开始采集',
  },
  capture: {
    order: 4,
    eyebrow: '第四步：舌象采集',
    title: '实时采集舌象图片',
    description: '优先使用摄像头，也支持上传或示例图。',
    primaryActionLabel: '拍照采集',
  },
  captureConfirm: {
    order: 5,
    eyebrow: '第五步：确认上传',
    title: '确认当前舌象图片',
    description: '检查清晰度和居中情况，再进入分析。',
    primaryActionLabel: '确认并分析',
  },
  analyzing: {
    order: 6,
    eyebrow: '第六步：智能分析',
    title: '正在分析问答与舌象信息',
    description: '系统正在整理本次问诊线索，请稍候。',
    primaryActionLabel: '等待结果',
  },
  result: {
    order: 7,
    eyebrow: '第七步：查看结果',
    title: '查看本次问诊结果',
    description: '先看核心判断，再看依据和调理建议。',
    primaryActionLabel: '完成',
  },
  finish: {
    order: 8,
    eyebrow: '问诊完成',
    title: '本次问诊已完成',
    description: '你可以返回首页，或直接重新开始下一次问诊。',
    primaryActionLabel: '返回首页',
    secondaryActionLabel: '重新问诊',
  },
} as const satisfies Record<string, PatientStageConfig>

export type PatientStageKey = keyof typeof patientStages
