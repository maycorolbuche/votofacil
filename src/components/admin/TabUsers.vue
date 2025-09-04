<template>
  <BTab class="content-container">
    <template #title>
      <BSpinner v-if="processing" small type="grow" />
      Eleitores
    </template>

    <BAccordion class="h-100">
      <BAccordionItem
        v-for="(status_data, status) in status_list"
        :key="status"
        :visible="status_data.visible"
      >
        <template #title>
          <strong>{{ status_data.title }}</strong> &nbsp;
          <BBadge :variant="status_data.color">
            {{ users_grouped[status]?.length || 0 }}
          </BBadge>
        </template>
        <div class="overflow d-flex flex-column" style="flex: 1">
          <BTable
            hover
            sticky-header="initial"
            :items="users_grouped[status]"
            :fields="[
              {
                key: 'name',
                label: 'Nome',
                sortable: true,
              },
              {
                key: 'options',
                label: '',
              },
            ]"
          >
            <template #cell(name)="row">
              {{ row.item.name }}
              <BPopover>
                <template #target>
                  <BBadge v-if="!row.item.is_primary" variant="warning">
                    <div class="d-flex align-items-center">
                      <CellphoneIcon :size="16" />
                      <div>{{ row.item.device.primary_user.name }}</div>
                    </div>
                  </BBadge>
                </template>
                Usuário vinculado ao aparelho de
                <strong>{{ row.item.device.primary_user.name }}</strong>
              </BPopover>
            </template>

            <template #cell(options)="row">
              <div
                class="text-end"
                v-if="
                  !user_deleting.includes(row.item.id) &&
                  !user_updating.includes(row.item.id) &&
                  !user_approving.includes(row.item.id) &&
                  !user_disapproving.includes(row.item.id)
                "
              >
                <!--
                <BLink
                  @click="
                    user_update_data = Object.assign({}, row.item);
                    user_update_modal = !user_update_modal;
                  "
                >
                  <RenameOutlineIcon color="var(--bs-warning)" />
                </BLink>
                <BLink @click="delete_user(row.item.id)">
                  <TrashCanOutlineIcon color="var(--bs-danger)" />
                </BLink>
                -->

                <div v-if="status === 'pending'">
                  <BButton
                    variant="success"
                    size="sm"
                    class="mx-1"
                    @click="approve_user(row.item.id)"
                  >
                    <CheckBoldIcon color="#FFF" :size="15" />
                    Aprovar
                  </BButton>
                  <BButton
                    variant="danger"
                    size="sm"
                    class="mx-1"
                    @click="disapprove_user(row.item.id)"
                  >
                    <CloseThickIcon color="#FFF" :size="15" />
                    Negar
                  </BButton>
                </div>
              </div>
              <div v-else class="text-end">
                <BSpinner
                  small
                  :variant="
                    user_approving.includes(row.item.id)
                      ? 'success'
                      : user_approving.includes(row.item.id)
                      ? 'warning'
                      : 'danger'
                  "
                  class="mx-1"
                />
              </div>
            </template>
          </BTable>
        </div>
      </BAccordionItem>
    </BAccordion>
  </BTab>
</template>

<script>
import Api from "@/services/Api.js";
import Position from "@/helpers/Position.js";
import Swal from "sweetalert2";

import CellphoneIcon from "@/components/icons/Cellphone.vue";
import CheckBoldIcon from "@/components/icons/CheckBold.vue";
import CloseThickIcon from "@/components/icons/CloseThick.vue";

export default {
  components: {
    CellphoneIcon,
    CheckBoldIcon,
    CloseThickIcon,
  },
  props: {
    data: Object,
  },
  data: () => ({
    processing: 0,
    /*user_loading: false,

    user_name_new: null,
    user_name_new_loading: false,
    user_name_new_error: null,

    user_update_data: [],
    user_update_modal: false,
    */
    user_updating: [],
    /*
user_deleting_all_loading: false,
    */
    user_deleting: [],
    /*
    user_import_loading: false,*/

    user_approving: [],
    user_disapproving: [],
  }),
  computed: {
    status_list() {
      return {
        approved: {
          title: "Aprovados",
          color: "info",
          visible: this.users_grouped?.approved?.length > 0,
        },
        pending: {
          title: "Pendentes",
          color: "warning",
          visible:
            this.users_grouped?.approved?.length <= 0 &&
            this.users_grouped?.pending?.length > 0,
        },
        disapproved: {
          title: "Não autorizados",
          color: "danger",
          visible:
            this.users_grouped?.approved?.length <= 0 &&
            this.users_grouped?.pending?.length <= 0 &&
            this.users_grouped?.danger?.length > 0,
        },
      };
    },
    users() {
      const devices = this.data?.room?.devices || [];
      const users = devices.flatMap((device) => {
        // Find the primary user for this device
        const primaryUser = (device.users || []).find(
          (user) => user.is_primary
        );
        // Remove users array from device
        const deviceWithoutUsers = { ...device };
        delete deviceWithoutUsers.users;
        // Map users, attach device with primary_user only
        return (device.users || []).map((user) => ({
          ...user,
          status: device.status,
          device: {
            ...deviceWithoutUsers,
            primary_user: primaryUser || null,
          },
        }));
      });

      const userIds = users.map((c) => c.id);
      this.user_deleting = this.user_deleting.filter((id) =>
        userIds.includes(id)
      );
      this.user_updating = this.user_updating.filter((id) =>
        userIds.includes(id)
      );
      this.user_approving = this.user_approving.filter((id) =>
        userIds.includes(id)
      );
      this.user_disapproving = this.user_disapproving.filter((id) =>
        userIds.includes(id)
      );
      return users.map((user) => {
        if (this.user_deleting.includes(user.id)) {
          return { ...user, _rowVariant: "danger" };
        }
        if (this.user_updating.includes(user.id)) {
          return { ...user, _rowVariant: "warning" };
        }
        if (this.user_approving.includes(user.id)) {
          return { ...user, _rowVariant: "success" };
        }
        if (this.user_disapproving.includes(user.id)) {
          return { ...user, _rowVariant: "danger" };
        }
        return user;
      });
    },
    users_grouped() {
      return {
        approved: this.users.filter((user) => user.status === "approved") ?? [],
        pending: this.users.filter((user) => user.status === "pending") ?? [],
        disapproved:
          this.users.filter((user) => user.status === "disapproved") ?? [],
      };
    },
  },
  watch: {
    data: {
      handler(newVal) {
        if (this.processing == 0) {
          this.user_updating = [];
          this.user_approving = [];
          this.user_disapproving = [];
          if (!this.user_import_loading) {
            this.user_loading = false;
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    async approve_user(id) {
      this.user_approving.push(id);
      await this.change_status_user(id, "approved");
    },
    async disapprove_user(id) {
      this.user_disapproving.push(id);
      await this.change_status_user(id, "disapproved");
    },
    async change_status_user(id, status) {
      /*
      let self = this;
      await Api.patch(
        "/admin/user",
        { ...this.user_update_data },
        function (status, data) {
          if (!status) {
            Swal.fire({ title: data, icon: "error" });
            const index = self.user_updating.indexOf(id);
            if (index !== -1) {
              self.user_updating.splice(index, 1);
            }
            return;
          }

          self.$emit("save");
        }
      );
       */
    },
    /* async add_user() {
      this.user_name_new_error = null;

      if (!this.user_name_new) {
        this.user_name_new_error = "Informe o nome do(a) candidato(a)!";
        return;
      }

      this.user_name_new_loading = true;
      this.user_loading = true;
      let self = this;
      await Api.post(
        "/admin/user",
        { name: this.user_name_new },
        function (status, data) {
          self.user_name_new_loading = false;

          if (!status) {
            self.user_name_new_error = data;
            return;
          }

          self.user_name_new = null;
          self.user_loading = true;
          self.$emit("save");
        }
      );
    },
    async update_user() {
      if (!this.user_update_data.name) {
        Swal.fire({ title: "Nome não informado!", icon: "error" });
        return;
      }

      let id = this.user_update_data.id;
      this.user_updating.push(id);

      let self = this;
      await Api.patch(
        "/admin/user",
        { ...this.user_update_data },
        function (status, data) {
          if (!status) {
            Swal.fire({ title: data, icon: "error" });
            const index = self.user_updating.indexOf(id);
            if (index !== -1) {
              self.user_updating.splice(index, 1);
            }
            return;
          }

          self.$emit("save");
        }
      );
    },
    async delete_user(id) {
      Swal.fire({
        title: "Deseja realmente apagar este(a) candidato(a)?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.user_deleting.push(id);

          let self = this;
          Api.delete("/admin/user", { id }, function (status, data) {
            if (!status) {
              Swal.fire({ title: data, icon: "error" });
              const index = self.user_deleting.indexOf(id);
              if (index !== -1) {
                self.user_deleting.splice(index, 1);
              }
              return;
            }

            self.$emit("save");
          });
        }
      });
    },
    async delete_all_user() {
      Swal.fire({
        title: "Deseja realmente apagar todos os candidatos?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.user_deleting_all_loading = true;

          let self = this;
          Api.delete("/admin/user", null, function (status, data) {
            self.user_deleting_all_loading = false;

            if (!status) {
              Swal.fire({ title: data, icon: "error" });
              return;
            }

            self.data.room.users = [];
            self.$emit("save");
          });
        }
      });
    },
    async import_user() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt";
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        this.user_import_loading = true;
        this.user_loading = true;
        try {
          const text = await file.text();
          const names = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

          this.user_loading = true;
          let self = this;
          await Api.post(
            "/admin/user",
            { name: names },
            function (status, data) {
              self.user_loading = true;
              self.user_import_loading = false;
              self.$emit("save");
            }
          );
        } catch (e) {
          Swal.fire({
            title: "Erro ao importar arquivo",
            text: e.message,
            icon: "error",
          });
          this.user_loading = false;
          this.user_import_loading = false;
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
    },*/
  },
};
</script>

<style>
.content-container .accordion-item {
  max-height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
}
.content-container .accordion-item .collapse:not(.collapsing),
.content-container .accordion-item .collapse:not(.collapsing) .accordion-body {
  flex: 1;
  height: 0;
  display: flex;
  flex-direction: column;
}
</style>
