import { Service, Inject } from 'typedi';
import winston from 'winston';
import config from '../config';
import got from 'got';
import DataStore from 'nedb';

@Service()
export default class QRCodeService {
  private cronDb = new DataStore({ filename: config.cookieDbFile });
  private s_token = undefined;
  private cookies = undefined;
  private guid = undefined;
  private lsid = undefined;
  private lstoken = undefined;
  private okl_token = undefined;
  private token = undefined;
  private userCookie = "";
  constructor(@Inject('logger') private logger: winston.Logger) {
    this.cronDb.loadDatabase((err) => {
      if (err) throw err;
    });
  }

  private praseSetCookies(response){
    this.s_token = response.body.s_token
    this.guid = response.headers['set-cookie'][0]
    this.guid = this.guid.substring(this.guid.indexOf("=") + 1, this.guid.indexOf(";"))
    this.lsid = response.headers['set-cookie'][2]
    this.lsid = this.lsid.substring(this.lsid.indexOf("=") + 1, this.lsid.indexOf(";"))
    this.lstoken = response.headers['set-cookie'][3]
    this.lstoken = this.lstoken.substring(this.lstoken.indexOf("=") + 1, this.lstoken.indexOf(";"))
    this.cookies = "guid=" + this.guid + "; lang=chs; lsid=" + this.lsid + "; lstoken=" + this.lstoken + "; "
  }
  private getCookie(response){
    var TrackerID = response.headers['set-cookie'][0]
    TrackerID = TrackerID.substring(TrackerID.indexOf("=") + 1, TrackerID.indexOf(";"))
    var pt_key = response.headers['set-cookie'][1]
    pt_key = pt_key.substring(pt_key.indexOf("=") + 1, pt_key.indexOf(";"))
    var pt_pin = response.headers['set-cookie'][2]
    pt_pin = pt_pin.substring(pt_pin.indexOf("=") + 1, pt_pin.indexOf(";"))
    var pt_token = response.headers['set-cookie'][3]
    pt_token = pt_token.substring(pt_token.indexOf("=") + 1, pt_token.indexOf(";"))
    var pwdt_id = response.headers['set-cookie'][4]
    pwdt_id = pwdt_id.substring(pwdt_id.indexOf("=") + 1, pwdt_id.indexOf(";"))
    var s_key = response.headers['set-cookie'][5]
    s_key = s_key.substring(s_key.indexOf("=") + 1, s_key.indexOf(";"))
    var s_pin = response.headers['set-cookie'][6]
    s_pin = s_pin.substring(s_pin.indexOf("=") + 1, s_pin.indexOf(";"))
    this.cookies = "TrackerID=" + TrackerID + "; pt_key=" + pt_key + "; pt_pin=" + pt_pin + "; pt_token=" + pt_token + "; pwdt_id=" + pwdt_id + "; s_key=" + s_key + "; s_pin=" + s_pin + "; wq_skey="
    var userCookie = "pt_key=" + pt_key + ";pt_pin=" + pt_pin + ";";
    console.log("\n############  登录成功，获取到 Cookie  #############\n\n");
    console.log('Cookie1="' + userCookie + '"\n');
    console.log("\n####################################################\n\n");
    return userCookie;
  }
  
  private  randomString(e) {
      e = e || 32;
      let t = "abcdefhijkmnprstwxyz2345678", a = t.length, n = "";
      for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
      return n
  }
  private async step1(){
    try {
        this.token = ""
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/mm/new_login_entrance?lang=chs&appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport'
        const response = await got(url, {
            responseType: 'json',
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-cn',
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'User-Agent': `jdapp;android;10.0.6;6.0;${randomString(40)};network/wifi;model/MI 5;addressid/137981279;aid/372fc46cc36d1ea6;oaid/;osVer/23;appBuild/88829;partner/jingdong;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36`,
                'Host': 'plogin.m.jd.com'
            }
        });
        this.praseSetCookies(response)
    } catch (error) {
        this.cookies = "";
        console.log(error.response.body);
    }
  }

  private async step2(){
      try {
          if (this.cookies == "") {
              return 0
          }
          let timeStamp = (new Date()).getTime()
          let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauthreflogurl?s_token=' + this.s_token + '&v=' + timeStamp + '&remember=true'
          const response: any = await got.post(url, {
              responseType: 'json',
              json: {
                  'lang': 'chs',
                  'appid': 300,
                  'returnurl': 'https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
                  'source': 'wq_passport'
              },
              headers: {
                  'Connection': 'Keep-Alive',
                  'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                  'Accept': 'application/json, text/plain, */*',
                  'Cookie': this.cookies,
                  'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'User-Agent': `jdapp;android;10.0.6;6.0;${randomString(40)};network/wifi;model/MI 5;addressid/137981279;aid/372fc46cc36d1ea6;oaid/;osVer/23;appBuild/88829;partner/jingdong;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36`,
                  'Host': 'plogin.m.jd.com',
              }
          });
          this.token = response.body.token
          this.okl_token = response.headers['set-cookie'][0]
          this.okl_token = this.okl_token.substring(this.okl_token.indexOf("=") + 1, this.okl_token.indexOf(";"))
          var qrUrl = 'https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=' + this.token;
          return qrUrl;
      } catch (error) {
          console.log(error.response.body);
          return 0
      }
  }

  private async checkLogin(){
    try {
        if (this.cookies == "") {
            return 0
        }
        let timeStamp = (new Date()).getTime()
        let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauthchecktoken?&token=' + this.token + '&ou_state=0&okl_token=' + this.okl_token;
        const response = await got.post(url, {
            responseType: 'json',
            form: {
                lang: 'chs',
                appid: 300,
                returnurl: 'https://wqlogin2.jd.com/passport/LoginRedirect?state=1100399130787&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
                source: 'wq_passport'
            },
            headers: {
                'Referer': 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=' + timeStamp + '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
                'Cookie': this.cookies,
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': `jdapp;android;10.0.6;6.0;${randomString(40)};network/wifi;model/MI 5;addressid/137981279;aid/372fc46cc36d1ea6;oaid/;osVer/23;appBuild/88829;partner/jingdong;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36`,
            }
        });

        return response;
    } catch (error) {
        console.log(error.response.body);
        let res: any  = {}
        res.body = { check_ip: 0, errcode: 222, message: '出错' }
        res.headers = {}
        return res;
    }
  }

  public async qrcode() {
    await this.step1();
    const qrurl = await this.step2();
    return qrurl;
  }
  public async status() {
    const cookie: any  = await this.checkLogin();
    if (cookie.body.errcode == 0) {
        let ucookie = this.getCookie(cookie);
        return { err: 0, cookie: ucookie };
    } else {
        return { err: cookie.body.errcode, msg: cookie.body.message };
    }
  }

}
