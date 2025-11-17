<template>
  <BTab title="Projetar" class="py-0">
    <div class="overflow overflow-auto d-flex flex-column" style="flex: 1">
      <BForm class="py-3">
        <h2 style="color: #888">Tela de Projeção</h2>
        <div>
          Link para projeção, para que os usuários acompanhem a votação em tempo
          real.
        </div>

        <BCardText class="m-0">
          <div class="d-flex align-items-center">
            <div style="flex: 1"></div>
            <div class="ps-2 d-flex align-items-center" style="gap: 5px">
              <BButton
                :disabled="generate_link_loading"
                class="w-100 my-2"
                variant="info"
                @click="generate_link()"
              >
                <LinkPlusIcon v-if="!generate_link_loading" :size="20" />
                <BSpinner v-else small class="mx-1" />
                Gerar Link
              </BButton>
            </div>
          </div>
        </BCardText>
      </BForm>

      <BButton
        :disabled="remove_link_loading"
        class="w-100 my-2"
        variant="info"
        @click="remove_link()"
      >
        <LinkPlusIcon v-if="!generate_link_loading" :size="20" />
        <BSpinner v-else small class="mx-1" />
        DELETAR Link
      </BButton>
      ....{{ data.view.hash }}....
      <pre>{{ data }}</pre>
    </div>
  </BTab>
</template>

<script>
import Api from "@/services/Api.js";
import Swal from "sweetalert2";

import LinkPlusIcon from "@/components/icons/LinkPlus.vue";

export default {
  components: {
    LinkPlusIcon,
  },
  props: {
    data: Object,
  },
  data: () => ({
    generate_link_loading: false,
    remove_link_loading: false,
    processing: 0,
  }),
  watch: {
    data: {
      handler(newVal) {
        if (this.processing == 0) {
          this.generate_link_loading = false;
          this.remove_link_loading = false;
        }
      },
      deep: true,
    },
  },
  methods: {
    async generate_link() {
      if (this.generate_link_loading == true) return;

      this.generate_link_loading = true;
      this.processing++;

      let self = this;
      await Api.post("/admin/view", {}, function (status, data) {
        self.processing--;
        console.log(status, data);

        if (!status) {
          Swal.fire({ title: data, icon: "error" });
          self.generate_link_loading = false;
          return;
        }

        self.$emit("save");
      });
    },
    async remove_link() {
      if (this.remove_link_loading == true) return;

      Swal.fire({
        title: "Deseja revogar este link?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.remove_link_loading = true;
          this.processing++;

          let self = this;
          Api.delete("/admin/view", {}, function (status, data) {
            self.processing--;
            console.log(status, data);

            if (!status) {
              Swal.fire({ title: data, icon: "error" });
              self.remove_link_loading = false;
              return;
            }

            self.$emit("save");
          });
        }
      });
    },
  },
};
</script>
