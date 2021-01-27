<template>
    <div class="container">
        <template v-if="error.statusCode === 404">
            <h1>Trang này không tồn tại</h1>
            <nuxt-link to="/">Về trang chủ</nuxt-link>
        </template>
        <h1 v-else>Lỗi không xác định</h1>
    </div>
</template>

<script>
export default {
    props: ['error'],
}   
</script>