/*
 * Wraps all frontend API clients and session-aware request helpers.
 */

const API_BASE_URL = '';

/**
 * Handles low-level HTTP requests, token injection, and response normalization.
 */
class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.token = localStorage.getItem('token');
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getToken() {
        return this.token || localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok || data.code !== 0) {
                if (response.status === 401 || data.code === 401) {
                    this.setToken(null);
                    throw new ApiError('登录已过期', 401, data);
                }

                const errMsg = data.msg || '请求失败';
                throw new ApiError(errMsg, response.status, data);
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.code === 401) {
                    return Promise.reject(error);
                }
                throw error;
            }
            // 移除全局Toast弹窗，让控制器自己处理降级逻辑
            throw new ApiError('网络错误，请检查网络连接', 0, error);
        }
    }

    getCacheKey(endpoint, params = {}) {
        return `${endpoint}?${JSON.stringify(params)}`;
    }

    get(endpoint, params = {}, useCache = true) {
        const cacheKey = this.getCacheKey(endpoint, params);
        
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return Promise.resolve(cached.data);
            }
        }

        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, { method: 'GET' })
            .then(data => {
                if (useCache) {
                    this.cache.set(cacheKey, { data, timestamp: Date.now() });
                }
                return data;
            });
    }

    post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    clearCache() {
        this.cache.clear();
    }
}

/**
 * Captures API and network failures in a single frontend error shape.
 */
class ApiError extends Error {
    constructor(message, code, data = null) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.data = data;
    }
}

/**
 * Wraps frontend authentication flows and local session storage.
 */
class AuthService {
    constructor(apiService) {
        this.api = apiService;
    }

    async login(username, password) {
        const response = await this.api.post('/api/auth/login', { username, password });

        if (response.code === 0 && response.data.token) {
            this.api.setToken(response.data.token);

            const user = {
                id: response.data.userId,
                username: response.data.username,
                email: response.data.email,
                avatar: response.data.avatar,
                level: response.data.level,
                totalListening: response.data.totalListening,
                masteredCount: response.data.masteredCount,
                demo: false
            };

            localStorage.setItem('user', JSON.stringify(user));
        }

        return response;
    }

    async register(username, email, password) {
        const response = await this.api.post('/api/auth/register', { username, email, password });

        if (response.code === 0 && response.data.token) {
            this.api.setToken(response.data.token);

            const user = {
                id: response.data.userId,
                username: response.data.username,
                email: response.data.email,
                avatar: response.data.avatar,
                level: response.data.level,
                totalListening: response.data.totalListening,
                masteredCount: response.data.masteredCount,
                demo: false
            };

            localStorage.setItem('user', JSON.stringify(user));
        }

        return response;
    }

    logout() {
        try {
            this.api.post('/api/auth/logout', {});
        } catch (e) {
            console.warn('Logout API call failed:', e);
        }
        this.api.setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('settings');
        window.location.href = 'home.html';
    }

    isLoggedIn() {
        return !!this.api.getToken() && !!localStorage.getItem('user');
    }

    getUser() {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    }
}

/**
 * Requests listening lists, details, transcripts, and feedback APIs.
 */
class ListeningService {
    constructor(apiService) {
        this.api = apiService;
    }

    getList(params = {}) {
        return this.api.get('/api/listening/list', params);
    }

    getDetail(id) {
        return this.api.get(`/api/listening/detail/${id}`, {}, false);
    }

    getTranscript(id) {
        return this.api.get(`/api/listening/transcript/${id}`, {}, false);
    }

    submitFeedback(listeningId, lineNumber, status) {
        return this.api.post('/api/listening/feedback', { listeningId, lineNumber, status });
    }

    getListeningSet(year, month, level, setNumber, type = null) {
        const params = {};
        if (year != null) params.year = year;
        if (month != null) params.month = month;
        if (level != null) params.level = level;
        if (setNumber != null) params.setNumber = setNumber;
        if (type) params.type = type;
        return this.api.get('/api/listening/set', params, false);
    }
}

/**
 * Requests profile, collection, and learning-record APIs.
 */
class UserService {
    constructor(apiService) {
        this.api = apiService;
    }

    getLearningRecords(params = {}) {
        return this.api.get('/api/user/learning-records', params);
    }

    getCollections(params = {}) {
        return this.api.get('/api/user/collections', params);
    }

    addCollection(listeningId, title) {
        return this.api.post('/api/user/collections', { listeningId, title });
    }

    removeCollection(listeningId) {
        return this.api.delete(`/api/user/collections/${listeningId}`);
    }

    getProfile() {
        return this.api.get('/api/user/profile', {}, false);
    }

    updateProfile(data) {
        return this.api.put('/api/user/profile', data);
    }

    clearLearningRecords() {
        return this.api.delete('/api/user/learning-records');
    }
}

const apiService = new ApiService();
const authService = new AuthService(apiService);
const listeningService = new ListeningService(apiService);
const userService = new UserService(apiService);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiService, authService, listeningService, userService, ApiError };
}
