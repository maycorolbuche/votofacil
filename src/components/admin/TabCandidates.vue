<template>
  <BTab title="Candidatos" class="py-0">
    <BCardText class="m-0">
      <div class="d-flex align-items-center">
        <div style="flex: 1">
          <BFormInput
            placeholder="Nome do(a) candidato(a)"
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

    <div class="overflow d-flex flex-column" style="flex: 1">
      <BTable
        hover
        sticky-header="initial"
        :items="candidates"
        :fields="[
          {
            key: 'position',
            label: 'Colocação',
            sortable: true,
            class: 'text-end',
          },
          {
            key: 'sequence',
            label: 'Nº',
            sortable: true,
            class: 'text-end',
          },
          {
            key: 'name',
            label: 'Nome',
            sortable: true,
          },
          {
            key: 'total_votes',
            label: 'Votos',
            sortable: true,
            class: 'text-end',
          },
          {
            key: 'options',
            label: '',
          },
        ]"
      >
        <template #cell(position)="row">
          <div
            class="d-flex align-items-center justify-content-end"
            style="margin-top: -6px; margin-bottom: -6px; height: 38px"
          >
            <BAvatar
              :style="
                'background-color: ' +
                position_color(row.item.position)[0] +
                ' !important;' +
                'color: ' +
                position_color(row.item.position)[1] +
                ' !important'
              "
              size="34px"
              :text="row.item.position + 'º'"
            />
          </div>
        </template>

        <template #cell(total_votes)="row">
          <BBadge
            v-if="row.item.admin_votes && row.item.user_votes"
            variant="muted"
            class="text-muted"
          >
            {{ row.item.user_votes }}
          </BBadge>
          <BBadge v-if="row.item.admin_votes" variant="warning">
            +{{ row.item.admin_votes }}
          </BBadge>
          {{ row.item.total_votes }}
        </template>

        <template #cell(options)="row">
          <div
            class="text-end"
            v-if="
              !candidate_deleting.includes(row.item.id) &&
              !candidate_updating.includes(row.item.id)
            "
          >
            <BLink
              @click="
                candidate_update_data = Object.assign({}, row.item);
                candidate_update_modal = !candidate_update_modal;
              "
            >
              <svg
                style="width: 24px; fill: var(--bs-warning)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <title>Editar</title>
                <path
                  d="M15 16L11 20H21V16H15M12.06 7.19L3 16.25V20H6.75L15.81 10.94L12.06 7.19M5.92 18H5V17.08L12.06 10L13 10.94L5.92 18M18.71 8.04C19.1 7.65 19.1 7 18.71 6.63L16.37 4.29C16.17 4.09 15.92 4 15.66 4C15.41 4 15.15 4.1 14.96 4.29L13.13 6.12L16.88 9.87L18.71 8.04Z"
                />
              </svg>
            </BLink>
            <BLink @click="delete_candidate(row.item.id)">
              <svg
                style="width: 24px; fill: var(--bs-danger)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <title>Excluir</title>
                <path
                  d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
                />
              </svg>
            </BLink>
          </div>
          <div v-else class="text-end">
            <BSpinner
              small
              :variant="
                candidate_deleting.includes(row.item.id) ? 'danger' : 'warning'
              "
              class="mx-1"
            />
          </div>
        </template>
      </BTable>
    </div>

    <BCardText class="m-0">
      <div class="d-flex align-items-center">
        <div style="flex: 1"></div>
        <div class="ps-2">
          <BButton
            :disabled="candidate_deleting_all_loading"
            class="w-100 my-2"
            variant="danger"
            @click="delete_all_candidate()"
          >
            <svg
              v-if="!candidate_deleting_all_loading"
              style="width: 20px; fill: white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
              />
            </svg>
            <BSpinner v-else small class="mx-1" />
            Apagar todos
          </BButton>
        </div>
      </div>
    </BCardText>

    <BModal
      v-model="candidate_update_modal"
      title="Alterar candidato"
      @ok="update_candidate"
      cancel-title="Cancelar"
      ok-title="Confirmar"
    >
      <BFormGroup label="Nome:">
        <BFormInput
          placeholder="Digite o nome"
          v-model="candidate_update_data.name"
        />
      </BFormGroup>
      <BFormGroup label="Qtd. Votos">
        <BFormInput v-model="candidate_update_data.admin_votes" type="number" />
      </BFormGroup>
    </BModal>
  </BTab>
</template>

<script>
import Api from "@/services/Api.js";
import Position from "@/helpers/Position.js";
import Swal from "sweetalert2";

export default {
  props: {
    data: Object,
  },
  data: () => ({
    candidate_name_new: null,
    candidate_name_new_loading: false,
    candidate_name_new_error: null,

    candidate_update_data: [],
    candidate_update_modal: false,
    candidate_updating: [],

    candidate_deleting_all_loading: false,
    candidate_deleting: [],
  }),
  computed: {
    candidates() {
      const candidates = this.data?.room?.candidates || [];
      const candidateIds = candidates.map((c) => c.id);
      this.candidate_deleting = this.candidate_deleting.filter((id) =>
        candidateIds.includes(id)
      );
      this.candidate_updating = this.candidate_updating.filter((id) =>
        candidateIds.includes(id)
      );
      return candidates.map((candidate) => {
        if (this.candidate_deleting.includes(candidate.id)) {
          return { ...candidate, _rowVariant: "danger" };
        }
        if (this.candidate_updating.includes(candidate.id)) {
          return { ...candidate, _rowVariant: "warning" };
        }
        return candidate;
      });
    },
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
  watch: {
    data: {
      handler(newVal) {
        this.candidate_updating = [];
      },
      deep: true,
    },
  },
  methods: {
    async add_candidate() {
      this.candidate_name_new_error = null;

      if (!this.candidate_name_new) {
        this.candidate_name_new_error = "Informe o nome do(a) candidato(a)!";
        return;
      }

      this.candidate_name_new_loading = true;
      let self = this;
      await Api.post(
        "/admin/candidate",
        { name: this.candidate_name_new },
        function (status, data) {
          self.candidate_name_new_loading = false;

          if (!status) {
            self.candidate_name_new_error = data;
            return;
          }

          self.candidate_name_new = null;
          self.$emit("save");
        }
      );
    },
    async update_candidate() {
      if (!this.candidate_update_data.name) {
        Swal.fire({ title: "Nome não informado!", icon: "error" });
        return;
      }

      let id = this.candidate_update_data.id;
      this.candidate_updating.push(id);

      let self = this;
      await Api.patch(
        "/admin/candidate",
        { ...this.candidate_update_data },
        function (status, data) {
          if (!status) {
            Swal.fire({ title: data, icon: "error" });
            const index = self.candidate_updating.indexOf(id);
            if (index !== -1) {
              self.candidate_updating.splice(index, 1);
            }
            return;
          }

          self.$emit("save");
        }
      );
    },
    async delete_candidate(id) {
      Swal.fire({
        title: "Deseja realmente apagar este(a) candidato(a)?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.candidate_deleting.push(id);

          let self = this;
          Api.delete("/admin/candidate", { id }, function (status, data) {
            if (!status) {
              Swal.fire({ title: data, icon: "error" });
              const index = self.candidate_deleting.indexOf(id);
              if (index !== -1) {
                self.candidate_deleting.splice(index, 1);
              }
              return;
            }

            self.$emit("save");
          });
        }
      });
    },
    async delete_all_candidate() {
      Swal.fire({
        title: "Deseja realmente apagar todos os candidatos?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.candidate_deleting_all_loading = true;

          let self = this;
          Api.delete("/admin/candidate", null, function (status, data) {
            self.candidate_deleting_all_loading = false;

            if (!status) {
              Swal.fire({ title: data, icon: "error" });
              return;
            }

            self.data.room.candidates = [];
            self.$emit("save");
          });
        }
      });
    },
    position_color(num) {
      return Position.color(num);
    },
  },
};
</script>
