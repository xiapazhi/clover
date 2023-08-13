<template>
   <div class="limit-wide" id="ctop" style="min-height:calc(100vh - 72px)">
      <Warning :getContent="getContent" />
      <Content v-if="showContent" :showContent="showContent" :onClose="closeContent" />
      <template v-for="(c, index) in content">
         <div :key="index" class="content">
            <v-list-item>
               <!-- <v-list-item-avatar> -->
               <div style="position:relative;top:12px">
                  <!-- 以发布时间确定的随机头像 -->
                  <!-- <img :src="'https://api.multiavatar.com/'+c.publishValue+'.svg'" title="匿名者" /> -->

                  <!-- 使用 img 引入的 svg 不好调整颜色 -->
                  <!-- <img
                     :src="'/up-square.svg'"
                     title="匿名者"
                     height="56"
                     :class="c.like - c.disgust < 0?'down-square':''"
                  />-->

                  <!-- 直接引入 svg  -->
                  <svg
                     t="1638172445966"
                     :class="c.manner < 0?'down-square':''"
                     viewBox="0 0 1024 1024"
                     version="1.1"
                     xmlns="http://www.w3.org/2000/svg"
                     p-id="10349"
                     xmlns:xlink="http://www.w3.org/1999/xlink"
                     width="56"
                     height="56"
                  >
                     <path
                        d="M888.490667 63.488a72.106667 72.106667 0 0 1 72.106666 72.021333v753.066667c0 39.808-32.213333 72.021333-71.978666 72.021333H135.509333a71.936 71.936 0 0 1-72.021333-71.978666V135.509333c0-39.808 32.213333-72.021333 72.021333-72.021333h752.981334z m-129.28 525.098667l-221.013334-235.818667A35.754667 35.754667 0 0 0 512 341.461333a35.84 35.84 0 0 0-26.282667 11.434667l-221.013333 235.776a36.010667 36.010667 0 0 0 52.48 49.322667L512 430.208l194.688 207.658667a36.010667 36.010667 0 0 0 52.48-49.28z"
                        :fill="c.manner > 0?`rgba(0,${c.manner},0)`:`rgba(${Math.abs(c.manner)},0,0)`"
                        opacity=".65"
                        p-id="10350"
                     />
                  </svg>
                  <!-- 将 vs 置于头像徽记 -->
                  <!-- <v-badge
                     :content="`${c.like} vs ${c.disgust}`"
                     color="green"
                     overlap
                     left
                     offset-x="-6"
                     offset-y="6"
                  />-->

                  <!-- <img /> -->
                  <!-- {{c.like - c.disgust}} -->
               </div>
               <!-- </v-list-item-avatar> -->
               <v-list-item-content>
                  <div style="padding-left:12px;">
                     <div @click="()=> visitContent(c)" style="cursor:pointer">
                        <v-list-item-title>
                           <a style="font-size:large">{{c.title}}</a>
                        </v-list-item-title>
                        <div style="font-size:small;margin:4px 0">
                           {{c.fromNow}} / {{c.commentCount}} 回应
                           <span style="font-size:1px">
                              /
                              <span style="color:#02b340;opacity:0.8">{{`${c.like}`}} ↑ v</span>
                              <span style="color:#f52443;opacity:0.8">s ↓ {{`${c.disgust}`}}</span>
                           </span>
                        </div>
                        <!-- <v-list-item-subtitle> -->
                        <div class="sub-content">{{c.simpleText}}</div>
                        <!-- </v-list-item-subtitle> -->
                     </div>
                     <div v-if="c.imgList.length">
                        <!-- 图片排列方式 1 -->
                        <img
                           id="zoomable"
                           v-for="(img, imgIndex) in c.imgList"
                           :key="imgIndex"
                           heigh="180"
                           style="max-width:32%;height:160px;margin:6px 4px;border-radius:6px"
                           :src="img"
                        />
                        <!-- 图片排列方式 2 -->
                        <!-- <v-row>
                           <v-col
                              v-for="(img, imgIndex) in c.imgList"
                              :key="imgIndex"
                              class="d-flex child-flex"
                              cols="4"
                           >
                              <v-img
                                 contain
                                 :src="img"
                                 lazy-src="https://bad.src/not/valid"
                                 width="100%"
                                 height="210"
                              ></v-img>
                           </v-col>
                        </v-row>-->
                     </div>
                  </div>
               </v-list-item-content>
            </v-list-item>
         </div>
      </template>
      <div
         v-if="!loading && !content.length"
         style="height:calc(100vh - 46px);display:flex;align-items:center;justify-content:center"
      >
         <img src="/no_data.jpg" height="277" />
         <div>内容荒漠，赶快发布相关内容，获取回应吧~</div>
      </div>
      <div style="overflow:auto">
         <div v-if="pageCount > 1" style="float:right;margin-bottom:12px">
            <v-pagination
               style="justify-content:end"
               v-model="curPage"
               :total-visible="7"
               :length="pageCount"
            ></v-pagination>
         </div>
      </div>
   </div>
</template>

<script>
import Warning from "./Warning.vue";
import Content from "./Content.vue";
import mediumZoom from "medium-zoom";
import superAgent from "superagent";
import moment from "moment";
import Bus from "../Bus";

export default {
   name: "ContentList",
   components: {
      Warning,
      Content,
   },
   props: {
      isShowNewContent: {
         type: Boolean,
      },
   },
   data: () => ({
      content: [],
      loading: false,
      showContent: null,
      pageCount: 0,
      curPage: 1,
   }),
   created() {
      Bus.$on("KEY_WORDS", (keywords) => {
         this.keywords = keywords;
         this.getContent();
      });
   },
   mounted() {
      mediumZoom(document.querySelector("#zoomable"));
      // this.$socket.emit("test_ping", "Test ping...");
   },
   sockets: {
      // pingSuccess(msg) {
      //    console.info(msg);
      // },
      mannerUpdate(data) {
         let nextContent = this.content;
         let corContent = nextContent.find((nc) => nc.id == data.id);
         if (corContent) {
            corContent = Object.assign(corContent, data);
            this.content = nextContent;
         }
         if (this.showContent && this.showContent.id == data.id) {
            this.showContent = Object.assign(this.showContent, data);
         }
      },
      commentUpdate(data) {
         console.log(data);
         let nextContent = this.content;
         let corContent = nextContent.find((nc) => nc.id == data.contentId);
         if (corContent) {
            corContent.commentCount = parseInt(corContent.commentCount) + 1;
            this.content = nextContent;
         }
      },
   },
   watch: {
      isShowNewContent: function (newV, oldV) {
         if (!newV && oldV) {
            this.getContent();
         }
      },
      curPage: function () {
         this.getContent();
      },
      loading: function (state) {
         Bus.$emit("CONTENT_LOADING", state);
      },
   },
   methods: {
      async getContent() {
         this.loading = true;
         try {
            const contentRes = await superAgent.get("/_api/content").query({
               page: this.curPage - 1,
               keywords: this.keywords,
            });
            if (contentRes.status == 200) {
               const { list, pageCount } = contentRes.body;
               let data = [];
               list.forEach((c) => {
                  let imgList = this.getImgSrc(c.content);
                  let simpleText = this.getSimpleText(c.content);
                  data.push({
                     ...c,
                     manner: c.like - c.disgust,
                     fromNow: moment(c.publishTime).fromNow(),
                     imgList,
                     simpleText,
                     publishValue: moment(c.publishTime).valueOf(),
                  });
               });
               this.content = data;
               this.pageCount = pageCount;
               window.location.hash = "#ctop";
               setTimeout(() => {
                  mediumZoom(document.querySelectorAll("#zoomable"));
                  window.location.hash = "";
               }, 0);
            }
         } catch (error) {
            //
         }
         this.loading = false;
      },
      getImgSrc(rich) {
         let imgList = [];
         rich.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/g, (match, capture) => {
            imgList.push(capture);
         });
         return imgList;
      },
      getSimpleText(rich) {
         var msg = rich.replace(/<.+?>/g, "").replace(/\s+/g, "");
         return msg;
      },
      visitContent(c) {
         this.showContent = c;
      },
      closeContent() {
         this.showContent = null;
      },
   },
};
</script>

<style scoped lang="scss">
.content {
   margin: 24px;
   .v-list-item {
      align-items: unset;
      .down-square {
         transform: rotate(180deg);
      }
   }
   .sub-content {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      word-break: break-all;
      color: #b4b4b4;
      margin-bottom: 8px;
   }
}
.content:hover {
   background-color: #fbfcfd;
}
</style>

<style lang="scss">
.v-pagination {
   justify-content: end;
}
</style>
