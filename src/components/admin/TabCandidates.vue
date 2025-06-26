<template>
  <BTab title="Candidatos" active>
    <BCardText>
      <div class="d-flex align-items-center">
        <div style="flex: 1">
          <BFormInput
            placeholder="Nome do candidato"
            v-model="candidate_name_new"
            @keyup.enter="add_candidate()"
            :state="candidate_name_new_error ? false : null"
          />
        </div>
        <div class="ps-2">
          <BButton
            :disabled="candidate_name_new_loading"
            class="w-100 my-2"
            variant="dark"
            @click="add_candidate()"
          >
            <svg
              v-if="!candidate_name_new_loading"
              style="width: 20px; fill: white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M20 14H14V20H10V14H4V10H10V4H14V10H20V14Z" />
            </svg>
            <BSpinner v-else small class="mx-1" />
          </BButton>
        </div>
      </div>
      <BAlert
        v-model="has_candidate_name_new"
        variant="danger"
        class="w-100 mt-2"
        dismissible
      >
        {{ candidate_name_new_error }}
      </BAlert>
    </BCardText>

    <BCardText class="overflow-auto overflow">
      <pre>{{ data }}</pre>
      <p></p>
      <hr />
      Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents
      1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />
      Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents
      1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />
      Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents
      1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />
      Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents
      1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
      contents 1<br />Tab contents 1<br />
    </BCardText>
  </BTab>
</template>

<script>
import Api from "@/services/Api.js";

export default {
  props: {
    data: Object,
  },
  data: () => ({
    candidate_name_new: null,
    candidate_name_new_loading: false,
    candidate_name_new_error: null,
  }),
  computed: {
    has_candidate_name_new: {
      get() {
        return !!this.candidate_name_new_error;
      },
      set(value) {
        if (!value) {
          this.candidate_name_new_error = null;
        }
      },
    },
  },
  methods: {
    async add_candidate() {
      console.log("Adding candidate:", this.candidate_name_new);
      this.candidate_name_new_error = null;

      if (!this.candidate_name_new) {
        this.candidate_name_new_error = "Informe o nome da pessoa!";
        return;
      }

      this.candidate_name_new_loading = true;
      let self = this;
      await Api.post(
        "/admin/candidate",
        { name: this.candidate_name_new },
        function (status, data) {
          self.candidate_name_new_loading = false;
          console.log(status, data);

          if (!status) {
            self.candidate_name_new_error = data;
            return;
          }

          self.candidate_name_new = null;
          self.$emit("save");
        }
      );
    },
  },
};
</script>
