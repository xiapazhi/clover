<template>
   <v-dialog persistent width="320" :value="true" overlay-opacity="0.1">
      <v-card>
         <v-card-title class="text-h6">请输入所示验证码进行验证</v-card-title>
         <v-card-text>
            <v-img height="100" width="280" :src="imgSrc" @click="changeVC" style="cursor:pointer">
               <v-skeleton-loader v-if="!imgSrc" class="mx-auto" type="card"></v-skeleton-loader>
            </v-img>
            <v-text-field
               hide-details
               v-model="verificationCode"
               label="验证码"
               @keyup.enter="onVerification"
               :error-messages="verificationErr"
            ></v-text-field>
         </v-card-text>
         <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :loading="loading" color="green darken-1" @click="onVerification">确定</v-btn>
            <v-btn color="darken-1" @click="onClose">取消</v-btn>
         </v-card-actions>
      </v-card>
   </v-dialog>
</template>

<script>
import superAgent from "superagent";

export default {
   name: "VerificationCode",

   components: {},
   props: {
      verification: {
         type: Function,
      },
      onClose: {
         type: Function,
      },
   },
   data: () => ({
      verificationCode: "",
      imgSrc: "",
      loading: false,
      vcData: {},
      verificationErr: "",
   }),
   async mounted() {
      this.getVC();
   },
   methods: {
      async getVC() {
         this.loading = true;
         this.imgSrc = "";
         const vcRes = await superAgent.get("/_api/verificationCode");
         if (vcRes.statusCode == 200) {
            const data = vcRes.body;
            let blob = new Blob([data.captcha], {
               type: "image/svg+xml",
            });
            let fileUrl = URL.createObjectURL(blob);
            this.imgSrc = fileUrl;
            this.vcData = {
               uuid: data.uuid,
            };
         }
         this.loading = false;
      },
      async changeVC() {
         this.getVC();
      },
      onVerification() {
         if (!this.verificationCode) {
            this.verificationErr = "请输入验证码";
            return;
         }
         this.verification({
            verificationCode: this.verificationCode,
            ...this.vcData,
         });
      },
   },
};
</script>

<style lang="scss" scoped>
</style>

