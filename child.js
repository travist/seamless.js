var connection = window.seamless.connect({
  container: 'div.content',
  allowStyleInjection: true
});

// Receive a message
connection.receive(function(data) {
  switch(data.type) {
    case 'setContent':
      if (data.hasOwnProperty('header')) {
        document.getElementsByTagName('h1')[0].innerHTML = data.header;
      }
      if (data.hasOwnProperty('image')) {
        document.getElementById('image').setAttribute('src', data.image);
      }
      break;
    case 'getContent':
      return {
        header: document.getElementsByTagName('h1')[0].textContent,
        image: document.getElementById('image').getAttribute('src')
      };
      break;
  }
});
