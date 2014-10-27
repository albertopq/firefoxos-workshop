
var app = {
  QUERY_URL: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20tumblr.posts%20where%20username%3D"benlowy"&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=',
  MAX_IMAGES: 20,
  selectors: {
    listView: '#list-view',
    imageList: '#image-list',
    displayView: '#display-view',
    searchButton: '#search-button',
    imagesContainer: '#images-container',
    imageContainer: '#image-container',
    filtersSelector: '#filters-selector',
    back: '#back'
  },
  elements: {},

  init: function() {
    Object.keys(app.selectors).forEach(function(key) {
      var selector = app.selectors[key];
      app.elements[key] = document.querySelector(selector);
    });
    app.displayList();
    app.elements.back.addEventListener('click', app._goBack);
    app.elements.filtersSelector.addEventListener('change', function(evt) {
      app.elements.imageContainer.className = evt.target.value;
    });
  },

  displayList: function() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        app._parseFeed(request.responseText);
      }
    };
    request.open('GET', app.QUERY_URL, true);
    request.send();
  },

  displayImage: function(evt) {
    var image = evt.target.cloneNode();
    app.elements.imageContainer.innerHTML = '';
    app.elements.imageContainer.appendChild(image);
    app.elements.displayView.removeAttribute('hidden');
    app.elements.listView.hidden = true;
  },

  _parseFeed: function(feed) {
    var images = JSON.parse(feed).query.results.posts.post;
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

    var photoUrl = image['photo-url'][0].content;
    var li = document.createElement('li');
    var img = document.createElement('img');
    img.src = photoUrl;
    img.onclick = app.displayImage;
    li.appendChild(img);
    return li;
  },

  _goBack: function() {
    app.elements.listView.removeAttribute('hidden');
    app.elements.displayView.hidden = true;
  }
};

window.addEventListener('load', app.init);
