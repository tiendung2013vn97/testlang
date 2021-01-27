<template>
    <div v-if="cmt">
        <div class="d-flex py-2 default-comments" >
            <div class="avatar rounded-circle">
                <div class="h-30 w-30 nuxt-link-exact-active nuxt-link-active">
                    <img :src="globalImageUrl(cmt.user.avatar ? cmt.user.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100">
                </div>
            </div>
            <div class="ml-2 user-cmt-inf">
                <div class="d-flex">
                    <nuxt-link to="" class="user-name text-dark font-weight-bold font-size-14">
                        {{ cmt.user.username }}
                    </nuxt-link>
                    <span class="font-size-12 gl-color-777 my-auto ml-2">{{ globalFormatDate(cmt.createdAt) }}</span>
                </div>
                <div>
                    {{ cmt.content }}
                </div>
                <div @click="clickRep({ username: '', cmtId: cmt.id })">
                    <nuxt-link to="">
                        Trả lời
                    </nuxt-link>
                </div>
            </div>
        </div>
        <template v-if="cmt.reply">
            <div v-if="!show_replies && !replies.length" class="d-flex py-2 reply-comments">
               
                <span class="cursor-pointer font-weight-bold" @click="getReplies(cmt.id)">
                    Xem {{ cmt.reply }} câu trả lời <i class="far fa-chevron-down"></i>
                </span>
            </div>
            <div v-else class="d-flex py-2 reply-comments">
                <span class="cursor-pointer font-weight-bold" v-if="show_replies" @click="showHideReply()">
                    Ẩn câu trả lời <i class="far fa-chevron-up"></i>
                </span>
                <span class="cursor-pointer font-weight-bold" v-if="!show_replies" @click="showHideReply()">
                    Xem {{ cmt.reply }} câu trả lời <i class="far fa-chevron-down"></i>
                </span>
            </div>
        </template>
        <template v-if="replies.length && show_replies">
            <template v-if="isLoad && replies_page == 2">
                <div class="d-flex py-2 reply-comments">
                    <ClipLoader :color="'#f44336'" :size="'20px'"/>
                </div>
            </template>
            <template v-for="rep in replies">
                <div class="d-flex py-2 reply-comments" v-if="rep.status === 'active'">
                    <!-- <div class="avatar rounded-circle">
                        <a class="nuxt-link-exact-active nuxt-link-active">
                            <img :src="globalImageUrl(rep.user.avatar ? rep.user.avatar : 'images-asset/No_Image_Available.jpg')" height="50px" width="50px">
                        </a>
                    </div> -->
                    <div class="avatar rounded-circle">
                        <div class="h-30 w-30 nuxt-link-exact-active nuxt-link-active">
                            <img :src="globalImageUrl(cmt.user.avatar ? cmt.user.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100">
                        </div>
                    </div>
                    <div class="ml-2">
                        <div class="d-flex">
                            <nuxt-link to="" class="user-name text-dark font-weight-bold font-size-14">
                                {{ rep.user.username }}
                            </nuxt-link>
                            <span class="font-size-12 gl-color-777 my-auto ml-2">{{ globalFormatDate(rep.createdAt) }}</span>
                        </div>
                        <div v-html="rep.content">
                        </div>
                        <div @click="clickRep({ username: rep.user.username, cmtId: cmt.id })">
                            <nuxt-link to="">
                                Trả lời
                            </nuxt-link>
                        </div>
                    </div>
                </div>
            </template>
            <template v-if="isLoad && replies_page > 2">
                <div class="d-flex py-2 reply-comments">
                    <ClipLoader :color="'#f44336'" :size="'20px'"/>
                </div>
            </template>
            <template v-if="cmt.reply && replies_lastpage >= replies_page">
                <div class="d-flex py-2 reply-comments" @click="getReplies(cmt.id)">
                    <span class="cursor-pointer font-weight-bold">
                        Hiển thị thêm câu trả lời
                    </span>
                </div>
            </template>
        </template>
        <div class="py-4 user-comments reply-comments" v-if="showCommentForm">
            <div class="d-flex">
                <div class="avatar rounded-circle">
                    <div class="h-30 w-30 nuxt-link-exact-active nuxt-link-active">
                        <img :src="globalImageUrl(user.avatar ? user.avatar : 'images-asset/No_Image_Available.jpg')" class="w-100 h-100 rounded-circle">
                    </div>
                </div>
                <div class="col pl-2 pr-0">
                    <textarea class="bg-gray border-0 border-radius-10 h-64 p-2 w-100" placeholder="Thêm nhận xét công khai..." rows="1" v-model="reply.content" :id="`replyForm-${cmt.id}`"></textarea >
                </div>
            </div>
            <div class="text-right">
                <button class="btn btn-success" type="button" :disabled="btnRepComment" @click="sendRepComment({ idComment: cmt.id })">Nhận xét</button>
            </div>
        </div>
    </div>
</template>

<script>
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';

export default {
    components: {
        ClipLoader,
    },
    props: {
        cmt: '',
    },
    created() {
        this.idVideo = this.cmt.video_id;
    },
    data() {
        return {
            user: this.$store.state.user.data,
            showCommentForm: false,
            btnRepComment: true,
            reply: {
                content: '',
            },
            idVideo: '',
            replies: [],
            replies_page: 1,
            replies_lastpage: 2,
            show_replies: false,
            isLoad: false,
        }
    },
    methods: {
        clickRep: function(data) {
            if(this.user.username){
                this.showCommentForm = true;
                if(data.username){
                    this.reply.content = `@${data.username}: `;
                }else{
                    this.reply.content = '';
                }
            }else{
                this.$toastr('error', 'Vui lòng đăng nhập trước khi bình luận.');
            }
        },
        sendRepComment(data) {
            this.$http.post('comments/sendreply?idVideo=' + this.idVideo + '&idComment=' + data.idComment , this.reply)
            .then( response => {
                this.reply.content = '';
                this.$emit('updateVideo');
                this.replies = [];
                this.replies_page = 1,
                this.replies_lastpage = 2,
                this.getReplies(data.idComment);
                this.showCommentForm = false;
                this.$toastr('success', response.data.message);
            })
            .catch( response => {
                if(response.status == 404){
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'index' });
                }
            });
        },
        getReplies: function(comment_id) {
            this.isLoad = true;
            if(this.replies_lastpage >= this.replies_page) {
                this.$http.get(`comments/replies/${comment_id}?page=${this.replies_page}&per_page=10`)
                .then(response => {
                    this.replies_lastpage = response.data.data.last_page;
                    this.replies_page++;
                    this.show_replies = true;
                    this.replies = this.replies.concat(response.data.data.data);
                    setTimeout(function() {
                        this.isLoad = false;
                    }.bind(this), 100);
                })
            }
        },
        showHideReply: function() {
            this.show_replies = !this.show_replies;
        }
    },
    watch: {
        'reply.content': function() {
            if(this.reply.content != ''){
                this.btnRepComment = false;
            }else{
                this.btnRepComment = true;
            }
        }
    }
}
</script>