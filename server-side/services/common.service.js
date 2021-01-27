const fs = require('fs');
const xlsx = require('node-xlsx');
const jwt = require('jsonwebtoken');
const compress_images = require('compress-images');
const { JWT_SECRET: secretOrKey } = process.env;
const path=require("path")
class CommonService {

    /**
     * Handle upload image
     */
    static async uploadImage(base64String) {
        // // Init
        // let slash = '/';
        // let root_folder = __dirname.split(`server-side${slash}services`);
        // if(root_folder.length > 1){
        //     root_folder = root_folder[0];
        // }else{
        //     slash = '\u005C';
        //     root_folder = __dirname.split(`server-side${slash}services`)[0];
        // }
        // let file_name = await this.initFileName();
        // if (base64String) {
        //     let mime_type = base64String.charAt(0);
        //     if(mime_type == '/') {
        //         mime_type = 'jpg';
        //     }else {
        //         mime_type = 'png';
        //     }
        //     let resource = `${root_folder}server-side`;
        //     let dest = `${root_folder}client-side${slash}static${slash}images${slash}`;
        //     let dest_2 = `${root_folder}client-side${slash}dist${slash}images${slash}`;
        //     fs.writeFile(`${file_name}.${mime_type}`, base64String, { encoding: 'base64' }, function(err) {
        //         compress_images(`${resource}${slash}${file_name}.${mime_type}`, dest, {compress_force: false, statistic: true, autoupdate: true}, false,
        //             { jpg: {engine: 'mozjpeg', command: ['-quality', '60']} },
        //             { png: {engine: 'pngquant', command: ['--quality=20-50']} },
        //             { svg: {engine: 'svgo', command: '--multipass'} },
        //             { gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']} }, function(err, completed) {
        //         });
        //         compress_images(`${resource}${slash}${file_name}.${mime_type}`, dest_2, {compress_force: false, statistic: true, autoupdate: true}, false,
        //             { jpg: {engine: 'mozjpeg', command: ['-quality', '60']} },
        //             { png: {engine: 'pngquant', command: ['--quality=20-50']} },
        //             { svg: {engine: 'svgo', command: '--multipass'} },
        //             { gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']} }, function(err, completed) {
        //             if(completed === true){
        //                 fs.unlink(`${resource}${slash}${file_name}.${mime_type}`, (err) => {});
        //             }
        //         });
        //     });
        //     return `images/${file_name}.${mime_type}`;
        // } else {
        //     return false;
        // }

        //data:image/jpeg;base64,
        let format=base64String.substring(11,base64String.search(';'))
        var base64Data = base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
        let file_name = this.initFileName();

        // require("fs").writeFile(`out.${format}`, base64Data, 'base64', function(err) { });
        // require("fs").writeFileSync(`${file_name}.${format}`, base64Data, 'base64');
        let now=new Date()
        let storeFolder=`${BASE_DIR}/assets/images/${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`
        fs.existsSync( storeFolder) || fs.mkdirSync(storeFolder,{ recursive: true });
        require("fs").writeFileSync(`${storeFolder}/${file_name}.${format}`, base64Data, 'base64');
        return path.join("static/images",storeFolder.split(`assets/images`)[1],`${file_name}.${format}`)
    }

    static async uploadVideo(base64String){
        let format=base64String.substring(11,base64String.search(';'))
        var base64Data = base64String.replace(/^data:video\/[a-zA-Z0-9]+;base64,/, "");
        base64Data=base64Data.replace(/ /g, '+');
        let file_name =  this.initFileName();

        // require("fs").writeFileSync(`${BASE_DIR}/../client-side/static/videos-asset/${file_name}.${format}`, base64Data, 'base64');
        let now=new Date()
        let storeFolder=`${BASE_DIR}/assets/videos/${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`
        fs.existsSync( storeFolder) || fs.mkdirSync(storeFolder,{ recursive: true });
        require("fs").writeFileSync(`${storeFolder}/${file_name}.${format}`, base64Data, 'base64');
        return path.join("static/videos",storeFolder.split("assets/videos")[1],`${file_name}.${format}`)
    }

    /**
    * Handle Import Excel
    */
    static async importExcel(base64String) {
        // Init
        let slash = '/';
        let root_folder = __dirname.split(`server-side${slash}services`);
        if(root_folder.length > 1){
            root_folder = root_folder[0];
        }else{
            slash = '\u005C';
            root_folder = __dirname.split(`server-side${slash}services`)[0];
        }
        let file_name =  this.initFileName();
        if (base64String) {
            let resource = `${root_folder}server-side`;
            await fs.writeFileSync(`${file_name}.xlsx`, base64String, { encoding: 'base64' });
            const data = await xlsx.parse(`${resource}${slash}${file_name}.xlsx`);
            await fs.unlink(`${resource}${slash}${file_name}.xlsx`, (err) => {});
            return data[0].data;
        } else {
            return false;
        }
    }

    /**
    * Handle Import Excel
    */
    static async importCSV(base64String, type) {
        // Init
        let slash = '/';
        let root_folder = __dirname.split(`server-side${slash}services`);
        if(root_folder.length > 1){
            root_folder = root_folder[0];
        }else{
            slash = '\u005C';
            root_folder = __dirname.split(`server-side${slash}services`)[0];
        }
        let file_name = type == 'static' ? 'text' :  this.initFileName();
        if (base64String) {
            let resource = `${root_folder}server-side`;
            await fs.writeFileSync(`${file_name}.csv`, base64String, { encoding: 'base64' });
            if(type == 'static'){
                return true;  
            }else{
                return `${resource}/${file_name}.csv`;
            }
        } else {
            return false;
        }
    }

    /**
    * Create random filename
    */
    static initFileName() {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

        // Process
        let file_name = '';
        for (let i = 0; i < 6; i++) {
            let random = (Math.random() * (charset.length - 1 - 0) + 0) | 0;
            file_name += charset[random];
        }
        file_name = file_name + new Date().getTime();
        return file_name;
    }

    /**
     * Convert string to slug
     */
    static async convertSlug(title) {
        // Convert to lowercase
        let slug = title.toLowerCase();

        //Remove accent
        slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
        slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
        slug = slug.replace(/đ/gi, 'd');
        //Remove special char
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        //Remove white space
        slug = slug.replace(/ /gi, "-");

        //In case user enter to many space
        slug = slug.replace(/\-\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-/gi, '-');
        slug = slug.replace(/\-\-/gi, '-');
        //Trim '-' at start and end of string
        slug = '@' + slug + '@';
        slug = slug.replace(/\@\-|\-\@|\@/gi, '');
        // let slug=encodeURIComponent(title)
        return slug;
    }

    /**
     * Paginate list datas
     * @paginate true
     * @return {void}
     */
    static async paginate(resource) {
        // Init
        const { model, modelTrans, req, where, order, include, attributes } = resource;
        const per_page = req.query.per_page && req.query.per_page > 0 ? parseInt(req.query.per_page) : 10;
        let count = { 
            where,
            distinct: true,
            include: include ? include : [],
        };
        const total = await model.count(count);
        const last_page = Math.ceil(total / per_page) || 0;
        const current_page = req.query.page && req.query.page > 0 && req.query.page <= last_page ? parseInt(req.query.page) : 1;
        const offset = (current_page - 1) * per_page;

        // Process
        let query = {
            include: include ? include : [],
            limit: per_page,
            offset,
            where,
            order: order ? order : [ ['id', 'DESC'] ],
        };
        if(attributes) {
            query.attributes = attributes;
        }
        let data = await model.findAll(query);
        if (modelTrans) {
            for (let i in data) {
                let dt = data[i];
                data[i] = await this.getTransByTransModel(req, modelTrans, dt);
            }
        }
        return {
            total,
            per_page,
            current_page,
            last_page,
            data,
        };
    }

    /**
     * Get List With Trans
     * @paginate false
     * @return {void}
     */
    static async getListWithTrans(resource) {
        // Init
        const { model, modelTrans, req, where, order, include, attributes } = resource;

        // Process
        let query = {
            where,
            order: order ? order : [ ['id', 'DESC'] ],
            include: include ? include : [],
        };
        if(attributes) {
            query.attributes = attributes
        }
        let data = await model.findAll(query);
        if (modelTrans) {
            for (let i in data) {
                let dt = data[i];
                data[i] = await this.getTransByTransModel(req, modelTrans, dt);
            }
        }
        return {
            data,
        };
    }

    /**
     * Get Trans By TransModel
     * @return {void}
     */
    static async getTransByTransModel(req, modelTrans, dt) {
        // Init
        const { lang } = req.headers;

        // Process
        const language = await LanguageModel.findOne({ where: { code: lang } });
        const default_language = await LanguageModel.findOne({ where: { is_default: 1 } });
        const trans = await modelTrans.findOne({ where: { trans_id: dt.id, lang_id: language.id } });
        const default_trans = await modelTrans.findOne({ where: { trans_id: dt.id, lang_id: default_language.id } });
        return {
            dt,
            trans,
            default_trans,
        }
    }
}

module.exports = CommonService;