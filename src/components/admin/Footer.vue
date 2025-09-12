<template>
  <div>
    <BCard
      no-body
      class="m-2 p-2 d-flex align-items-center flex-nowrap flex-row"
    >
      <div class="overflow-auto">
        <BCardText class="text-truncate m-0 small">Código da Sala:</BCardText>
        <BCardTitle class="text-truncate m-0">
          {{ data?.room?.code }}
        </BCardTitle>
      </div>
      <div
        class="overflow-auto d-flex align-items-center justify-content-center"
        style="flex: auto"
      >
        <div>
          <BBadge class="text-truncate w-100"> Votos </BBadge>
          <div class="d-flex align-items-center justify-content-center">
            <div
              v-if="data?.resume?.admin_votes && data?.resume?.user_votes"
              class="d-flex align-items-center mx-1 px-1 border-end"
              style="gap: 5px"
            >
              <TicketAccountIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.admin_votes }}
              </BCardTitle>
            </div>
            <div
              v-if="data?.resume?.admin_votes && data?.resume?.user_votes"
              class="d-flex align-items-center mx-1 px-1 border-end"
              style="gap: 5px"
            >
              <VoteIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.user_votes }}
              </BCardTitle>
            </div>
            <div class="d-flex align-items-center mx-1 px-1" style="gap: 5px">
              <BallotOutline color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_votes }}
              </BCardTitle>
            </div>
          </div>
        </div>
        <div class="border-start ms-1 ps-1">
          <BBadge class="text-truncate w-100"> Candidatos </BBadge>
          <div class="d-flex align-items-center justify-content-center">
            <div class="d-flex align-items-center mx-1 px-1" style="gap: 5px">
              <CardAccountDetailsIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_candidates }}
              </BCardTitle>
            </div>
          </div>
        </div>
        <div class="border-start ms-1 ps-1">
          <BBadge class="text-truncate w-100"> Eleitores </BBadge>
          <div class="d-flex align-items-center justify-content-center">
            <div
              v-if="
                data?.resume?.total_approved_users !=
                data?.resume?.total_approved_devices
              "
              class="d-flex align-items-center mx-1 px-1 border-end"
              style="gap: 5px"
            >
              <CellphoneIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_approved_devices }}
              </BCardTitle>
            </div>
            <div class="d-flex align-items-center mx-1 px-1" style="gap: 5px">
              <AccountIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_approved_users }}
              </BCardTitle>
            </div>
          </div>
        </div>
      </div>
      <div>
        <BBadge v-if="is_local" variant="info" class="m-1">localhost</BBadge>
        <BBadge
          v-if="is_local"
          :variant="data?.cache ? 'warning' : 'danger'"
          class="m-1"
        >
          cache
        </BBadge>

        <WebIcon v-if="!lock && data?.cache" />
        <WebCheckIcon v-else-if="!lock" />
        <WebSyncIcon v-else />
      </div>
    </BCard>
  </div>
</template>

<script>
import Api from "@/services/Api.js";

import WebIcon from "@/components/icons/Web.vue";
import WebCheckIcon from "@/components/icons/WebCheck.vue";
import WebSyncIcon from "@/components/icons/WebSync.vue";
import TicketAccountIcon from "@/components/icons/TicketAccount.vue";
import VoteIcon from "@/components/icons/Vote.vue";
import BallotOutlineIcon from "@/components/icons/BallotOutline.vue";
import CardAccountDetailsIcon from "@/components/icons/CardAccountDetails.vue";
import AccountIcon from "@/components/icons/Account.vue";
import CellphoneIcon from "@/components/icons/Cellphone.vue";

export default {
  components: {
    WebIcon,
    WebCheckIcon,
    WebSyncIcon,
    TicketAccountIcon,
    VoteIcon,
    BallotOutlineIcon,
    CardAccountDetailsIcon,
    AccountIcon,
    CellphoneIcon,
  },
  props: {
    data: Object,
    lock: Boolean,
  },
  computed: {
    is_local() {
      return Api.is_local();
    },
  },
};
</script>
