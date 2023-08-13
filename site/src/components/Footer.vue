<template>
   <v-footer dark padless>
      <v-card class="flex" flat tile>
         <!-- <v-card-title class="teal">
            <strong class="subheading">Get connected with us on social networks!</strong>
         </v-card-title>-->

         <v-card-text class="py-2 white--text text-center">
            {{ new Date().getFullYear() }} ♡ 
            <strong>Asia4Chan </strong>
            <!-- <span>持续运行 3000 年 2 月 3 日 20 时 30 分 40 秒</span> -->
         </v-card-text>
      </v-card>
   </v-footer>
</template>

<script>

export default {
   name: "Footer",
   data: () => ({}),
};
</script>