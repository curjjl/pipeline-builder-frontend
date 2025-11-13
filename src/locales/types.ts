import type enUS from './en-US'

// 自动推断类型
export type MessageSchema = typeof enUS

// 扩展 vue-i18n 类型
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}
