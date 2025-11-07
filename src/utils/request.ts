import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { BaseResponse } from '@/types'
import { message } from 'ant-design-vue'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const { code, message: msg, data } = response.data

    // 成功响应
    if (code === 200 || code === 0) {
      return data
    }

    // 业务错误
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error: AxiosError<BaseResponse>) => {
    console.error('Response error:', error)

    // HTTP 错误处理
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          message.error('未授权，请重新登录')
          // 清除 token 并跳转到登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接')
    } else {
      message.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request

// 便捷方法
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.get(url, config)
}

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.post(url, data, config)
}

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.put(url, data, config)
}

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.delete(url, config)
}
