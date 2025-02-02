<script lang="ts">
import HSButton from '@components/Primitives/Hashi/HSButton.vue'
import { renderSpotlight } from '@fixtures/ui/renderSpotLight'

type Data = {
  daoName: string
  fetching?: boolean
  valid?: boolean
}

let timer: NodeJS.Timeout

export default {
  name: 'AlmostThere',
  components: { HSButton },
  props: {
    namePreset: String,
    containerId: {
      type: String,
      required: true,
    },
  },
  data: () =>
    ({
      daoName: '',
      fetching: undefined,
      valid: undefined,
    }) as Data,
  methods: {
    async verifySiteName() {
      clearTimeout(timer)
      if (this.daoName === '') {
        this.valid = undefined
        return
      }
      timer = setTimeout(async () => {
        this.fetching = true
        const res = await fetch(`/api/verifySiteName/${this.daoName}`)
        this.fetching = false
        const successful = res.ok
        this.valid = successful
      }, 300)
    },
  },
  mounted() {
    renderSpotlight({ containerId: this.containerId })
    if (this.namePreset) {
      this.daoName = this.namePreset
      this.verifySiteName()
    }
  },
  computed: {
    network() {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('network')
    },
    address() {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('address')
    },
  },
}
</script>

<template>
  <div class="relative grid justify-center p-4 md:p-0">
    <section class="my-16 grid gap-8 text-center md:my-32">
      <h1 class="text-2xl font-bold md:text-5xl">
        It All Starts with a Domain
      </h1>
      <p>You can use your preferred domain for your club.</p>
    </section>

    <div class="grid justify-center gap-16 md:gap-32">
      <section>
        <div
          :class="`relative grid items-center gap-4 rounded-md bg-surface-200 p-4 shadow md:grid-flow-col ${
            fetching
              ? 'animate-pulse cursor-progress'
              : valid === true
                ? 'bg-success-300'
                : valid === false
                  ? 'bg-danger-300'
                  : ''
          }`"
        >
          <label class="hs-form-field is-filled mb-0">
            <input
              class="hs-form-field__input"
              :value="daoName"
              @input="
                (evt) =>
                  (daoName =
                    (
                      evt.target as undefined | HTMLInputElement
                    )?.value.toLowerCase() ?? '')
              "
              id="daoname"
              name="daoname"
              placeholder="Enter your DAO name"
              pattern="^[a-z|0-9|-]{3,42}$"
              required
              type="text"
              @keyup="verifySiteName"
              autocapitalize="off"
            />
          </label>
          <span class="ml-1 text-lg font-bold">.clubs.place</span>
          <p
            v-if="fetching === false && typeof valid === 'boolean'"
            class="absolute left-0 top-[100%] mt-2 rounded-md bg-white p-2 text-sm"
          >
            <span v-if="valid === true" class="text-[#30a83d]"
              >Domain available</span
            >
            <span v-if="valid === false" class="text-error-400"
              >Domain unavailable</span
            >
          </p>
        </div>
      </section>

      <section>
        <HSButton
          v-if="fetching === false && valid"
          type="filled large fullwidth"
          :link="`/connect/${daoName}`"
          >Continue</HSButton
        >
        <HSButton
          v-if="fetching || !valid"
          type="filled large fullwidth"
          isDisabled="true"
          >Continue</HSButton
        >
      </section>
    </div>
  </div>
</template>

<style scoped>
input[type='text'] {
  text-transform: lowercase;
}
</style>
