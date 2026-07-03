import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://azm-b.onrender.com/api'
).replace(/\/$/, '');

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000,
});

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

function networkErrorMessage(): string {
  if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
    return 'Cannot reach the server. Make sure the backend is running on port 5001.';
  }
  return 'Cannot reach the server. The API may be starting up — wait a moment and try again.';
}

async function request<T>(
  endpoint: string,
  config: AxiosRequestConfig = {},
  token?: string | null
): Promise<T> {
  try {
    const response = await http.request<T>({
      url: endpoint,
      ...config,
      headers: {
        ...(config.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw new ApiError('Unexpected error', 0);
    }

    const axiosError = error as AxiosError<{ message?: string }>;

    if (!axiosError.response) {
      throw new ApiError(networkErrorMessage(), 0);
    }

    const { status, data } = axiosError.response;

    if (status === 401 && token) {
      onUnauthorized?.();
    }

    const message =
      (typeof data?.message === 'string' && data.message) ||
      (status === 401
        ? 'Session expired. Please sign in again.'
        : status === 503
          ? 'Server database is not connected. Start MongoDB and restart the backend.'
          : `Request failed (${status})`);

    throw new ApiError(message, status);
  }
}

export const api = {
  health: () =>
    request<{ status: string; message: string; database?: string }>('/health'),

  register: (name: string, email: string, password: string) =>
    request<import('@/types').AuthResponse>('/auth/register', {
      method: 'POST',
      data: { name, email, password },
    }),

  login: (email: string, password: string) =>
    request<import('@/types').AuthResponse>('/auth/login', {
      method: 'POST',
      data: { email, password },
    }),

  getCategories: (token: string) =>
    request<import('@/types').Category[]>('/categories', {}, token),

  createCategory: (
    token: string,
    data: { name: string; color?: string; icon?: string }
  ) =>
    request<import('@/types').Category>('/categories', { method: 'POST', data }, token),

  updateCategory: (
    token: string,
    id: string,
    data: Partial<{ name: string; color: string; icon: string }>
  ) =>
    request<import('@/types').Category>(
      `/categories/${id}`,
      { method: 'PUT', data },
      token
    ),

  deleteCategory: (token: string, id: string) =>
    request<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }, token),

  getHabits: (token: string, date?: string, categoryId?: string) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (categoryId) params.set('categoryId', categoryId);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<import('@/types').Habit[]>(`/habits${q}`, {}, token);
  },

  createHabit: (token: string, data: Record<string, unknown>) =>
    request<import('@/types').Habit>('/habits', { method: 'POST', data }, token),

  updateHabit: (token: string, id: string, data: Record<string, unknown>) =>
    request<import('@/types').Habit>(`/habits/${id}`, { method: 'PUT', data }, token),

  deleteHabit: (token: string, id: string) =>
    request<{ message: string }>(`/habits/${id}`, { method: 'DELETE' }, token),

  toggleHabit: (
    token: string,
    id: string,
    date: string,
    durationSeconds?: number
  ) =>
    request<import('@/types').HabitLogToggle>(
      `/habits/${id}/toggle`,
      { method: 'POST', data: { date, durationSeconds } },
      token
    ),

  startTimer: (token: string, id: string, date: string) =>
    request<import('@/types').HabitLogToggle>(
      `/habits/${id}/timer/start`,
      { method: 'POST', data: { date } },
      token
    ),

  stopTimer: (
    token: string,
    id: string,
    date: string,
    durationSeconds?: number
  ) =>
    request<import('@/types').HabitLogToggle>(
      `/habits/${id}/timer/stop`,
      { method: 'POST', data: { date, durationSeconds } },
      token
    ),

  getCalendarData: (token: string, start: string, end: string) =>
    request<import('@/types').CalendarData>(
      `/habits/logs/range?start=${start}&end=${end}`,
      {},
      token
    ),

  getSummary: (
    token: string,
    params?: { month?: string; start?: string; end?: string }
  ) => {
    const search = new URLSearchParams();
    if (params?.month) search.set('month', params.month);
    if (params?.start) search.set('start', params.start);
    if (params?.end) search.set('end', params.end);
    const query = search.toString() ? `?${search.toString()}` : '';
    return request<import('@/types').SummaryData>(`/summary${query}`, {}, token);
  },

  getDiaryEntries: (
    token: string,
    params?: { date?: string; month?: string }
  ) => {
    const search = new URLSearchParams();
    if (params?.date) search.set('date', params.date);
    if (params?.month) search.set('month', params.month);
    const q = search.toString() ? `?${search.toString()}` : '';
    return request<import('@/types').DiaryEntry[]>(`/diary${q}`, {}, token);
  },

  createDiaryEntry: (
    token: string,
    data: { date: string; title?: string; content: string; mood?: string }
  ) =>
    request<import('@/types').DiaryEntry>('/diary', { method: 'POST', data }, token),

  updateDiaryEntry: (
    token: string,
    id: string,
    data: Record<string, unknown>
  ) =>
    request<import('@/types').DiaryEntry>(
      `/diary/${id}`,
      { method: 'PUT', data },
      token
    ),

  deleteDiaryEntry: (token: string, id: string) =>
    request<{ message: string }>(`/diary/${id}`, { method: 'DELETE' }, token),

  getExpenses: (
    token: string,
    params?: { month?: string; start?: string; end?: string }
  ) => {
    const search = new URLSearchParams();
    if (params?.month) search.set('month', params.month);
    if (params?.start) search.set('start', params.start);
    if (params?.end) search.set('end', params.end);
    const q = search.toString() ? `?${search.toString()}` : '';
    return request<import('@/types').ExpenseSummary>(`/expenses${q}`, {}, token);
  },

  createExpense: (token: string, data: Record<string, unknown>) =>
    request<import('@/types').Expense>('/expenses', { method: 'POST', data }, token),

  updateExpense: (token: string, id: string, data: Record<string, unknown>) =>
    request<import('@/types').Expense>(
      `/expenses/${id}`,
      { method: 'PUT', data },
      token
    ),

  deleteExpense: (token: string, id: string) =>
    request<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' }, token),
};

export { ApiError, API_URL };
