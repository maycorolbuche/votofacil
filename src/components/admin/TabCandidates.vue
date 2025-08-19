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
            list="list-names"
          />
          <datalist
            v-if="
              data?.configs?.candidates.items?.repeated_names?.value == 'vote'
            "
            id="list-names"
          >
            <option v-for="candidate in candidates" :key="candidate.id">
              {{ candidate.name }}
            </option>
          </datalist>
        </div>
        <div class="ps-2">
          <BButton
            :disabled="candidate_name_new_loading"
            class="w-100 my-2"
            variant="dark"
            @click="add_candidate()"
          >
            <PlusThickIcon
              v-if="!candidate_name_new_loading"
              :size="20"
              color="#FFF"
            />
            <BSpinner v-else small class="ms-1" />
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

    <BProgress
      v-if="candidate_loading"
      variant="info"
      :value="100"
      height="5px"
      striped
      animated
    />
    <div v-else style="height: 5px" />

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
              v-if="data?.resume?.total_votes"
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
            <BAvatar v-else size="34px" text="." />
          </div>
        </template>

        <template #cell(total_votes)="row">
          <BPopover
            v-if="
              row.item.admin_votes &&
              row.item.admin_votes == row.item.total_votes
            "
          >
            <template #target>
              <BBadge variant="warning">
                {{ row.item.total_votes }}
              </BBadge>
            </template>
            Votos do administrador: <b>{{ row.item.admin_votes }}</b>
          </BPopover>
          <BPopover
            v-else-if="
              row.item.user_votes && row.item.user_votes == row.item.total_votes
            "
          >
            <template #target>
              <BBadge variant="info">
                {{ row.item.total_votes }}
              </BBadge>
            </template>
            Votos dos usuários: <b>{{ row.item.user_votes }}</b>
          </BPopover>
          <BPopover v-else-if="row.item.user_votes && row.item.admin_votes">
            <template #target>
              <BBadge variant="danger">
                {{ row.item.total_votes }}
              </BBadge>
            </template>
            Votos do administrador: <b>{{ row.item.admin_votes }}</b>
            <br />Votos dos usuários: <b>{{ row.item.user_votes }}</b>
          </BPopover>
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
              <RenameOutline color="var(--bs-warning)" />
            </BLink>
            <BLink @click="delete_candidate(row.item.id)">
              <TrashCanOutline color="var(--bs-danger)" />
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
        <div class="ps-2 d-flex align-items-center" style="gap: 5px">
          <BButton
            :disabled="candidate_import_loading"
            class="w-100 my-2"
            variant="info"
            @click="import_candidate()"
          >
            <TextBoxCheckOutline v-if="!candidate_import_loading" :size="20" />
            <BSpinner v-else small class="mx-1" />
            Importar Nomes
          </BButton>
          <BButton
            :disabled="candidate_deleting_all_loading"
            class="w-100 my-2"
            variant="danger"
            @click="delete_all_candidate()"
          >
            <TrashCanOutlineIcon
              v-if="!candidate_deleting_all_loading"
              :size="20"
            />
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

import PlusThickIcon from "@/components/icons/PlusThick.vue";
import RenameOutlineIcon from "@/components/icons/RenameOutline.vue";
import TrashCanOutlineIcon from "@/components/icons/TrashCanOutline.vue";
import TextBoxCheckOutlineIcon from "@/components/icons/TextBoxCheckOutline.vue";

export default {
  components: {
    PlusThickIcon,
    RenameOutlineIcon,
    TrashCanOutlineIcon,
    TextBoxCheckOutlineIcon,
  },
  props: {
    data: Object,
  },
  data: () => ({
    candidate_loading: false,

    candidate_name_new: null,
    candidate_name_new_loading: false,
    candidate_name_new_error: null,

    candidate_update_data: [],
    candidate_update_modal: false,
    candidate_updating: [],

    candidate_deleting_all_loading: false,
    candidate_deleting: [],

    candidate_import_loading: false,
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
        if (!this.candidate_import_loading) {
          this.candidate_loading = false;
        }
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
      this.candidate_loading = true;
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
          self.candidate_loading = true;
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
    async import_candidate() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt";
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        this.candidate_import_loading = true;
        this.candidate_loading = true;
        try {
          const text = await file.text();
          const names = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

          this.candidate_loading = true;
          let self = this;
          await Api.post(
            "/admin/candidate",
            { name: names },
            function (status, data) {
              self.candidate_loading = true;
              self.candidate_import_loading = false;
              self.$emit("save");
            }
          );
        } catch (e) {
          Swal.fire({
            title: "Erro ao importar arquivo",
            text: e.message,
            icon: "error",
          });
          this.candidate_loading = false;
          this.candidate_import_loading = false;
        }
      };
      input.click();
    },
    position_color(num) {
      let ret = Position.color(num);
      if (!ret || !Array.isArray(ret) || ret.length < 2) {
        ret = ["#000", "#FFF"];
      }
      return ret;
    },
  },
};
</script>
