import axios from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';

// پیکربندی axios برای تلاش مجدد با تأخیر نمایی
axiosRetry(axios, {
  retries: 5, // حداکثر تعداد تلاش‌ها
  retryDelay: axiosRetry.exponentialDelay, // تأخیر نمایی برای تلاش‌ها
  shouldRetry: (error: any) => { // نوع خطا را به `any` تغییر می‌دهیم
    // فقط در صورت خطاهای شبکه یا خطاهای 5xx سرور، تلاش مجدد انجام می‌دهیم
    return error.code === 'ECONNABORTED' || error.response?.status >= 500;
  },
} as any); // تبدیل به نوع `any` برای جلوگیری از خطا

// ایجاد یک Circuit Breaker برای سرویس خارجی
const breaker = new CircuitBreaker(
  async () => {
    // درخواست به API خارجی (آدرس URL را با سرویس واقعی جایگزین کنید)
    const response = await axios.get('https://some-external-api.com');
    return response.data;
  },
  {
    timeout: 5000, // تایم‌اوت برای درخواست به سرویس
    errorThresholdPercentage: 50, // درصد خطاهای قابل تحمل که باعث قطع مدار می‌شود
    resetTimeout: 30000, // زمانی که پس از آن مدار شکن ریست می‌شود
  }
);

// تابع برای دریافت داده‌ها از سرویس خارجی با تلاش مجدد و مدار شکن
export const getExternalData = async () => {
  try {
    // استفاده از مدار شکن برای انجام درخواست به سرویس خارجی
    const externalData = await breaker.fire();
    return externalData;
  } catch (error) {
    // در صورت بروز خطا، یک پیام خطای توصیفی ارسال می‌کنیم
    throw new Error('سرویس خارجی در دسترس نیست');
  }
};
