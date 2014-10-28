
var app = {
  QUERY_URL: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20tumblr.posts%20where%20username%3D"benlowy"&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=app._parseFeed',
  MAX_IMAGES: 20,
  inActivity: false,
  activityRequest: null,
  selectors: {
    listView: '#list-view',
    imageList: '#image-list',
    displayView: '#display-view',
    searchButton: '#search-button',
    imagesContainer: '#images-container',
    imageContainer: '#image-container',
    filtersSelector: '#filters-selector',
    back: '#back',
    closeActivity: '#close-activity'
  },
  elements: {},

  init: function() {
    Object.keys(app.selectors).forEach(function(key) {
      var selector = app.selectors[key];
      app.elements[key] = document.querySelector(selector);
    });
    app.displayList();
    app.elements.back.addEventListener('click', app._goBack);
    app.elements.closeActivity.addEventListener('click', function() {
      app.activityRequest.postError('Acitity canceled');
    });
    app.elements.filtersSelector.addEventListener('change', function(evt) {
      app.elements.imageContainer.className = evt.target.value;
    });
    app._triggerNotification();
  },

  displayList: function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = app.QUERY_URL;
    document.head.appendChild(script);
  },

  displayImage: function(evt) {
    var image = evt.target.cloneNode();
    app.elements.imageContainer.innerHTML = '';
    app.elements.imageContainer.appendChild(image);
    app.elements.displayView.removeAttribute('hidden');
    app.elements.listView.hidden = true;
  },

  handleActivity: function(activityRequest) {
    app.inActivity = true;
    app.activityRequest = activityRequest;
    app.elements.closeActivity.removeAttribute('hidden');
  },

  _triggerNotification: function() {
    var notification = new Notification('Hey, you just opened the app!');
  },

  _parseFeed: function(feed) {
    var images = feed.query.results.posts.post;
    for (var i = 0; i < app.MAX_IMAGES; i++) {
      var current = app._buildImage(images[i]);
      if (!current)
        return;
      app.elements.imagesContainer.appendChild(current);
    }
  },

  _buildImage: function(image) {
    if (!image['photo-url'])
      return;

    var photoUrl = image['photo-url'][2].content;
    var li = document.createElement('li');
    var img = document.createElement('img');
    img.src = photoUrl;
    img.className = 'photo';
    img.onclick = function(evt) {
      if (app.inActivity) {
        app._returnBlob(img);
        // app.inActivity = false;
      } else {
        app.displayImage(evt);
      }
    };
    li.appendChild(img);
    return li;
  },

  _returnBlob: function(img) {
    var x = new XMLHttpRequest();
    x.open('GET', img.src);
    x.responseType = 'blob';
    x.onload = function() {
      var file = x.response;
      app.activityRequest.postResult({
        blob: file
      });
    };
    x.send();
  },

  _goBack: function() {
    app.elements.listView.removeAttribute('hidden');
    app.elements.displayView.hidden = true;
  }
};

window.addEventListener('load', app.init);
if (navigator.mozSetMessageHandler) {
  navigator.mozSetMessageHandler('activity', app.handleActivity);
}

(function() {
  var defaultFontSize = 62.5;
  var defaultWidth = 320;
  var defaultHeight = 480;

  function scale() {
    var deviceWidth = window.innerWidth;
    var fontSize = defaultFontSize;

    //Check for non base width devices
    if (defaultWidth != deviceWidth) {
      var ratio = (deviceWidth / defaultWidth).toFixed(2);
      fontSize *= ratio;
    }

    document.documentElement.style.fontSize = fontSize.toFixed(2) + '%';
  };

  scale();
  window.addEventListener('resize', scale);
})();

