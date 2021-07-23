function includeHTML() {
  return new Promise(function (resolve, reject) {
    var z, i, p, u;
    u = p = 0;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      let elmnt, file;
      elmnt = z[i];
      file = elmnt.getAttribute("include-html");
      if (file) {
        p++;
        let xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4) {
            if (this.status == 200) { elmnt.innerHTML = this.responseText; }
            if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
            elmnt.removeAttribute("include-html");
            u++;
            if (p == u) resolve()
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
      }
    }
    if (p == 0 && u == 0) { resolve() }
  })
}
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function deleteCookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function apiRequest(type, url, request) {
  return new Promise(function (resolve, reject) {
    var a = new XMLHttpRequest();
    a.open(type, url, true);
    a.setRequestHeader('Content-Type', 'application/json');
    a.send(request);
    a.onreadystatechange = function () {
      if (this.readyState != 4) return;

      if (this.status == 200) {
        resolve(this.responseText)
      }
    }
    a.onerror = function () {
      reject("a")
    }
  })
}

function escapeHtml(unsafe) {
  return unsafe.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function shake(id){
  let style = document.createElement('style');
  style.innerHTML = '\t@keyframes shake {\n' +
      '\t\t10%, 90% {\n' +
      '\t\t\ttransform: translate3d(-1px, 0, 0);\n' +
      '\t\t}\n' +
      '\n' +
      '\t\t20%, 80% {\n' +
      '\t\t\ttransform: translate3d(2px, 0, 0);\n' +
      '\t\t}\n' +
      '\n' +
      '\t\t30%, 50%, 70% {\n' +
      '\t\t\ttransform: translate3d(-4px, 0, 0);\n' +
      '\t\t}\n' +
      '\n' +
      '\t\t40%, 60% {\n' +
      '\t\t\ttransform: translate3d(4px, 0, 0);\n' +
      '\t\t}\n' +
      '\t}'
  const ref = document.querySelector('script');
  ref.parentNode.insertBefore(style, ref);

  const a = document.getElementById(id)
  a.style.animation = "shake 1s infinite";
  setTimeout(function(){a.style.animation = 0;},1000)
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    callback(true)
  } catch (err) {
    callback(err)
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text, callback) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text,callback);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    callback(true)
  }, function(err) {
    callback(err)
  });
}

function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
}
RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
}
RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
}
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
}
