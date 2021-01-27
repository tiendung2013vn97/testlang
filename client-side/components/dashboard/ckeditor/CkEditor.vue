<template>
    <vue-ckeditor 
        v-model="content" 
        :config="config" 
        @blur="onBlur($event)" 
        @focus="onFocus($event)"
        @contentDom="onContentDom($event)"
        @dialogDefinition="onDialogDefinition($event)"
        @fileUploadRequest="onFileUploadRequest($event)"
        @fileUploadResponse="onFileUploadResponse($event)" />
</template>
<script type="text/javascript">
import VueCkeditor from 'vue-ckeditor2';

export default {
    components: { VueCkeditor },
    props: {
        model: '',
        name: '',
    },
    data() {
        return {
            content: this.model,
            config: {
                toolbar: [
                    { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
                    { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
                    { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
                    { name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
                    '/',
                    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
                    { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
                    { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
                    { name: 'insert', items: [ 'Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
                    '/',
                    { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
                    { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                    { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
                    { name: 'others', items: [ '-' ] },
                    { name: 'about', items: [ 'About' ] }
                ],
                height: 300
            }
        };
    },
    methods: {
        onBlur(evt) {
        },
        onFocus(evt) {
        },
        onContentDom(evt) {
        },
        onDialogDefinition(evt) {
        },
        onFileUploadRequest(evt) {
        },
        onFileUploadResponse(evt) {
        }
    },
    watch: {
        content: function() {
            this.$emit('changeContent', { name: this.name, content: this.content });
        }
    }
}
</script>