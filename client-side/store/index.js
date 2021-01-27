import HttpConfig from '~/plugins/http/http.config'

const http = HttpConfig.get();
export const state = () => ({
    template: '',
    isActive: '',
    subIsActive: '',
    loginRedirect: '',
    seo: '',
    langStudy: '',
})

export const mutations = {
    setTemplate(state, template){
        state.template = template;
    },
    setActiveSidebar(state, data){
        const { isActive, subIsActive } = data;
        state.isActive = isActive;
        state.subIsActive = subIsActive;
    },
    setLoginRedirect(state, data){
        state.loginRedirect = data;
    },
    setSeo(state, data) {
        state.seo = data;
    },
    setLanguage(state, data) {
        state.langStudy = data;
        let userSetting=localStorage.getItem("userSetting")
        if(userSetting){
            userSetting=JSON.parse(userSetting)
            userSetting.langStudy=data
            localStorage.setItem("userSetting",JSON.stringify(userSetting))
            let token =  localStorage.getItem('langAdvisorAccessToken');
            let payload={}
            if(token){
                payload.headers={Authorization: `Bearer ${token}`}
                http.put("user/settings",userSetting,payload)
                .then(val=>{
                    
                }).catch(err=>{
                    console.error("Có lỗi khi cập nhập user setting!",err)
                })
            }
            
        }else{
            localStorage.setItem("userSetting",JSON.stringify({langStudy:data}))
        }
    }
}

export const actions = {
    async nuxtServerInit({ commit }, context) {
        const { route, store } = context;
        let seoDt = {
            title: "Langadvisor",
            seo_keywords: "video, toeic, học tiếng anh, phim ảnh, âm nhạc",
            seo_description: "Học tiếng anh bổ ích qua video âm nhạc & phim ảnh",
            seo_title: "Langadvisor",
            seo_image: "/favicon.ico"
        }
        if (route.name == "page-slug") {
            try {
                let response = await http.get(`pages/detail/${route.params.slug}/`)
                let page = response.data.data;
                seoDt = {
                    title: page.seo_title ? page.seo_title : page.title ? page.title : seoDt.title,
                    seo_keywords: page.seo_keywords ? page.seo_keywords : seoDt.seo_keywords,
                    seo_description: page.seo_content ? page.seo_content : seoDt.seo_description,
                    seo_title: page.seo_title ? page.seo_title : page.title ? page.title : seoDt.title,
                    seo_image: page.seo_image ? `/${page.seo_image}` : seoDt.seo_image
                };
                commit("setSeo", seoDt);
            } catch (error) {

            }
        }else if(route.name == "video-slug"){
            try {
                let response = await http.get(`videos/detail/${route.params.slug}/`)
                let video = response.data.data;
                seoDt = {
                    title: video.title ? video.title : seoDt.title,
                    seo_keywords: seoDt.seo_keywords,
                    seo_description: video.description ? video.description : seoDt.seo_description,
                    seo_title: video.title ? video.title : seoDt.seo_title,
                    seo_image: video.image ? `/${video.image}` : seoDt.seo_image
                };
                commit("setSeo", seoDt);
            } catch (error) {

            }
        } else {
            return commit("setSeo", seoDt);
        }
    },
};