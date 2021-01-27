<template>
<div class="">
    <template v-if="$route.name == 'profile'">
        <input id="fileInput" type="file" class="d-none form-control" @change="convertBase64" :accept="accept ? accept : 'image/x-png,image/gif,image/jpeg'">
    </template>
    <template v-else>
        <button class="font-12 font-md-14 btn btn-outline-primary" v-on:click="handleClickInputFile">Upload</button>
        <input :id="name" type="file" class="d-none form-control" @change="convertBase64" :accept="accept ? accept : 'image/x-png,image/gif,image/jpeg'">
    </template>
    
</div>
</template>

<script>
export default {
    props: {
        name: '',
        accept: '',
    },
    methods: {
        handleClickInputFile(e) {
            document.getElementById(this.name).click();
        },
        convertBase64: function(event){
            let thiz=this
            try{
                let reader = new FileReader(); 
                reader.readAsDataURL(event.target.files[0]); 
                reader.onloadend = function(){ 
                    thiz.$emit('onChangeFile', { base64String: this.result, name: thiz.name });
                }

            }catch(err){
                this.$emit('onChangeFile', { base64String: '', name: thiz.name });
            }
        },
    }
}
</script>

