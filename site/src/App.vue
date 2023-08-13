<template>
   <v-app>
      <v-main>
         <Header :showNewContent="showNewContent" />
         <ContentList :isShowNewContent="isShowNewContent" />
         <Footer />
         <ContentNew v-if="isShowNewContent" :showNewContent="showNewContent" />
      </v-main>
   </v-app>
</template>

<script>
// 绿色 #02b340
import Header from "./components/Header";
import ContentList from "./components/ContentList.vue";
import Footer from "./components/Footer.vue";
import ContentNew from "./components/ContentNew.vue";

export default {
   name: "App",

   components: {
      Header,
      ContentList,
      Footer,
      ContentNew,
   },

   data: () => ({
      isShowNewContent: false,
   }),
   methods: {
      showNewContent() {
         this.isShowNewContent = !this.isShowNewContent;
      },
   },
};
</script>

<style lang="scss">
html {
   overflow: auto;
}
.limit-wide {
   max-width: 933px;
   min-width: 844px;
   margin: auto;
}

.medium-zoom--opened {
   .medium-zoom-overlay {
      z-index: 998;
   }
   .medium-zoom-image--opened {
      z-index: 999;
   }
}
</style>
