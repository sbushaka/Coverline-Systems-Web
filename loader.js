(function () {
  var scriptTag = document.currentScript;
  var clientSlug = scriptTag.getAttribute('data-client');

  if (!clientSlug) {
    console.error('Coverline loader: missing data-client attribute.');
    return;
  }

  var SUPABASE_URL = 'https://vixkbdginwpxllimdapg.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_5nZZ8DLB-aKR_tbPG9yzNA_mz_ueEQn';

  fetch(
    SUPABASE_URL + '/rest/v1/client_configs?client_slug=eq.' + encodeURIComponent(clientSlug) + '&select=*',
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY
      }
    }
  )
    .then(function (res) { return res.json(); })
    .then(function (rows) {
      if (!rows || !rows[0]) {
        console.warn('Coverline loader: no config found for client "' + clientSlug + '".');
        return;
      }
      var config = rows[0];
      if (config.chatbot_enabled && config.chatbot_webhook_url) {
        loadChatWidget(config);
      }
    })
    .catch(function (err) {
      console.error('Coverline loader error:', err);
    });

  function loadChatWidget(config) {
    var styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
    document.head.appendChild(styleLink);

    var initialMessages = config.chatbot_initial_messages || ['Hi! How can I help?'];

    var chatScript = document.createElement('script');
    chatScript.type = 'module';
    chatScript.textContent =
      "import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';" +
      'createChat({' +
      "webhookUrl: '" + config.chatbot_webhook_url + "'," +
      "mode: 'window'," +
      'initialMessages: ' + JSON.stringify(initialMessages) +
      '});';
    document.body.appendChild(chatScript);
  }
})();
