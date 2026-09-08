const path = require('node:path');

function bloggerPaths(root) {
  const privateRoot = path.join(root, '.blogger-artifacts');

  return {
    privateRoot,
    oauthClient: path.join(privateRoot, 'oauth-client.json'),
    token: path.join(privateRoot, 'token.json'),
    blogUrl: 'https://goldpick-choice.blogspot.com/',
  };
}

module.exports = { bloggerPaths };
