<template>
   <div id="comment-list">
      <div id="editor-comment">
         <Comment v-if="!curCommentId" :contentId="showContent.id" :onCommentOver="onCommentOver" />
         <v-btn
            v-else
            style="margin:0px 0 12px;border-bottom:1px solid #02b340;color:#02b340"
            depressed
            block
            color="gray"
            @click="()=>curCommentId=null"
         >回应</v-btn>
      </div>
      <v-skeleton-loader
         v-if="loading && !commentList.length"
         type="list-item-avatar-three-line, image"
      />
      <template v-for="(c, i) in commentList">
         <div :key="i" :id="'comment-'+ c.id">
            <v-list-item>
               <v-list-item-avatar class="comment-avatar">
                  <img :src="'https://api.multiavatar.com/'+c.publishValue+'.svg'" title="匿名者" />
               </v-list-item-avatar>

               <v-list-item-content style="overflow:unset">
                  <div style="position:relative;clear:both">
                     <div
                        style="font-size:small;color:gray; margin-bottom: 8px;position:sticky;top:-1px;padding-top:1px;background:#fff"
                     >
                        <div
                           :style="`border-bottom: 1px solid ${trunCommentId == c.id?'#02b340':'lightgray'};display:inline-block;padding-bottom: 6px;`"
                        >
                           <span
                              v-if="c.corCommentPublishValue"
                              style="cursor:pointer"
                              @click="()=>trunComment(c.commentId)"
                           >
                              回复
                              <img
                                 :src="'https://api.multiavatar.com/'+c.corCommentPublishValue+'.svg'"
                                 alt="匿名者"
                                 style="height:26px;position:relative;top:2px;"
                              />
                              /
                           </span>
                           {{c.fromNow}}
                        </div>
                     </div>
                     <div v-html="c.content"></div>
                  </div>

                  <template v-if="c.id != curCommentId">
                     <div>
                        <v-btn
                           style="float:right;"
                           plain
                           rounded
                           @click="()=> curCommentId = c.id"
                        >回应</v-btn>
                     </div>
                     <v-divider></v-divider>
                  </template>

                  <div v-if="c.id == curCommentId">
                     <Comment
                        :contentId="showContent.id"
                        :onCommentOver="onCommentOver"
                        :cancelComment="cancelComment"
                        :renderId="c.id"
                        :commentId="c.id"
                     />
                  </div>
               </v-list-item-content>
            </v-list-item>
         </div>
      </template>
   </div>
</template>

<script>
import mediumZoom from "medium-zoom";
import moment from "moment";
import superAgent from "superagent";
import Comment from "./Comment.vue";

export default {
   name: "CommentList",

   components: {
      Comment,
   },
   props: {
      showContent: {
         type: Object,
      },
   },
   data: () => ({
      loading: false,
      commentList: [],
      curCommentId: null,
      trunCommentId: null,
   }),
   mounted() {
      this.getComment();
   },
   methods: {
      async getComment() {
         this.loading = true;
         try {
            // 获取评论并在有记录上次位置的情况下跳至对应位置
            let commentRslt = await superAgent.get("/_api/comment").query({
               contentId: this.showContent.id,
            });
            let nextCommentList = [];
            for (let c of commentRslt.body) {
               if (c.commentId) {
                  let corComment = commentRslt.body.find(
                     (b) => b.id == c.commentId
                  );
                  if (corComment) {
                     c.corCommentPublishValue = moment(
                        corComment.publishTime
                     ).valueOf();
                  }
               }
               c.fromNow = moment(c.publishTime).fromNow();
               c.publishValue = moment(c.publishTime).valueOf();
               nextCommentList.push(c);
            }
            this.commentList = nextCommentList;
            setTimeout(() => {
               mediumZoom(document.querySelectorAll("#comment-list img"));
            }, 3);
         } catch (error) {
            //
         }
         this.loading = false;
      },
      onCommentOver() {
         // 关闭对评论的回复富文本
         // 恢复或清空或重置对文章内容的富文本
         // 重新获取评论
         this.getComment();
         this.curCommentId = null;
      },
      cancelComment() {
         this.curCommentId = null;
      },
      trunComment(commentId) {
         window.location.hash = "";
         window.location.hash = "#comment-" + commentId;
         this.trunCommentId = commentId;
      },
   },
   beforeDestroy() {
      window.location.hash = "";
   },
};
</script>

<style lang="scss" scoped>
#comment-list {
   img {
      max-width: 100%;
   }
}
#editor-comment {
   margin-top: 24px;
}
.v-list-item {
   align-items: baseline;
   .v-list-item__avatar {
      align-self: self-start;
      top: 2px;
   }
}
.comment-avatar {
   position: sticky;
}
</style>

<style lang="scss">
#comment-list {
   img {
      max-width: 100%;
   }
}
.v-snack {
   z-index: 9999999 !important;
}
</style>