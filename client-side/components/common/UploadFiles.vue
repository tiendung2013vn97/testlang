<template>
    <VueDropzone id="files" :options="dropzoneOptions" @vdropzone-file-added="addedFile" @vdropzone-removed-file="removeFile"/>
</template>
<script>
export default {
    props: {
        name: '',
        accept: '',
    },
    data() {
        return {
            dropzoneOptions: {
                url: 'https://httpbin.org/post',
                thumbnailWidth: 200,
                addRemoveLinks: true,
                dictDefaultMessage: "<div style='margin-top: -50px'><i class='mdi mdi-cloud-upload'></i> Chọn nhiều file</div>",
                acceptedFiles: this.accept ? this.accept : 'image/x-png,image/gif,image/jpeg,image/png',
            },
            files: [],
        }
    },
    methods: {
        addedFile: function(file) {
            try{
                let reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                        let binaryData = e.target.result;
                        this.files.push(window.btoa(binaryData));
                        this.$emit('onChangeFiles', { files: this.files, name: this.name });
                    }.bind(this);
                }.bind(this))(file);
                reader.readAsBinaryString(file);
            }catch(err){
                this.$emit('onChangeFiles', { files: this.files, name: this.name });
            }
        },
        removeFile: function(file) {
            try{
                let reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                        let binaryData = e.target.result;
                        let index = this.files.indexOf(window.btoa(binaryData));
 
                        if (index > -1) {
                           this.files.splice(index, 1);
                        }
                        this.$emit('onChangeFiles', { files: this.files, name: this.name });
                    }.bind(this);
                }.bind(this))(file);
                reader.readAsBinaryString(file);
            }catch(err){
                this.$emit('onChangeFiles', { files: this.files, name: this.name });
            }
        }
    }
}
</script>