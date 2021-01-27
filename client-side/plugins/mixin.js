import AuthService from "~/services/auth.service";
import moment from "moment";
import Constants from '~/constants'

const mixin = {
    methods: {
        globalImageUrl: function(path) {
            if (path) {
                if(/(https?:\/\/[^\s]+)/.test(path) == false && path.includes("-asset")){
                    return `${window.location.origin}/${path}`;
                }

                if(path.includes("static\\images\\")){
                  return Constants.apiUrl+"/"+path
                }
            }
            return path;
        },
        globalObjectLength: function(obj) {
            if (obj) { 
                return Object.keys(obj).length;
            }
        },
        globalBaseUrl(path) {
            return `/${path}`;
        },
        globalAuthDirect: function(name, action = "", query = {}, params = {}) {
            if (action && action == "login") {
                this.$store.commit("setLoginRedirect", { name, query, params });
                this.$router.push({ name: "login" });
            } else {
                if (!AuthService.isAuth) {
                    alert("Vui lòng đăng nhập để thực hiện tính năng này!");
                    this.$store.commit("setLoginRedirect", { name, query, params });
                    this.$router.push({ name: "login" });
                } else {
                    if (action == "redirect") {
                        this.$router.push({ name, query, params });
                    }
                }
            }
        },
        globalFormatNumber: function(number, seperator) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
        },
        globalConvertTimestamp(timestamp, format) {
            return moment.unix(timestamp).format(format);
        },
        globalDecodeJson(json) {
            return JSON.parse(json);
        },
        globalParseJson(json) {
            return JSON.stringify(json);
        },
        globalProcessDescription: function(description) {
            return description
                .slice(1, -1)
                .replace(/\\/g, "")
                .replace("top", "")
                .replace("position", "")
                .replace("style", "");
        },
        globalShowDrop: function(drop_id) {
            let elements = document.querySelectorAll("div.dropdown-menu");
            elements.forEach(element => {
                let element_id = element.id;
                if (element_id != drop_id) {
                    if (element.classList.contains("d-block")) {
                        element.classList.add("d-none");
                        element.classList.remove("d-block");
                    }
                }
            });
            let element = document.getElementById(drop_id);
            if (element) {
                if (element.classList.contains("d-block")) {
                    element.classList.add("d-none");
                    element.classList.remove("d-block");
                } else if (element.classList.contains("d-none")) {
                    element.classList.add("d-block");
                    element.classList.remove("d-none");
                }
            }
        },
        globalEncodeData: function(data) {
            const SALT_OBJECT = process.env.SALT_OBJECT;
            const SALT_DECODE = process.env.SALT_DECODE;
            data = JSON.stringify(data).split("");
            for (let i = 0, l = data.length; i < l; i++) {
                if (data[i] == "{") {
                    data[i] = "}";
                } else if (data[i] == "}") {
                    data[i] = "{";
                }
            }
            let encodeData = encodeURI(SALT_OBJECT + data.join(""));
            let cipher = salt => {
                let textToChars = text => text.split("").map(c => c.charCodeAt(0));
                let byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
                let applySaltToChar = code =>
                    textToChars(salt).reduce((a, b) => a ^ b, code);

                return text =>
                    text
                        .split("")
                        .map(textToChars)
                        .map(applySaltToChar)
                        .map(byteHex)
                        .join("");
            };
            let initCipher = cipher(SALT_DECODE);
            encodeData = initCipher(encodeData);
            return encodeData;
        },
        globalDecodeData: function(dt){
            let decipher = salt => {
                let textToChars = text => text.split('').map(c => c.charCodeAt(0))
                let saltChars = textToChars(salt)
                let applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code)
                return encoded => encoded.match(/.{1,2}/g)
                    .map(hex => parseInt(hex, 16))
                    .map(applySaltToChar)
                    .map(charCode => String.fromCharCode(charCode))
                    .join('')
            }
            let initCipher = decipher(process.env.SALT_DECODE);
            dt = initCipher(dt);
            dt = decodeURI(dt);
            let salt = process.env.SALT_OBJECT;
            if(salt && dt.indexOf(salt) != 0){
                console.log('object cannot be decripted');
            }
            dt = dt.substring(salt.length).split('');
            let data = '';
            for(let i = 0, length = dt.length; i < length; i++){
                if(dt[i] == '{'){
                    dt[i] = '}';
                }
                else if(dt[i] == '}'){
                    dt[i] = '{';
                }
                data += dt[i];
            }
            return data;
        },
        globalFormatDate: function(date) {
            return moment(date).format("DD/MM/YYYY HH:mm");
        },
        globalLimitDescription: function(description, limit) {
            let des = "";
            if(description != ''){
                if (description.length < limit) {
                    des = description.slice(0, limit);
                } else {
                    des = description.slice(0, limit) + "...";
                }
                return des;
            }
        },
        globalRenderListData: function(item, listName, dataName) {
            let lists = item[listName];
            let data = '';
            for(let i in lists){
                let list = lists[i];
                if(i == (lists.length - 1)){
                    data += list[dataName];
                }else{
                    data += list[dataName] + ', ';
                }
            }
            return data;
        },
        globalCalculateVideoTime: function(time) {
            let time_string = '';
            if(time < 60) {
                time_string = time < 10 ? `00:0${time.toString().slice(0, 1)}` : `00:${time.toString().slice(0, 2)}`;
            }else {
                let minute = Math.floor(time / 60);
                if(minute < 60){
                    minute = minute < 10 ? `0${minute}` : minute;
                    let second = time - minute * 60;
                    second = second < 10 ? `0${second}` : second;
                    time_string = `${minute}:${second.toString().slice(0, 2)}`;
                }else{
                    let hour = Math.floor(time / 3600);
                    hour = hour < 10 ? `0${hour}` : hour;
                    let second = time - hour * 3600;
                    if(second < 60){
                        time_string = `${hour}:00:${second.toString().slice(0, 2)}`;
                    }else{
                        let minute = Math.floor((time - hour * 3600) / 60);
                        minute = minute < 10 ? `0${minute}` : minute;
                        let second = time - (hour*3600 + minute*60);
                        second = second < 10 ? `0${second}` : second;
                        time_string = `${hour}:${minute}:${second.toString().slice(0, 2)}`;
                    }
                }
            }
            return time_string;
        },
        globalOpenModal: function(id) {
            document.getElementById(id).classList.add('d-block');
        },
        globalCloseModal: function(id) {
            document.getElementById(id).classList.remove('d-block');
        },
    }
}

export default mixin;