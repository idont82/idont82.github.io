const API_BASE = 'https://www.googleapis.com/blogger/v3';

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class BloggerClient {
  constructor({ token, fetchImpl = fetch, sleepImpl = delay }) {
    if (!token) {
      throw new Error('A Blogger access token is required.');
    }
    this.token = token;
    this.fetchImpl = fetchImpl;
    this.sleepImpl = sleepImpl;
  }

  async request(apiPath, options = {}) {
    const url = `${API_BASE}${apiPath}`;
    const headers = {
      accept: 'application/json',
      authorization: `Bearer ${this.token}`,
      ...options.headers,
    };
    if (options.body !== undefined) {
      headers['content-type'] = 'application/json';
    }

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      let response;
      try {
        response = await this.fetchImpl(url, {
          ...options,
          headers,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
        });
      } catch (error) {
        if (attempt === 3) {
          throw new Error(`Blogger API network request failed: ${error.name || 'network error'}`);
        }
        await this.sleepImpl(250 * (2 ** (attempt - 1)));
        continue;
      }

      if (response.ok) {
        if (response.status === 204) {
          return null;
        }
        return response.json();
      }

      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && attempt < 3) {
        await this.sleepImpl(250 * (2 ** (attempt - 1)));
        continue;
      }
      throw new Error(`Blogger API request failed: HTTP ${response.status}`);
    }

    throw new Error('Blogger API request failed after retries.');
  }

  getBlogByUrl(url) {
    return this.request(`/blogs/byurl?url=${encodeURIComponent(url)}`);
  }

  async listPosts(blogId) {
    const result = await this.request(`/blogs/${encodeURIComponent(blogId)}/posts?maxResults=50&fetchBodies=true`);
    return Array.isArray(result.items) ? result.items : [];
  }

  insertPost(blogId, post) {
    return this.request(`/blogs/${encodeURIComponent(blogId)}/posts?isDraft=false`, {
      method: 'POST',
      body: post,
    });
  }

  updatePost(blogId, postId, post) {
    return this.request(`/blogs/${encodeURIComponent(blogId)}/posts/${encodeURIComponent(postId)}`, {
      method: 'PUT',
      body: post,
    });
  }

  getPost(blogId, postId) {
    return this.request(`/blogs/${encodeURIComponent(blogId)}/posts/${encodeURIComponent(postId)}?fetchBody=true`);
  }
}

module.exports = { BloggerClient };
