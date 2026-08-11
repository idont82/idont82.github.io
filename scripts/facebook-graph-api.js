const fs = require('node:fs');

class GraphApiError extends Error {
  constructor(message, { status = 0, code = null, transient = false } = {}) {
    super(message);
    this.name = 'GraphApiError';
    this.status = status;
    this.code = code;
    this.transient = transient;
  }
}

class FacebookGraphClient {
  constructor({
    pageId,
    token,
    version,
    fetchImpl = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  }) {
    if (!pageId || !token || !version) {
      throw new Error('META_PAGE_ID, META_PAGE_ACCESS_TOKEN and META_GRAPH_VERSION are required');
    }
    this.pageId = pageId;
    this.token = token;
    this.version = version;
    this.fetch = fetchImpl;
    this.sleep = sleep;
    this.base = `https://graph.facebook.com/${version}`;
  }

  safeMessage(message, status) {
    const fallback = `Facebook API HTTP ${status}`;
    if (typeof message !== 'string' || !message.trim()) return fallback;
    return message.split(this.token).join('[redacted]');
  }

  pathWithQuery(path, values) {
    const query = new URLSearchParams(values);
    return `${path}?${query}`;
  }

  async request(path, options = {}) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      let response;
      try {
        response = await this.fetch(`${this.base}${path}`, options);
      } catch (error) {
        if (attempt === 3) {
          throw new GraphApiError('Facebook network request failed', { transient: true });
        }
        await this.sleep(250 * (2 ** (attempt - 1)));
        continue;
      }

      const body = await response.json().catch(() => ({}));
      if (response.ok) return body;
      const transient = response.status === 429 || response.status >= 500;
      if (transient && attempt < 3) {
        await this.sleep(250 * (2 ** (attempt - 1)));
        continue;
      }
      throw new GraphApiError(this.safeMessage(body.error?.message, response.status), {
        status: response.status,
        code: body.error?.code ?? null,
        transient,
      });
    }
    throw new GraphApiError('Facebook retry loop exhausted', { transient: true });
  }

  async listRecentPosts() {
    const path = this.pathWithQuery(`/${this.pageId}/published_posts`, {
      fields: 'id,message,permalink_url,created_time',
      limit: '50',
      access_token: this.token,
    });
    const body = await this.request(path);
    return Array.isArray(body.data) ? body.data : [];
  }

  async findDuplicate(marker) {
    const posts = await this.listRecentPosts();
    return posts.find((post) => typeof post.message === 'string' && post.message.includes(marker)) || null;
  }

  async uploadPhoto(file) {
    const form = new FormData();
    form.set('source', new Blob([fs.readFileSync(file)], { type: 'image/png' }), 'card.png');
    form.set('published', 'false');
    form.set('access_token', this.token);
    const body = await this.request(`/${this.pageId}/photos`, {
      method: 'POST',
      body: form,
    });
    return body.id;
  }

  async deleteObject(id) {
    try {
      await this.request(this.pathWithQuery(`/${id}`, { access_token: this.token }), {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async publishCarousel({ files, message }) {
    const photoIds = [];
    try {
      for (const file of files) {
        photoIds.push(await this.uploadPhoto(file));
      }
      const form = new FormData();
      form.set('message', message);
      form.set('access_token', this.token);
      photoIds.forEach((id, index) => {
        form.set(`attached_media[${index}]`, JSON.stringify({ media_fbid: id }));
      });
      const published = await this.request(`/${this.pageId}/feed`, {
        method: 'POST',
        body: form,
      });
      return this.getPost(published.id);
    } catch (error) {
      for (const id of photoIds) await this.deleteObject(id);
      throw error;
    }
  }

  getPost(id) {
    return this.request(this.pathWithQuery(`/${id}`, {
      fields: 'id,permalink_url,message',
      access_token: this.token,
    }));
  }

  getInsight(postId, metric) {
    return this.request(this.pathWithQuery(`/${postId}/insights`, {
      metric,
      access_token: this.token,
    }));
  }
}

module.exports = { FacebookGraphClient, GraphApiError };
