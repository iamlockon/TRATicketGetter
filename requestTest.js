/*
Adapted from :
https://ithelp.ithome.com.tw/articles/10194268
*/


const request = require('request').defaults({
  jar: true,
  headers: {
    cookie: 'NSC_BQQMF=ffffffffaf121a1e45525d5f4f58455e445a4a423660',
  }
})
const cheerio = require('cheerio');
const fs = require('fs');
const prompt = require('prompt');
const opn = require('opn');
const termImage = require('terminal-image');
const PERSON_ID = 'A000000000';
const FROM_STATION = '000';
const TO_STATION = '000';
const GETIN_DATE = '2019/00/00-00';
const TRAIN_NO = '000';
const QTY = '1';


(()=>{
	initCookie()
	  .then(()=>{
	  	return fillInfo();
	  })
	  .then(()=>{
  	    return getImg();
	  })
	  .then(async()=>{
	  	//console.log(await termImage.file('code.jpeg'));
	  	opn('code.jpeg');
	  })
	  .then(()=>{
	  	return getCodeFromConsole();
	  })
	  .then((code)=>{
	  	return takeOrder(code);
  	  })
	  .then((orderNumber) => {
	    console.log('訂位代號 => '+orderNumber);
	  })
	  .catch((err)=>{
	  	console.log("Failed....:", err);
	  });
})();

function takeOrder(code) {
	code = code.trim();
	return new Promise((done,reject) => {
	    var options = {
	      url: 'http://railway.hinet.net/Foreign/common/etno11.jsp',
	      method: 'POST',
	      form: {
			person_id: PERSON_ID,
			getin_date: GETIN_DATE,
			from_station: FROM_STATION,
			to_station: TO_STATION,
			train_no: TRAIN_NO,
			order_qty_str: QTY,
			returnTicket: '0',
			randInput: code,
			//language:'zh_TW',
		  },
	      headers: {
	      	Host: 'railway.hinet.net',
	        referer: 'http://railway.hinet.net/Foreign/common/check_etno1.jsp',
	      	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
	      },


	    }
	    request(options, (err, res, body) => {
	      //console.log(options.form.randInput);

	      if(err){
	      	console.log("Get ticket failed....: ", err);
	      }

	      let $ = cheerio.load(body);
	      //console.log($.html());
	      if($('#spanOrderCode').text()){
	      	done($('#spanOrderCode').text());
	      }else if($('div.alert.alert-danger')){
	      	reject("Get ticket failed....: "+ cheerio.text($('div.alert.alert-danger')));
	      }else{
	      	reject("Just failed...");
	      }
	    })
	  })
	
}
function initCookie() {
  return new Promise(done => {
    request('http://railway.hinet.net', (err, res, body) => {
      //console.log(res.headers);
      done();
    });
  });
}



function fillInfo(){
	const options = {
	  method:'POST',
	  url: 'http://railway.hinet.net/Foreign/common/check_etno1.jsp',
	  headers: {
		Referer: 'http://railway.hinet.net/Foreign/TW/etno1.html',
		Host: 'railway.hinet.net',
	  },
	  form:{
	  	person_id: PERSON_ID,
		getin_date: GETIN_DATE,
		from_station: FROM_STATION,
		to_station: TO_STATION,
		train_no: TRAIN_NO,
		order_qty_str: QTY,
	  	returnTicket: '0',
	  	//language:'zh_TW',
	  }
	};
	return new Promise((resolve)=>{
		request(options,(err,res, body)=>{
			resolve();
		});
	});
}
function getImg() {
	return new Promise((resolve)=>{
	    const opt = {
	      url: 'http://railway.hinet.net/ImageOut.jsp',
	      method: 'GET',
	      headers: {
	      	Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
	      	'Accept-Encoding': 'gzip, deflate',
	      	Connection: 'keep-alive',
	      	DNT: '1',
	      	Host: 'railway.hinet.net',
	      	Referer: 'http://railway.hinet.net/Foreign/common/check_etno1.jsp',
	      	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
	    	}
	    };
		request(opt).pipe(fs.createWriteStream('code.jpeg')).on('close', resolve);
	})
	    
}

function getCodeFromConsole() {
	return new Promise(resolve=>{
		prompt.start();
		prompt.get(['code'], (err,result)=>resolve(result.code));
	});
}