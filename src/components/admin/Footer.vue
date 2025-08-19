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
        style="flex: auto; gap: 10px"
      >
        <div>
          <BBadge class="text-truncate w-100"> Votos </BBadge>
          <div class="d-flex align-items-center justify-content-center">
            <div class="d-flex align-items-center" style="gap: 5px">
              <TicketAccountIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.admin_votes }}
              </BCardTitle>
            </div>
            <div
              class="d-flex align-items-center border-start ms-2 ps-2"
              style="gap: 5px"
            >
              <VoteIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.user_votes }}
              </BCardTitle>
            </div>
            <div
              class="d-flex align-items-center border-start ms-2 ps-2"
              style="gap: 5px"
            >
              <BallotOutline color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_votes }}
              </BCardTitle>
            </div>
          </div>
        </div>
      </div>
      <div>
        <WebIcon v-if="!lock && data?.cache" />
        <WebCheckIcon v-else-if="!lock" />
        <WebSyncIcon v-else />
      </div>
    </BCard>
  </div>
</template>

<script>
import WebIcon from "@/components/icons/Web.vue";
import WebCheckIcon from "@/components/icons/WebCheck.vue";
import WebSyncIcon from "@/components/icons/WebSync.vue";
import TicketAccountIcon from "@/components/icons/TicketAccount.vue";
import VoteIcon from "@/components/icons/Vote.vue";
import BallotOutlineIcon from "@/components/icons/BallotOutline.vue";

export default {
  components: {
    WebIcon,
    WebCheckIcon,
    WebSyncIcon,
    TicketAccountIcon,
    VoteIcon,
    BallotOutlineIcon,
  },
  props: {
    data: Object,
    lock: Boolean,
  },
};
</script>
