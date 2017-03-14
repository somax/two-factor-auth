const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const express = require('express');
const app = express();

const util = require('util');


// TODO 每个用户应保存一份独立的 secret 
// let secret = speakeasy.generateSecret({ length: 20 });
// util.log(secret); // secret of length 20

// 为测试方便，固定 secret
let secret = {
    ascii: 'n@!C*>xUrr^I#,],PV^P',
    hex: '6e4021432a3e785572725e49232c5d2c50565e50',
    base32: 'NZACCQZKHZ4FK4TSLZESGLC5FRIFMXSQ',
    otpauth_url: 'otpauth://totp/SecretKey?secret=NZACCQZKHZ4FK4TSLZESGLC5FRIFMXSQ'
};


function getQRDode(str, done) {
	QRCode.toDataURL(str, function(err, data_url) {
    let buffer = new Buffer(data_url.replace(/^data:image\/png;base64,/, ""), 'base64');
    done(buffer);
});
}

app.get('/', (req, res) => {
    res.send('<img src="/qrcode.png"/><span>' + secret.otpauth_url + '</span>')
})

app.get('/qrcode.png', (req, res) => {
	getQRDode(secret.otpauth_url,function done(buffer) {
		res.type('png')
	        .send(buffer)
	})
})

app.get('/token', (req, res) => {
    let token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
    });

    res.send(token);
})

app.get('/verify', (req, res) => {

    let userToken = req.query.token; // Verify the token the user gives

    let verified = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: userToken,
        window: 1 // 允许前后 30秒 有效
    });

    util.log('验证码', userToken, verified ? '有' : '无', '效')
    res.send('verified: ' + verified);
})

app.listen(8888, () => {
    util.log('访问 http://0.0.0.0:8888 获取二维码');
})
