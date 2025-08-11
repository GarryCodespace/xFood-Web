import { apiService } from './api';

// User/Auth entity
export const User = {
  me: async () => {
    return apiService.get('/auth/me');
  },

  update: async (userData) => {
    return apiService.put('/auth/me', userData);
  },

  delete: async () => {
    return apiService.delete('/auth/me');
  }
};

// Recipe entity
export const Recipe = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/recipes?${queryString}`);
  },

  filter: async (filters = {}, orderBy = null) => {
    const params = { ...filters };
    if (orderBy) {
      params.order_by = orderBy;
    }
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/recipes?${queryString}`);
  },

  get: async (id) => {
    return apiService.get(`/recipes/${id}`);
  },

  create: async (recipeData) => {
    return apiService.post('/recipes', recipeData);
  },

  update: async (id, recipeData) => {
    return apiService.put(`/recipes/${id}`, recipeData);
  },

  delete: async (id) => {
    return apiService.delete(`/recipes/${id}`);
  }
};

// Bake entity
export const Bake = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/bakes?${queryString}`);
  },

  filter: async (filters = {}, orderBy = null) => {
    const params = { ...filters };
    if (orderBy) {
      params.order_by = orderBy;
    }
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/bakes?${queryString}`);
  },

  get: async (id) => {
    return apiService.get(`/bakes/${id}`);
  },

  create: async (bakeData) => {
    return apiService.post('/bakes', bakeData);
  },

  update: async (id, bakeData) => {
    return apiService.put(`/bakes/${id}`, bakeData);
  },

  delete: async (id) => {
    return apiService.delete(`/bakes/${id}`);
  }
};

// Circle entity
export const Circle = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/circles?${queryString}`);
  },

  get: async (id) => {
    return apiService.get(`/circles/${id}`);
  },

  create: async (circleData) => {
    return apiService.post('/circles', circleData);
  },

  update: async (id, circleData) => {
    return apiService.put(`/circles/${id}`, circleData);
  },

  delete: async (id) => {
    return apiService.delete(`/circles/${id}`);
  },

  join: async (id) => {
    return apiService.post(`/circles/${id}/join`);
  },

  leave: async (id) => {
    return apiService.post(`/circles/${id}/leave`);
  }
};

// Comment entity
export const Comment = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/comments?${queryString}`);
  },

  filter: async (filters = {}, orderBy = null) => {
    const params = { ...filters };
    if (orderBy) {
      params.order_by = orderBy;
    }
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/comments?${queryString}`);
  },

  get: async (id) => {
    return apiService.get(`/comments/${id}`);
  },

  create: async (commentData) => {
    return apiService.post('/comments', commentData);
  },

  update: async (id, commentData) => {
    return apiService.put(`/comments/${id}`, commentData);
  },

  delete: async (id) => {
    return apiService.delete(`/comments/${id}`);
  }
};

// Like entity
export const Like = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/likes?${queryString}`);
  },

  filter: async (filters = {}, orderBy = null) => {
    const params = { ...filters };
    if (orderBy) {
      params.order_by = orderBy;
    }
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/likes?${queryString}`);
  },

  create: async (likeData) => {
    return apiService.post('/likes', likeData);
  },

  delete: async (id) => {
    return apiService.delete(`/likes/${id}`);
  },

  toggle: async (targetType, targetId) => {
    return apiService.post('/likes/toggle', { target_type: targetType, target_id: targetId });
  }
};

// Review entity
export const Review = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/reviews?${queryString}`);
  },

  get: async (id) => {
    return apiService.get(`/reviews/${id}`);
  },

  create: async (reviewData) => {
    return apiService.post('/reviews', reviewData);
  },

  update: async (id, reviewData) => {
    return apiService.put(`/reviews/${id}`, reviewData);
  },

  delete: async (id) => {
    return apiService.delete(`/reviews/${id}`);
  }
};

// Message entity
export const Message = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/messages?${queryString}`);
  },

  filter: async (filters = {}, orderBy = null) => {
    const params = { ...filters };
    if (orderBy) {
      params.order_by = orderBy;
    }
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/messages?${queryString}`);
  },

  get: async (id) => {
    return apiService.get(`/messages/${id}`);
  },

  create: async (messageData) => {
    return apiService.post('/messages', messageData);
  },

  update: async (id, messageData) => {
    return apiService.put(`/messages/${id}`, messageData);
  },

  delete: async (id) => {
    return apiService.delete(`/messages/${id}`);
  }
};

// Notification entity
export const Notification = {
  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/notifications?${queryString}`);
  },

  markAsRead: async (id) => {
    return apiService.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiService.post('/notifications/mark-all-read');
  }
};
