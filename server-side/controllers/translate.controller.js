const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;
const CommonService = require('../services/common.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const {Translate} = require('@google-cloud/translate').v2;
const LangModel = require("../database/models/lang.model");
const TranslateModel = require('../database/models/translate.model');
const { words } = require('lodash');
//AIzaSyDpCFZH3KERevq839heyO4DmFDT0K-YmtE

class TranslateController {
    /**
     * Translate data
     * @params req, res
     * @return {void}
     */
    static async translate(req, res) {
        const user = await AuthService.user(req);
        let { text, lang, langTranslate,default_mean } = req.body;
        // if(!user || user.account_type != "PROVIDER" && user.account_type != "ADMIN"){
        //     return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });  
        // }

        let singleTexts=[]
        let splitRegex=/[.\s;]/
        text.forEach(t => {
            // let arrSingleText=t.split(splitRegex).filter(el=>el!="")
            let arrSingleText=t.split("").filter(el=>el)
            singleTexts=singleTexts.concat(arrSingleText)
        });

        singleTexts=[...new Set(singleTexts)]

        let optOr=[]
        singleTexts.forEach(t=>{
            optOr.push({words:{
                [Op.like]:`%${t}%`
            }})
        })

        //read from db first
        let dictionary={}
        let dictionaryKeys=[]
        if(optOr.length){
            let dicResult= await TranslateModel.findAll({
                where:{
                    [Op.or]:optOr,
                    status:"active",
                    lang_id:lang.id,
                    lang_translate:langTranslate.id,
                    type:"word"
                },
                raw:true
            })
            
            dicResult.forEach(item=>{
                if(!dictionary[item.words])dictionary[item.words]=item
                else if(item.count>dictionary[item.words].count) dictionary[item.words]=item
                dictionaryKeys.push(item.words)
            })
            dictionaryKeys=[...new Set(dictionaryKeys)]
        }

        let trackObj={}
        let googleTransWords=[]
        text.forEach(t=>{//block 1
            trackObj[t]={
                words:[],
                trans:[],
                pronunciation:[]
            }
            singleTexts=t.split("")
            
            let nonExistWord=""
            for(let index=0;index<singleTexts.length;index++){//block 2
                let lastIndex=index
                let set={
                    word:"",
                    tran:"",
                    pro:""
                }
                
                for(let numOfTexts=1;index+numOfTexts<=singleTexts.length;numOfTexts++){
                    let setTexts=singleTexts.slice(index,index+numOfTexts)
                    let selectedWord=dictionaryKeys.find(key=>key==setTexts.join(""))
                    if(selectedWord){
                            lastIndex=index+numOfTexts-1
                            set.word=selectedWord
                            set.tran=dictionary[selectedWord].translate
                            set.pro=dictionary[selectedWord].pronunciation
                    }
                }

                if(set.word){
                    if(nonExistWord){
                        trackObj[t].words.push(nonExistWord)
                        trackObj[t].trans.push(null)
                        trackObj[t].pronunciation.push(null) 
                        googleTransWords.push(nonExistWord)
                    }
                    trackObj[t].words.push(set.word)
                    trackObj[t].trans.push(set.tran)
                    trackObj[t].pronunciation.push(set.pro)
                    nonExistWord=""
                }else nonExistWord+=singleTexts[index]
                index=lastIndex
            }//block 2 end

            if(nonExistWord){
                trackObj[t].words.push(nonExistWord)
                trackObj[t].trans.push(null)
                trackObj[t].pronunciation.push(null) 
                googleTransWords.push(nonExistWord)
            }

            
        })//block 1 end

        if(googleTransWords.length){
            googleTransWords=[...new Set(googleTransWords)]
            const translate = new Translate({
                projectId: 'sublime-calling-235811',
                keyFilename: 'translate-api-credentials.json',
            });
            let transTexts= await translate.translate(googleTransWords, {from:lang.code,to:langTranslate.code});
            transTexts = transTexts[0]

            Object.values(trackObj).forEach(item=>{
                for(let index=0;index<item.words.length;index++){
                    if(item.trans[index]==null){ 
                        // let pos= googleTransWords.indexOf(item.words[index])
                        // if(pos!=-1) item.trans[index]={translate:transTexts[pos],pronunciation:""}
                        let pos= googleTransWords.indexOf(item.words[index])
                        if(pos!=-1){
                            item.trans[index]=transTexts[pos]
                            item.pronunciation[index]=""
                        }
                    }
                }
            })
        }

        let result={
            words:[],
            trans:[],
            pronunciation:[],
            exact_mean:""
        }
        // console.log("trackObj",trackObj)
        text.forEach(t=>{
            result.words=result.words.concat(trackObj[t].words)
            result.trans=result.trans.concat(trackObj[t].trans)
            result.pronunciation=result.pronunciation.concat(trackObj[t].pronunciation)
        })
        // Object.values(trackObj).forEach(item=>{
        //     // result.words=result.words.concat(item.words)
        //     // result.trans=result.trans.concat(item.trans.map(tran=>tran.translate))
        //     // result.pronunciation=result.pronunciation.concat(item.trans.map(tran=>tran.pronunciation))
        //     // result.words=result.words.concat(item.words)
        //     // result.trans=result.trans.concat(item.trans)
        //     // result.pronunciation=result.pronunciation.concat(item.pronunciation)
        // })

        
        if(default_mean){
         
            let exactTrans=await TranslateModel.findAll({
                where:{
                    words:default_mean,
                    type:"full_line",
                    status:"active",
                    lang_id:lang.id,
                    lang_translate:langTranslate.id,
                },
                raw:true
            })

            let exact_mean=""
            if(exactTrans.length){
                exactTrans.forEach(e=>{
                    if(!exact_mean)exact_mean=e
                    else if(e.count>exact_mean.count)exact_mean=e
                })
                if(exact_mean)  exact_mean=exact_mean.translate

            }
            
            if(!exact_mean){
              default_mean=default_mean.replace(/`/g,'')
              const translate = new Translate({
                projectId: 'sublime-calling-235811',
                keyFilename: 'translate-api-credentials.json',
            });
              let transDefaultMeans=await translate.translate(default_mean, {from:lang.code,to:langTranslate.code});
              exact_mean=transDefaultMeans[0]
            }
        
            result.exact_mean=exact_mean
        }

        // let lastResult={
        //     words:[],
        //     trans:[],
        //     pronunciation:[]
        // }
        // result.words.forEach((item,index)=>{
        //     if([" ","."].includes(item))return
        //     if(result.words[index+1]=="."){
        //         lastResult.words.push(item+". ")
        //         lastResult.trans.push(result.trans[index]+". ")
        //         lastResult.pronunciation.push(result.pronunciation[index]+". ")
        //         return
        //     }

        //     lastResult.words.push(item)
        //     lastResult.trans.push(result.trans[index])
        //     lastResult.pronunciation.push(result.pronunciation[index])
        // })

        return res.send({ 'message' : 'Dịch thành công', result });
    }

    /**
     * Get list pronouns resource with paginate
     * @param {*} req 
     * @param {*} res 
     */
    static async getListPronouns(req, res){
        const { page, key_words } = req.query;
        if(key_words){
            const where = { 
                status: 'active',
                type: 'pronoun',
                [Op.or]: [
                    { words: {[Op.like]: '%' +  key_words + '%'}},
                    { translate: {[Op.like]: '%' +  key_words + '%'}},
                    { description: {[Op.like]: '%' +  key_words + '%'}},
                ]
            };
            const order = [
                ['createdAt', 'DESC']
            ];
            const include = [
                {
                    model: LangModel,
                    as: 'trans_lang',
                    where: {
                        status: 'active',
                    }
                },
                {
                    model: LangModel,
                    as: 'lang_trans',
                    where: {
                        status: 'active',
                    }
                }
            ];
            const resource = { model: TranslateModel, req, where, order, include };
            const pronoun = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách dịch phiên âm thành công', 'data' : pronoun });
        }else{
            let transCache = await CacheService.getCache('list-pronouns');
            transCache = transCache ? transCache : {};
            if (!transCache[`transPage-${page}`]) {
                const where = {
                    status: { [Op.not]: 'deleted' },
                    type: 'pronoun',
                };
                const order = [
                    ['createdAt', 'DESC']
                ];
                const include = [
                    {
                        model: LangModel,
                        as: 'trans_lang',
                        where: {
                            status: 'active',
                        }
                    },
                    {
                        model: LangModel,
                        as: 'lang_trans',
                        where: {
                            status: 'active',
                        }
                    }
                ];
                const resource = { model: TranslateModel, req, where, order, include };
                transCache[`transPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(transCache, 'list-pronouns');
            res.send({ 'message': 'Lấy danh sách dịch phiên âm thành công', 'data': transCache[`transPage-${page}`] });
        }
    }

    /**
     * Get list full-line resource with paginate
     * @param {*} req 
     * @param {*} res 
     */
    static async getListFullLines(req, res){
        const { page, key_words } = req.query;
        if(key_words){
            const where = { 
                status: 'active',
                type: 'full_line',
                [Op.or]: [
                    { words: {[Op.like]: '%' +  key_words + '%'}},
                    { translate: {[Op.like]: '%' +  key_words + '%'}},
                    { description: {[Op.like]: '%' +  key_words + '%'}},
                ]
            };
            const order = [
                ['createdAt', 'DESC']
            ];
            const include = [
                {
                    model: LangModel,
                    as: 'trans_lang',
                    where: {
                        status: 'active',
                    }
                },
                {
                    model: LangModel,
                    as: 'lang_trans',
                    where: {
                        status: 'active',
                    }
                }
            ];
            const resource = { model: TranslateModel, req, where, order, include };
            const full_words = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách dịch cả câu thành công', 'data' : full_words });
        }else{
            let transCache = await CacheService.getCache('list-full-line');
            transCache = transCache ? transCache : {};
            if (!transCache[`transPage-${page}`]) {
                const where = {
                    status: { [Op.not]: 'deleted' },
                    type: 'full_line',
                };
                const order = [
                    ['createdAt', 'DESC']
                ];
                const include = [
                    {
                        model: LangModel,
                        as: 'trans_lang',
                        where: {
                            status: 'active',
                        }
                    },
                    {
                        model: LangModel,
                        as: 'lang_trans',
                        where: {
                            status: 'active',
                        }
                    }
                ];
                const resource = { model: TranslateModel, req, where, order, include };
                transCache[`transPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(transCache, 'list-full-line');
            res.send({ 'message': 'Lấy danh sách dịch cả câu thành công', 'data': transCache[`transPage-${page}`] });
        }
    }

    /**
     * Get list words resource with paginate
     * @param {*} req 
     * @param {*} res 
     */
    static async getListWords(req, res){
        const { page, key_words } = req.query;
        if(key_words){
            const where = { 
                status: 'active',
                type: 'word',
                [Op.or]: [
                    { words: {[Op.like]: '%' +  key_words + '%'}},
                    { translate: {[Op.like]: '%' +  key_words + '%'}},
                    { description: {[Op.like]: '%' +  key_words + '%'}},
                ]
            };
            const order = [
                ['createdAt', 'DESC']
            ];
            const include = [
                {
                    model: LangModel,
                    as: 'trans_lang',
                    where: {
                        status: 'active',
                    }
                },
                {
                    model: LangModel,
                    as: 'lang_trans',
                    where: {
                        status: 'active',
                    }
                }
            ];
            const resource = { model: TranslateModel, req, where, order, include };
            const each_word = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách dịch từng từ thành công', 'data' : each_word });
        }else{
            let transCache = await CacheService.getCache('list-words');
            transCache = transCache ? transCache : {};
            if (!transCache[`transPage-${page}`]) {
                const where = {
                    status: { [Op.not]: 'deleted' },
                    type: 'word',
                };
                const order = [
                    ['createdAt', 'DESC']
                ];
                const include = [
                    {
                        model: LangModel,
                        as: 'trans_lang',
                        where: {
                            status: 'active',
                        }
                    },
                    {
                        model: LangModel,
                        as: 'lang_trans',
                        where: {
                            status: 'active',
                        }
                    }
                ];
                const resource = { model: TranslateModel, req, where, order, include };
                transCache[`transPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(transCache, 'list-words');
            res.send({ 'message': 'Lấy danh sách dịch từng từ thành công', 'data': transCache[`transPage-${page}`] });
        }
    }

    /**
     * Create new resource
     * @params req, res
     * @return {void}
     */
    static async create(req, res) {
        const { words, translate, description, lang_trans, trans_lang } = req.body;
        const { type } = req.query;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN" || (type != "pronoun" && type != "full_line" && type != "word")){
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        let translateStr = "";
        if(type == "pronoun"){
            translateStr = "phiên âm";
        }else if(type == "full_line"){
            translateStr = "dịch cả câu";
        }else if(type == "word"){
            translateStr = "dịch từng từ";
        }
        const translateExist = await TranslateModel.findOne({
            where: {
                words,
                translate,
                lang_id: lang_trans.id ? lang_trans.id : '',
                lang_translate: trans_lang.id ? trans_lang.id : '',
                type: type ? type : '',
                status: 'active',
            },
            required: true,
        });
        if(translateExist){
            return res.status(403).send({ 'message': 'Đã tồn tại ' + translateStr + ' của: ' + words });
        }
        const translateData = await TranslateModel.create({
            words,
            translate,
            description,
            type: type ? type : '',
            lang_id: lang_trans.id ? lang_trans.id : '',
            lang_translate: trans_lang.id ? trans_lang.id : '',
        });
        if(type == "pronoun"){
            await CacheService.removeCache('list-pronouns');
        }else if(type == "full_line"){
            await CacheService.removeCache('list-full-line');
        }else if(type == "word"){
            await CacheService.removeCache('list-words');
        }
        res.send({ 'message' : 'Tạo ' + translateStr + ' mới thành công', 'data': translateData });
    }

    /**
     * Get data edit resource
     * @params req, res
     * @return {void}
     */
    static async edit(req,res){
        const { id } = req.params;
        const { type } = req.query;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN" || (type != "pronoun" && type != "full_line" && type != "word")){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        let translateStr = "";
        if(type == "pronoun"){
            translateStr = "phiên âm";
        }else if(type == "full_line"){
            translateStr = "dịch cả câu";
        }else if(type == "word"){
            translateStr = "dịch từng từ";
        }
        const translateData = await TranslateModel.findOne({ 
            where: {
                id,
                status: { [Op.not]:'deleted' },
                type: type ? type : '',
            },
            include: [
                {
                    model: LangModel,
                    as: 'lang_trans',
                    where: {
                        status: 'active',
                    },
                },
                {
                    model: LangModel,
                    as: 'trans_lang',
                    where: {
                        status: 'active',
                    },
                },
            ],
        });
        if(translateData){
            res.send({ 'message':'Lấy dữ liệu ' + translateStr + ' thành công', 'data': translateData });
        }else{
            res.status(404).send({ 'message' : 'Không tồn tại ' + translateStr });
        }
    }

    /**
     * Update resource
     * @params req, res
     * @return {void}
     */
    static async update(req,res){
        const { id } = req.params;
        const { words, translate, description, lang_trans, trans_lang } = req.body;
        const { type } = req.query;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN" || (type != "pronoun" && type != "full_line" && type != "word")){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        let translateStr = "";
        if(type == "pronoun"){
            translateStr = "phiên âm";
        }else if(type == "full_line"){
            translateStr = "dịch cả câu";
        }else if(type == "word"){
            translateStr = "dịch từng từ";
        }
        const translateData = await TranslateModel.findOne({
            where: { 
                id,
                status: { [Op.not]: 'deleted' },
                type: type ? type : '',
            }
        });
        if(translateData){
            const translateExist = await TranslateModel.findOne({
                where: { 
                    id: { [Op.not]: id },
                    words,
                    translate,
                    lang_id: lang_trans.id ? lang_trans.id : '',
                    lang_translate: trans_lang.id ? trans_lang.id : '',
                    type: type ? type : '',
                    status: 'active',
                }
            });
            if(translateExist){
                return res.status(403).send({ 'message': 'Đã tồn ' + translateStr + ' của: ' + words });
            }else{
                await translateData.update({
                    words,
                    translate,
                    description,
                    lang_id: lang_trans.id ? lang_trans.id : '',
                    lang_translate: trans_lang.id ? trans_lang.id : '',
                });
                if(type == "pronoun"){
                    await CacheService.removeCache('list-pronouns');
                }else if(type == "full_line"){
                    await CacheService.removeCache('list-full-line');
                }else if(type == "word"){
                    await CacheService.removeCache('list-words');
                }
                res.send({ 'message':'Cập nhật ' + translateStr + ' thành công', 'data': translateData });
            }
        }else{
            res.status(404).send({ 'message': 'Không tồn tại ' + translateStr });
        }
    }

    /**
     * Delete resource
     * @params req, res
     * @return {void}
     */
    static async delete(req,res){
        const { id } = req.params;
        const { type } = req.query;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN" || (type != "pronoun" && type != "full_line" && type != "word")){
            return res.status(403).send({'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!'});
        }
        let translateStr = "";
        if(type == "pronoun"){
            translateStr = "phiên âm";
        }else if(type == "full_line"){
            translateStr = "dịch cả câu";
        }else if(type == "word"){
            translateStr = "dịch từng từ";
        }
        const translateData = await TranslateModel.findOne({
            where: { 
                id,
                status: { [Op.not]:'deleted' },
                type: type ? type : '',
            }
        });
        if(translateData){
            await translateData.update({
                status: 'deleted',
            });
            if(type == "pronoun"){
                await CacheService.removeCache('list-pronouns');
            }else if(type == "full_line"){
                await CacheService.removeCache('list-full-line');
            }else if(type == "word"){
                await CacheService.removeCache('list-words');
            }
            res.send({ 'message':'Xóa thành công ' + translateStr, 'data': translateData });
        }else{
            res.status(404).send({ 'message': 'Không tồn tại ' + translateStr });
        }
    }
    

    /**
     * Upload excel for translate
     */
    static async uploadExcel(req, res) {
        // Init
        const { excel, type } = req.body;

        // Process
        let excel_data = await CommonService.importExcel(excel);
        let error = [];
        for(let i in excel_data) {
            if(i > 0) {
                let data = excel_data[i];
                if(data[0] && data[1] && data[2] && data[3] && data[4]){
                    let whereFindTrans = {
                        words: data[0],
                        type,
                    };
                    if(type == "word"){
                        whereFindTrans.translate = data[1];
                    }else if(type == "pronoun"){
                        whereFindTrans.translate = data[2];
                    }
                    let findTrans = await TranslateModel.findOne({
                        where: whereFindTrans,
                        include: [
                            {
                                model: LangModel,
                                as: 'lang_trans',
                                where: {
                                    status: 'active',
                                    code: data[3],
                                },
                            },
                            {
                                model: LangModel,
                                as: 'trans_lang',
                                where: {
                                    status: 'active',
                                    code: data[4],
                                },
                            },
                        ],
                    });
                    if(findTrans){
                        let count = findTrans.count + 1;
                        await findTrans.update({
                            count,
                        });
                    }else{
                        let rawLang = await LangModel.findOne({
                            where: {
                                code: data[3],
                                status: 'active',
                            }
                        });
                        let langTrans = await LangModel.findOne({
                            where: {
                                code: data[4],
                                status: 'active',
                            },
                        });
                        if(langTrans && rawLang){
                            if(type == "word"){
                                await TranslateModel.create({
                                    words: data[0],
                                    translate: data[1],
                                    lang_id: rawLang.id,
                                    lang_translate: langTrans.id,
                                    type,
                                });
                            }else if(type == "pronoun"){
                                await TranslateModel.create({
                                    words: data[0],
                                    translate: data[2],
                                    lang_id: rawLang.id,
                                    lang_translate: langTrans.id,
                                    type,
                                });
                            }
                        }else{
                            error.push(data);
                        }
                    }
                }
            }
        }
        if(error.length > 0){
            res.status(403).send({ 'message': 'List danh sách các từ bị lỗi ', error });
        }else{
            res.send({ 'message': 'Thêm thành công danh sách từ vựng' });
        }
        if(type == "pronoun"){
            await CacheService.removeCache('list-pronouns');
        }else if(type == "word"){
            await CacheService.removeCache('list-words');
        }
    }
}

module.exports = TranslateController;