<template>
  <b-modal
    id="world-boss-info"
    title
    size="md"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="modal-header d-flex">
      <div class="left-hearts"></div>
      <div class="quest_dysheartener_modal"></div>
      <div class="phobia_dysheartener_modal"></div>
      <div class="right-hearts"></div>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-12 text-center">
          <h2>{{ $t('whatIsWorldBoss') }}</h2>
          <p class="text-center">
            {{ $t('worldBossDesc') }}
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div
            v-for="bullet in bullets"
            :key="bullet"
            class="bullet-point d-flex align-items-center justify-content-left"
          >
            <div class="check-icon">
              <div
                class="svg-icon red-check"
                v-html="icons.redCheck"
              ></div>
            </div>
            <div class="info">
              {{ $t(bullet) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-center">
        <a
          class="footer-link"
          href="https://habitica.fandom.com/wiki/World_Bosses"
          target="_blank"
        >{{ $t('worldBossLink') }}</a>
      </div>
    </div>
  </b-modal>
</template>

<style>
  #world-boss-info .modal-body {
    padding: 0;
  }
</style>

<style scoped>
  .modal-header {
    background-image: linear-gradient(to right, #410f2a, #931f4d 50%, #410f2a);
    margin-bottom: .25em;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .modal-body {
    padding: 1.5em !important;
  }

  h2 {
    font-size: 24px;
    font-weight: bold;
    color: #931f4d;
  }

  p, .info {
    font-size: 16px;
    color: #4e4a57;
  }

  .info {
    max-width: 400px;
    margin-bottom: 1em;
  }

  .bullet-point {
    margin: 0 auto;
  }

  .check-icon {
    width: 32px;
    height: 32px;
    border-radius: 1000px;
    border: solid 2px #e1e0e3;
    margin-right: 1em;
  }

  .left-hearts, .right-hearts {
    background-size: 100%;
    margin: 1em;
    width: 109px;
    height: 70px;
  }

  .left-hearts {
    background-image: url('~@/assets/images/world-boss/left-hearts@3x.png');
  }

  .right-hearts {
    background-image: url('~@/assets/images/world-boss/right-hearts@3x.png');
  }

  .red-check {
    width: 15px;
    height: 10px;
    margin-top: 0.6em;
    margin-left: .5em;
  }

  .quest_dysheartener_modal, .phobia_dysheartener_modal {
    width: 219px;
    height: 120px;
    background-size: 100%;
  }

  .quest_dysheartener_modal {
    background-image: url('~@/assets/images/world-boss/mantis-static@3x.png');
  }

  .phobia_dysheartener_modal {
    display: none;
    background-image: url('~@/assets/images/world-boss/heart-translucent-shadow@3x.png');
  }

  .footer-link {
    color: #2995cd;
    margin-bottom: 1.5em;
    display: block;
  }
</style>

<script>
import redCheck from '@/assets/svg/check-red.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        redCheck,
      }),
      bullets: [
        'worldBossBullet1',
        'worldBossBullet2',
        'worldBossBullet3',
        'worldBossBullet4',
      ],
    };
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'world-boss-info');
    },
  },
};
</script>
