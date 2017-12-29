var mongoose = require('mongoose');
var Nightmare = require('nightmare');
var _ = require('lodash');
var request = require('request');
var wait = require('nightmare-wait-for-url');
var config = require('./config');
var mpromise = require('mpromise')
var co = require('co')
var available = require('./models/available.js');
var util = require('util');
var Token = require('./models/token.js');
var deasync = require('deasync');
var sync = require('sync');
var fs = require('fs');
const uuidV1 = require('uuid/v1');
var sleep = require('sleep');

var Schema = mongoose.Schema;
var mongoDB_URL = config.mongoDB_URL;

mongoose.connect(config.mongoDB_URL, {
  useMongoClient: true
});

/*
setInterval(function(){
  Token.findOne({ 'really.sofar': 'nyess' }, 'token createdAt', function (err, tokens) {
    console.log(tokens['token']);
  });
   }, 3000);
*/

function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

var done5 = false;

var firstName = config.firstName;
var lastName = config.lastName;
var firstAddress = config.firstAddress;
var secondAddress = config.secondAddress;
var city = config.city;
var zip = config.zip;
var phone = config.phone;
var email = config.email;
var pid = config.pid;
var sizes = config.sizes;
var bday = config.bday;
var bmonth = config.bmonth;
var byear = config.byear;
var ssn = config.ssn;

function cookieTransform(cookies) {
    var updated = [];
    _.forEach(cookies, function (cookie) {
        var url = '';
        if (cookie.secure) {
            url += 'https://';
        } else {
            url += 'http://';
        }

        if (cookie.domain.startsWith('.')) {
            url += 'www';
        }

        url += cookie.domain;

        updated.push(_.assign({url: url}, _.omit(cookie, 'domain')))
    });

    return updated;
}

Nightmare.action('show',
    function (name, options, parent, win, renderer, done) {
        parent.respondTo('show', function (done) {
            win.show();
            done();
        });
        done();
    },
    function (done) {
        this.child.call('show', done);
    });

Nightmare.action('hide',
    function (name, options, parent, win, renderer, done) {
        parent.respondTo('hide', function (done) {
            win.hide();
            done();
        });
        done();
    },
    function (done) {
        this.child.call('hide', done);
    });


Nightmare.action('clearCache',
    function (name, options, parent, win, renderer, done) {
        parent.respondTo('clearCache', function (done) {
            win.webContents.session.clearCache(done);
            done();

        });
        done();
    },
    function (done) {
        this.child.call('clearCache', done);
    });


Nightmare.action('printUserAgent',
    function (name, options, parent, win, renderer, done) {
        parent.respondTo('printUserAgent', function (done) {
            done(null, win.webContents.getUserAgent());
        });
        done();
    },
    function (done) {
        this.child.call('printUserAgent', done);
    });

Nightmare.action('keepTitle',
    function (name, options, parent, win, renderer, done) {
        parent.respondTo('keepTitle', function (done) {
            win.on('page-title-updated', function (event) {
                event.preventDefault()
            });
            done();
        });
        done();
    },
    function (done) {
        this.child.call('keepTitle', done);
    });

Nightmare.action('getSizes', function(done) {
  this.evaluate_now(() => {
    var myArr = [];
    $("#buy-block > div.buy-block-header > div.rbk-rounded-block > div.add-product-block > form > div.clearfix.size-qty-container > div.size-dropdown-block > div > div > div > div.ffSelectMenuMidBG > div > ul > li > span").each(function() {
        myArr.push($(this).attr('data-val'));
    });
    var item = myArr[Math.floor(Math.random()*myArr.length)];
    var element = ('#buy-block > div.buy-block-header > div.rbk-rounded-block > div.add-product-block > form > div.clearfix.size-qty-container > div.size-dropdown-block > div > div > div > div.ffSelectMenuMidBG > div > ul > li  > span[data-val*="'+item+'"]');
    document.querySelector(element).click();
  }, done)
})
var sync = true;

var passed = config.passedCookies;

getToken = function (callback){
      var data = '';
          Token.findOne({ 'really.sofar': 'nyess' }, 'token', function(err, success){
                 if (!success){
                   //sync = true; //if using tokens
                   sync = false; //no tokens needed
                 }else{
                   data = success["token"];
                   var querys = { 'token': data};
                   Token.findOneAndUpdate(querys, { $set: { 'really.sofar': 'reserved' }}, callback);
                   sync = false;
                 }
                 callback && callback(data);
             });
             while(sync) {require('deasync').sleep(100);}
        }
var test = true;
var port = 29001;
var completed = 0;
var running = 0;
console.log("Launching");
var timesRan = 0;
setInterval(function(){
console.log("Running "+running+" instances")
var reallyNeeded = config.instances - running;
var instancesArr = new Array(reallyNeeded);
if (reallyNeeded >= 0 && running != 10) {
_.each(instancesArr, function (browser, i) {
  ++timesRan;
  ++running;
  var uniqueIdentifier = uuidV1();
  console.log("Starting instance "+ i)
  console.log("Using proxy port "+port)
  console.log("This instance's unique identifier is "+uniqueIdentifier)
  console.log("We are now running "+running+" instances")
  test = "yes"+i;
  getToken(function(data) {

  if (test == "yes"+i++) {
    var theToken = data;
    test = false;
    instancesArr[i] = Nightmare({
        show: true,
        alwaysOnTop: false,
        webPreferences: {
            partition: i
        },
        waitTimeout: 15000,
        typeInterval: 55,
      // openDevTools: {
    //mode: 'detach'
  //},
  switches: {
  //'proxy-server': config.proxy+':'+port,
  'ignore-certificate-errors': true
},
        executionTimeout: 5000
    })
    .useragent(config.userAgent)
        .cookies.clearAll()
        .clearCache()
        .cookies.set(cookieTransform(passed));

        instancesArr[i]
        //.goto('https://www.iplocation.net')
        //.wait(1000)
        .goto(config.url+pid)
        .wait()
        .goto(config.url+pid)
        .inject('js', './models/jquery-3.2.1.min.js')
        .inject('js', './models/sleep.js')
        .wait('#buy-block > div.buy-block-header > div.rbk-rounded-block > div.add-product-block > form > div.clearfix.size-qty-container > div.size-dropdown-block > div > div > a')
        .click("#buy-block > div.buy-block-header > div.rbk-rounded-block > div.add-product-block > form > div.clearfix.size-qty-container > div.size-dropdown-block > div > div > a")
        .getSizes()
        .wait(60000)
        .evaluate(function(theToken){
          console.log("attempting to insert "+theToken);
          //await sleep(2000);
          document.getElementById("g-recaptcha-response").innerHTML = theToken;
        }, theToken)
        .click('#buy-block > div.buy-block-header > div.rbk-rounded-block > div.add-product-block > form > div.addtocart.rbk-shadow-block.clearfix.vmargin20 > div > div > button') //no wish list
        //.click('#buy-block > div.buy-block-header > div.rbk-rounded-block > div.add-product-block > form > div.addtocart.rbk-shadow-block.clearfix.vmargin20 > div > div.add-to-cart-container.wishlist-enabled > button') //with wishlist
        //Some shoes have wishlist enabled, usually limited releases with captcha don't.
        //.inject('js', './models/js.cookie.js')
        .wait('#minicart > .minicart-notempty')
        //.cookies.get()
        //.end()
        //.then((cookies) => {
        //  console.log(cookies);
        //  var theCookies = cookies;
        //  fs.writeFile('./data/'+uniqueIdentifier+'.txt', cookies, function (err) {
        //    if (err) throw err;
        //  });
        //})
        //adidas acc generator to put cart into acc
        .goto('https://www.adidas.se/on/demandware.store/Sites-adidas-SE-Site/sv_SE/CODelivery-Start')
        .type('#dwfrm_shipping_shiptoaddress_shippingAddress_firstName', firstName)
        .type('#dwfrm_shipping_shiptoaddress_shippingAddress_lastName', lastName)
        .type('#dwfrm_shipping_shiptoaddress_shippingAddress_address1', firstAddress)
        .type('#dwfrm_shipping_shiptoaddress_shippingAddress_address2', secondAddress)
        .type('#dwfrm_shipping_shiptoaddress_shippingAddress_city', city)
        .type('#dwfrm_shipping_shiptoaddress_shippingAddress_postalCode', zip)
        .type('#dwfrm_shipping_shiptoaddress_shippingAddress_phone', phone)
        .type('#dwfrm_shipping_email_emailAddress', email)
        .click("#shippingForm > div:nth-child(5) > ng-form > div.co-delivery-actions.clear.clearfix > div > button")
        .wait('#content > div > div.payment-section.col-8 > div.outer-payment-submit > div > button')
        .click("#content > div > div.payment-section.col-8 > div.outer-payment-submit  > div > button")
        .wait('#mainSubmit')
        .type('#klarna\\.shopper\\.dateOfBirthYear', byear)
        .type('#klarna\\.shopper\\.dateOfBirthMonth', bmonth)
        .type('#klarna\\.shopper\\.dateOfBirthDayOfMonth', bday)
        .type('#klarna\\.shopper\\.socialSecurityNumber', ssn)
        .type('#klarna\\.shopper\\.telephoneNumber', '')
        .type('#klarna\\.shopper\\.telephoneNumber', phone)
        .wait(60000)
        .click('#mainSubmit')
        .end()
        .then(function () {
          --running;
          ++completed;
          var uidcookiespath = './data/'+uniqueIdentifier+'.txt';
          if (fs.existsSync(uidcookiespath)) {
          move('./data/'+uniqueIdentifier+'.txt', './data/succeeded'+uniqueIdentifier+'.txt', function (err) {
            if (err) throw err;
          });
          console.log("Moved cookies to succeded folder")
        }
          console.log("Instance "+i+" succeeded")
          console.log("We have placed a total of "+completed+" orders")
            //party(instancesArr[i], i);
        })
        .catch(function (error) {
          var querys = { 'token': data};
          Token.findOneAndUpdate(querys, { $set: { 'really.sofar': 'nyess' }}, callback);
            --running;
            var uidcookiespath = './data/'+uniqueIdentifier+'.txt';
            console.log("Instance "+i+" has failed")
            console.log("We have "+running+" instances running." )
            if (fs.existsSync(uidcookiespath)) {
              console.log('Cookies exists for this instance')
              move('./data/'+uniqueIdentifier+'.txt', './data/failed'+uniqueIdentifier+'.txt', function (err) {
                if (err) throw err;
              });
              console.log("Moved cookies to failed folder")
            }
            console.error('an error has occurred: ' + error);
            console.error(util.inspect(error));
            instancesArr[i].end();
        });
  }
});

  while(test) {require('deasync').sleep(250);}
  ++port;
  if (port == 29021) {
    port = 29001;
  }
});
}
}, 1000);

function handleError(errorAfterCarting) {
	nightmare.end().then();

	var message;
	if(typeof error.details != "undefined" && error.details != "") {
		message = error.details;
	} else if(typeof error == "string") {
		message = error;

		if(error == "Cannot read property 'focus' of null") {
			message += " (Likely because a non-existent selector was used)";
		}
	} else {
		message = error.message;
	}
	console.error({"status": "error", "message": message});
}
require('deasync').loopWhile(function(){return !done5;});
